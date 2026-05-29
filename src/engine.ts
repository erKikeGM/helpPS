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
      "I’m worried this may need immediate human support. If you or someone else could be hurt right now, move away if that is safe and contact emergency help.",
      "In Saudi Arabia, you can use 999 or 911 for police or unified emergency support, 997 for ambulance, and 1919 for domestic violence reporting. I’ll stay focused on safety until the immediate risk is lower.",
    ];
  }

  if (assessment.route === "pathway_4") {
    return [
      "I’m taking the fear or control part seriously. This is not something to solve with a better message or a couple exercise.",
      "For now, protect your privacy and bring in safe human support if you can. Who could know what is happening without it getting back to your partner?",
    ];
  }

  if (assessment.route === "block_refuse") {
    return [
      "I can’t help you spy, hack accounts, secretly record, expose private data, or build a court-style evidence file.",
      "I can stay with what this is doing to you and help you choose a safe next step. What made this feel urgent today?",
    ];
  }

  if (assessment.route === "pathway_6") {
    return [
      "That is a lot to carry, emotionally and practically. I can help you get organized without turning this into legal advice or a case file.",
      "Start with the part that needs attention today. Is it safety, children, money, housing, or getting qualified legal guidance?",
    ];
  }

  if (assessment.route === "recovery_flow") {
    return [
      `${openingLine(input, assessment)} Let’s slow it down without pretending it does not matter.`,
      `For this moment, treat ${describeConcern(input, assessment)} as the signal, not the whole story. What do you know for sure, and what is the part your mind is filling in?`,
    ];
  }

  if (assessment.route === "low_burden_mitigation") {
    return [
      "This sounds like the kind of friction that gets heavier when it keeps repeating. You do not have to solve the whole relationship from this moment.",
      "Let’s make the next step small and respectful. What would reduce the pressure by 10% today without creating a bigger conflict?",
    ];
  }

  if (assessment.ton === "Internal Noise") {
    return [
      "That sounds like it landed on how you see yourself, not only on what happened between you two.",
      "Before accepting the harsh verdict, separate the event from the meaning your mind is adding. What happened, and what are you telling yourself it means about you?",
    ];
  }

  return [
    "I’m with you. Something in this touched a need for safety, respect, closeness, or fairness.",
    "Before deciding what to say, let’s make the picture clearer. What happened, and what did it make you afraid might be true?",
  ];
}

function openingLine(input: string, assessment: SafetyAssessment) {
  const text = input.toLowerCase();

  if (includesAny(text, ["late reply", "has not replied", "didn't reply", "reply", "message"])) {
    return "Silence can start to feel like rejection when your mind has to fill in the gap.";
  }

  if (includesAny(text, ["money", "card", "debt", "spending", "bank", "financial"])) {
    return "Money pressure can turn a practical problem into fear very quickly.";
  }

  if (includesAny(text, ["cheating", "betrayal", "trust", "secret"])) {
    return "Trust worries can get loud fast when there is uncertainty.";
  }

  if (includesAny(text, ["in-law", "family", "mother", "father"])) {
    return "Family pressure can hit deeper than the one conversation in front of you.";
  }

  if (assessment.threatState === "Worry") {
    return "Worry can fill the gaps very quickly when you do not have enough information.";
  }

  if (assessment.threatState === "Anxiety") {
    return "This sounds heavy, especially if part of you is wondering whether you can handle it.";
  }

  if (assessment.modalities.includes("Physical")) {
    return "Your body sounds activated, so we should make the next minute simpler.";
  }

  return "That sounds painful.";
}

function describeConcern(input: string, assessment: SafetyAssessment) {
  const text = input.toLowerCase();

  if (includesAny(text, ["late reply", "has not replied", "didn't reply", "reply", "message"])) {
    return "the missing reply";
  }

  if (includesAny(text, ["money", "card", "debt", "spending", "bank", "financial"])) {
    return "the money pressure";
  }

  if (includesAny(text, ["in-law", "family", "mother", "father"])) {
    return "the family pressure";
  }

  if (includesAny(text, ["cheating", "betrayal", "trust", "secret"])) {
    return "the trust concern";
  }

  if (includesAny(text, ["child", "children", "kid", "kids", "baby", "parenting"])) {
    return "the parenting pressure";
  }

  if (assessment.problemAreas[0]) {
    return assessment.problemAreas[0].toLowerCase();
  }

  return "what happened";
}

function buildNextSteps(assessment: SafetyAssessment): string[] {
  if (assessment.route === "resource_directory") {
    return [
      "Keep resources visible or press Escape if privacy is at risk.",
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
      "Name the fact without adding a verdict.",
      "Name the story your mind is building around it.",
      "Choose one safe action, or choose to wait on purpose.",
    ];
  }

  return [
    "Choose one small change that can be tried within 24 hours.",
    "Use the load audit if several pressures are stacking.",
    "Bring in human support if distress becomes intense, persistent, or unsafe.",
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
