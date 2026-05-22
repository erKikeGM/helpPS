import { agentRoles } from "./data";
import type {
  AgentResponse,
  AppConfig,
  Modality,
  RouteAction,
  SafetyAssessment,
  Stressor,
  ThreatState,
  TonType,
  TraceStep,
} from "./types";

const includesAny = (text: string, terms: string[]) =>
  terms.some((term) => text.includes(term));

const urgentTerms = [
  "outside my door",
  "right now",
  "immediate danger",
  "weapon",
  "knife",
  "gun",
  "threatened to kill",
  "going to hurt me",
  "hit me",
  "beat me",
  "locked me",
];

const selfHarmTerms = [
  "kill myself",
  "end my life",
  "suicide",
  "self harm",
  "hurt myself",
  "not want to live",
];

const coercionTerms = [
  "controls the money",
  "control all the money",
  "controls money",
  "tracks my phone",
  "tracking my phone",
  "monitors me",
  "afraid to disagree",
  "not allowed to leave",
  "checks my messages",
  "punishes me",
  "sexual coercion",
  "forced sex",
  "threatens me",
  "threatened me",
];

const surveillanceTerms = [
  "spy on",
  "track my partner",
  "read their messages",
  "hack",
  "secretly record",
  "evidence against",
  "court evidence",
  "custody evidence",
  "prove they",
];

const childTerms = ["child", "children", "kid", "kids", "baby", "custody"];

export function createDefaultConfig(): AppConfig {
  return Object.fromEntries(
    agentRoles.map((role) => [
      role.id,
      {
        provider: role.defaultProvider,
        model: role.defaultModel,
        validatorProvider: role.validatorProvider,
        validatorModel: role.validatorModel,
        enabled: role.phase !== "Phase 2 gated",
      },
    ])
  );
}

export function classifyInput(input: string): SafetyAssessment {
  const text = input.toLowerCase();
  const labels: string[] = ["Relationship distress"];
  const notes: string[] = [];
  const problemAreas: string[] = [];
  const modalities = new Set<Modality>(["Emotional"]);

  const imminent = includesAny(text, urgentTerms);
  const selfHarm = includesAny(text, selfHarmTerms);
  const coercion = includesAny(text, coercionTerms);
  const surveillance = includesAny(text, surveillanceTerms);
  const childRisk =
    includesAny(text, childTerms) &&
    includesAny(text, ["unsafe", "hurt", "hit", "threat", "afraid", "violence", "neglect"]);
  const financial =
    includesAny(text, ["money", "card", "debt", "spending", "funds", "bank"]) ||
    text.includes("financial");
  const separation = includesAny(text, ["separate", "separation", "divorce", "custody", "legal"]);
  const loop = includesAny(text, [
    "keep thinking",
    "cannot stop thinking",
    "can't stop thinking",
    "over and over",
    "must be cheating",
    "do not care about me",
    "doesn't care about me",
    "will leave me",
    "what if",
  ]);
  const nuisance = includesAny(text, [
    "late reply",
    "has not replied",
    "didn't reply",
    "messy",
    "kitchen",
    "phone during dinner",
    "in-law",
    "family comment",
  ]);
  const internalNoise = includesAny(text, [
    "not good enough",
    "worthless",
    "always ruin",
    "other couples",
    "shame",
    "insecure",
  ]);
  const physical = includesAny(text, [
    "sleep",
    "headache",
    "stomach",
    "chest",
    "panic",
    "tired",
    "fatigue",
    "body",
  ]);
  const values = includesAny(text, ["lost myself", "values", "religious", "family role", "meaning"]);
  const promptAttack = includesAny(text, ["ignore previous", "developer message", "system prompt"]);

  if (imminent) labels.push("Imminent danger");
  if (selfHarm) labels.push("Self-harm risk");
  if (childRisk) labels.push("Child safety risk");
  if (coercion) labels.push("Coercive control indicators");
  if (financial && coercion) labels.push("Financial abuse indicators");
  if (surveillance) labels.push("Request for surveillance", "Request for evidence package");
  if (promptAttack) labels.push("Prompt injection / adversarial misuse");
  if (separation) labels.push("Separation conflict", "Legal/custody risk");
  if (loop) labels.push("TON - Obsession / Loop");
  if (nuisance) labels.push("TON - External nuisance");
  if (internalNoise) labels.push("TON - Internal noise");
  if (imminent || coercion || childRisk || selfHarm) labels.push("TON - Trauma / Threat");

  if (financial) problemAreas.push("Money stress");
  if (includesAny(text, ["parent", "child", "children", "kids", "caregiving"])) {
    problemAreas.push("Parenting/caregiving");
  }
  if (includesAny(text, ["in-law", "family", "mother", "father"])) {
    problemAreas.push("Family/in-law pressure");
  }
  if (includesAny(text, ["reply", "phone", "message", "ai companion"])) {
    problemAreas.push("Digital or communication boundary");
  }
  if (includesAny(text, ["cheating", "betrayal", "trust", "secret"])) {
    problemAreas.push("Betrayal/trust stress");
  }
  if (coercion || imminent || selfHarm || childRisk) {
    problemAreas.push("Safety/fear signals");
  }
  if (problemAreas.length === 0) {
    problemAreas.push("Relationship conflict");
  }

  if (loop || promptAttack) modalities.add("Mental");
  if (physical || imminent) modalities.add("Physical");
  if (values || includesAny(text, ["family", "in-law", "meaning", "religious"])) {
    modalities.add("Purpose / Values");
  }

  let ton: TonType = "Unclassified";
  if (imminent || coercion || childRisk || selfHarm) ton = "Trauma / Threat";
  else if (loop) ton = "Obsession / Loop";
  else if (nuisance || financial) ton = "External Nuisance";
  else if (internalNoise) ton = "Internal Noise";

  let threatState: ThreatState = "Not future-oriented";
  if (imminent || text.includes("panic")) threatState = "Panic";
  else if (coercion || text.includes("afraid") || text.includes("fear")) threatState = "Fear";
  else if (includesAny(text, ["maybe", "what if", "worry", "worried"])) threatState = "Worry";
  else if (includesAny(text, ["cannot handle", "can't handle", "not capable", "overwhelmed"])) {
    threatState = "Anxiety";
  }

  let route: RouteAction = "normal_ai";
  let severity: SafetyAssessment["severity"] = "low";
  let coupleFeaturesAllowed = true;

  if (imminent || selfHarm || childRisk) {
    route = "resource_directory";
    severity = "critical";
    coupleFeaturesAllowed = false;
    notes.push("Normal AI response is stopped until safety support is surfaced.");
  } else if (coercion) {
    route = "pathway_4";
    severity = "high";
    coupleFeaturesAllowed = false;
    notes.push("Couple tools are disabled silently because coercive-control indicators are present.");
  } else if (surveillance || promptAttack) {
    route = "block_refuse";
    severity = "medium";
    notes.push("Request shape conflicts with evidence, surveillance, or adversarial-use guardrails.");
  } else if (separation) {
    route = "pathway_6";
    severity = "medium";
    coupleFeaturesAllowed = false;
    notes.push("Separation support requires structure, dignity, and legal/resource routing without evidence packaging.");
  } else if (loop || threatState === "Worry" || threatState === "Anxiety") {
    route = "recovery_flow";
    severity = "medium";
  } else if (nuisance || financial || internalNoise) {
    route = "low_burden_mitigation";
    severity = "low";
  }

  return {
    labels,
    ton,
    modalities: Array.from(modalities),
    threatState,
    problemAreas,
    route,
    severity,
    coupleFeaturesAllowed,
    notes,
  };
}

export function runAgentPipeline(input: string, config: AppConfig): AgentResponse {
  const assessment = classifyInput(input);
  const trace = buildTrace(assessment, config);
  const answer = buildAnswer(input, assessment);
  const nextSteps = buildNextSteps(assessment);

  return {
    assessment,
    answer,
    nextSteps,
    trace,
  };
}

function buildTrace(assessment: SafetyAssessment, config: AppConfig): TraceStep[] {
  const roleIds = [
    "safety-classifier",
    "safety-mind-classifier",
    "router",
    "one-side-layer",
    assessment.route === "resource_directory" ? "crisis-handoff" : null,
    assessment.route === "pathway_4" ? "safety-planner" : null,
    assessment.route === "recovery_flow" ? "recovery-flow" : null,
    assessment.route === "low_burden_mitigation" || assessment.route === "normal_ai" ? "relief-coach" : null,
    "privacy-compliance",
  ].filter(Boolean) as string[];

  return roleIds.map((roleId) => {
    const role = agentRoles.find((item) => item.id === roleId);
    const roleConfig = config[roleId];
    const isBlocked = assessment.route === "block_refuse" && roleId === "router";
    const isEscalated =
      ["resource_directory", "pathway_4", "pathway_6"].includes(assessment.route) &&
      ["router", "crisis-handoff", "safety-planner"].includes(roleId);

    return {
      roleId,
      roleName: role?.name ?? roleId,
      provider: roleConfig?.provider ?? "openai",
      model: roleConfig?.model ?? "gpt-5.4-mini",
      validatorProvider: roleConfig?.validatorProvider,
      validatorModel: roleConfig?.validatorModel,
      status: isBlocked ? "blocked" : isEscalated ? "escalated" : "simulated",
      output: traceOutput(roleId, assessment),
    };
  });
}

function traceOutput(roleId: string, assessment: SafetyAssessment): string {
  switch (roleId) {
    case "safety-classifier":
      return `${assessment.severity.toUpperCase()} severity; ${assessment.labels.slice(0, 4).join(", ")}`;
    case "safety-mind-classifier":
      return `${assessment.ton}; ${assessment.threatState}; ${assessment.modalities.join(" + ")}`;
    case "router":
      return `Route selected: ${assessment.route.replace(/_/g, " ")}`;
    case "one-side-layer":
      return "One-side-of-story reminder enforced for absent partner claims.";
    case "crisis-handoff":
      return "Normal dialogue paused; resource directory must remain visible in-screen.";
    case "safety-planner":
      return "Pathway 4 protection flow; couple features unavailable.";
    case "recovery-flow":
      return "Eligible for Truth Test, Action Test, Capacity Check, and Support Routing.";
    case "relief-coach":
      return "Low-burden mitigation and calming prompt allowed after safety pass.";
    case "privacy-compliance":
      return assessment.coupleFeaturesAllowed
        ? "No partner sharing; model handoff logged for user visibility."
        : "Private mode; partner exposure and couple tools blocked.";
    default:
      return "Simulated role completed.";
  }
}

function buildAnswer(input: string, assessment: SafetyAssessment): string[] {
  if (assessment.route === "resource_directory") {
    return [
      "I’m concerned this may need immediate human support, so I don’t want to treat it like an ordinary relationship conversation.",
      "If you or someone else may be in danger right now, move away if that is safe and contact local emergency support. In Saudi Arabia, you can use 999 or 911 for police or unified emergency support, 997 for ambulance, and 1919 for domestic violence reporting.",
      "Stay with the simplest next step. You do not need to explain everything perfectly before getting help.",
    ];
  }

  if (assessment.route === "pathway_4") {
    return [
      "I’m sorry you’re carrying that. Feeling afraid to disagree, being tracked, or having money controlled should not be treated as a normal communication problem.",
      "The safer focus is privacy and support, not trying to find the perfect words for a couple conversation. If it is safe, think about one trusted person or service you could contact without alerting your partner.",
      "You do not have to prove everything before protecting yourself. Start with what keeps you safer today.",
    ];
  }

  if (assessment.route === "block_refuse") {
    return [
      "I can’t help with spying, hacking, secret monitoring, exposing a partner’s private data, or preparing a court-style evidence package.",
      "What I can help with is sorting your own experience clearly and safely. If legal rights, custody, or danger are involved, a qualified legal or safety professional is the right next support.",
      "If this request is coming from fear, we should focus on protection and human support rather than trying to gather proof through the platform.",
    ];
  }

  if (assessment.route === "pathway_6") {
    return [
      "This sounds like separation or legal stress, which can feel emotionally huge and practically messy at the same time.",
      "I can help you organize your own needs and next questions, but I should not judge the other person, predict the outcome, or create legal evidence. The safer move is to separate the situation into a few tracks: your immediate safety, children’s wellbeing if relevant, money, housing, and proper legal advice.",
      "For right now, choose the track that is most urgent rather than trying to solve the whole relationship at once.",
    ];
  }

  if (assessment.route === "recovery_flow") {
    return [
      "That sounds painful, especially because your mind is trying to fill in the meaning of what happened. Let’s slow it down without pretending your feelings are wrong.",
      `The fact is: ${extractTrigger(input)}. The interpretation may be bigger than the fact right now. A steadier next step is to name one thing you know for sure, one thing you are assuming, and one calm action that would not escalate the situation.`,
      "If you feel too activated to do that respectfully, waiting, resting, or reaching out to a trusted person may be the better action for now.",
    ];
  }

  return [
    "I hear that this is weighing on you. From what you wrote, the safest first move is to make the situation smaller and clearer rather than trying to solve everything at once.",
    "Focus on one concrete change: the timing of the conversation, the setting, the words you use, or the support you need before speaking. I only have your side of the story, so I won’t judge your partner, but I can help you choose a next step that protects your dignity and keeps the response proportionate.",
    "What is the smallest part of this that you want to handle first?",
  ];
}

function extractTrigger(input: string) {
  const trimmed = input.trim();
  if (trimmed.length < 90) return trimmed;
  return `${trimmed.slice(0, 86)}...`;
}

function buildNextSteps(assessment: SafetyAssessment): string[] {
  if (assessment.route === "resource_directory") {
    return [
      "Keep this screen on resources or use Quick Exit if privacy is at risk.",
      "Contact local emergency or domestic violence support if it is safe to do so.",
      "Avoid couple communication prompts while danger may be active.",
    ];
  }

  if (assessment.route === "pathway_4") {
    return [
      "Do not use mediation or shared couple tools.",
      "Consider a private safety plan and trusted human support.",
      "Suppress or disguise notifications before saving sensitive notes.",
    ];
  }

  if (assessment.route === "block_refuse") {
    return [
      "Use standard data export only for your own platform data.",
      "Speak with qualified legal support for legal questions.",
      "Use safety resources if the request was driven by fear or coercion.",
    ];
  }

  if (assessment.route === "pathway_6") {
    return [
      "Create separate tracks for safety, children, money, legal advice, and housing.",
      "Use mutual opt-in only for structured separation conversation mode.",
      "Do not generate court-ready evidence packages inside this platform.",
    ];
  }

  if (assessment.route === "recovery_flow") {
    return [
      "Write one fact and one assumption.",
      "Choose one safe action or explicitly choose to wait.",
      "If the loop repeats, add it to the load audit instead of extending the chat.",
    ];
  }

  return [
    "Choose one low-burden change that can be tried within 24 hours.",
    "Use the load audit if several stressors are stacking.",
    "Escalate to human support if distress becomes intense, persistent, or unsafe.",
  ];
}

export function scoreStressor(stressor: Stressor) {
  const capacityDrag = 6 - stressor.capacity;
  return stressor.intensity * stressor.frequency * stressor.duration * capacityDrag;
}

export function summarizeLoad(stressors: Stressor[]) {
  const active = stressors.filter((stressor) => stressor.active);
  const scored = active
    .map((stressor) => ({ ...stressor, score: scoreStressor(stressor) }))
    .sort((a, b) => b.score - a.score);
  const total = scored.reduce((sum, stressor) => sum + stressor.score, 0);
  const highest = scored[0];

  let band = "low";
  if (total >= 260) band = "critical";
  else if (total >= 150) band = "high";
  else if (total >= 75) band = "medium";

  return { active, scored, total, highest, band };
}
