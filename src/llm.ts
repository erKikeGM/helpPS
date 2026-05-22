import type {
  AgentResponse,
  ApiKeys,
  AppConfig,
  ChatMessage,
  ProviderId,
  SafetyAssessment,
} from "./types";
import { providerCatalog } from "./data";

interface GenerateReplyInput {
  text: string;
  assessment: SafetyAssessment;
  config: AppConfig;
  apiKeys: ApiKeys;
  history: ChatMessage[];
}

interface GenerateReplyResult {
  text: string;
  roleId: string;
  provider: ProviderId;
  model: string;
}

const routeRole: Partial<Record<SafetyAssessment["route"], string>> = {
  normal_ai: "relief-coach",
  recovery_flow: "recovery-flow",
  low_burden_mitigation: "relief-coach",
  education: "content-delivery",
  human_support: "content-delivery",
  pathway_4: "safety-planner",
  pathway_6: "content-delivery",
};

export function canUseLiveModel(response: AgentResponse) {
  return !["resource_directory", "block_refuse"].includes(response.assessment.route);
}

export function getAvailableProviders(apiKeys: ApiKeys): ProviderId[] {
  return providerCatalog
    .filter((provider) => Boolean(apiKeys[provider.id]?.trim()))
    .map((provider) => provider.id);
}

export async function generateLiveReply({
  text,
  assessment,
  config,
  apiKeys,
  history,
}: GenerateReplyInput): Promise<GenerateReplyResult> {
  const roleId = routeRole[assessment.route] ?? "relief-coach";
  const roleConfig = config[roleId];
  if (!roleConfig?.enabled) {
    throw new Error("The selected response agent is disabled.");
  }

  const availableProviders = getAvailableProviders(apiKeys);
  const providerCandidates = [
    roleConfig.provider,
    ...availableProviders.filter((provider) => provider !== roleConfig.provider),
  ].filter((provider) => Boolean(apiKeys[provider]?.trim()));

  if (providerCandidates.length === 0) {
    throw new Error("No connected provider. Add an API key for OpenAI, Groq, or Gemini.");
  }

  const instructions = buildInstructions(assessment);
  const prompt = buildPrompt(text, assessment, history);
  const failures: string[] = [];

  for (const provider of providerCandidates) {
    const model =
      provider === roleConfig.provider
        ? roleConfig.model
        : providerCatalog.find((item) => item.id === provider)?.models[0]?.id ?? "";
    const apiKey = apiKeys[provider]?.trim();
    if (!apiKey) continue;

    try {
      if (provider === "openai") {
        return {
          roleId,
          provider,
          model,
          text: await callOpenAI({ apiKey, model, instructions, prompt }),
        };
      }

      if (provider === "groq") {
        return {
          roleId,
          provider,
          model,
          text: await callGroq({ apiKey, model, instructions, prompt }),
        };
      }

      return {
        roleId,
        provider,
        model,
        text: await callGemini({ apiKey, model, instructions, prompt }),
      };
    } catch (error) {
      failures.push(`${providerLabel(provider)}: ${error instanceof Error ? error.message : "request failed"}`);
    }
  }

  throw new Error(`No connected provider responded successfully. ${failures.join(" | ")}`);
}

function buildInstructions(assessment: SafetyAssessment) {
  return `
You are Safety Mind, a safety-first relationship support assistant for adults.

Your job is to feel like a calm human support conversation, not a diagnostic report and not a form. Respond naturally in 2-5 short paragraphs. Do not show internal labels, route names, classifier names, TOM/TON labels, or agent names to the user. Do not give the user a menu of options. Ask at most one gentle question at the end only when it clearly helps the next step.

Hard boundaries:
- You are not therapy, legal advice, diagnosis, crisis response, or a marriage-saving service.
- You only have one side of the story. Never diagnose, judge, or prove fault by the absent partner.
- Never minimize abuse, coercion, financial control, sexual coercion, child risk, self-harm, or imminent danger.
- Never help with surveillance, hacking, secret monitoring, evidence-package creation, custody/divorce evidence formatting, or partner data exposure.
- Do not encourage emotional dependency on AI or endless venting. Move from distress toward clarity, safe action, human support, or graduation.
- If safety risk is present, treat it as protection and support planning, not reframing.

Current safety context for your private use:
- Route: ${assessment.route}
- Severity: ${assessment.severity}
- TON: ${assessment.ton}
- Threat state: ${assessment.threatState}
- Modalities: ${assessment.modalities.join(", ")}
- Problem areas: ${assessment.problemAreas.join(", ")}
- Labels: ${assessment.labels.join(", ")}
- Couple tools allowed: ${assessment.coupleFeaturesAllowed ? "yes" : "no"}

Use Safety Mind gently:
- If safe and non-coercive, help separate facts from assumptions and choose one proportionate next step.
- If coercion or fear is present, avoid couple communication scripts and suggest private human support.
- If separation/legal stress is present, organize concerns without legal advice or evidence packaging.
- If crisis or imminent danger appears in the user content, tell them to seek urgent human support and keep the answer short.
`.trim();
}

function buildPrompt(text: string, assessment: SafetyAssessment, history: ChatMessage[]) {
  const recent = history
    .filter((message) => !message.pending)
    .slice(-8)
    .map((message) => `${message.from === "user" ? "User" : "Assistant"}: ${message.text}`)
    .join("\n\n");

  return `
Recent conversation:
${recent || "No previous conversation."}

Latest user message:
${text}

Write the next assistant message. It should sound like a real person: warm, direct, safe, and concise. Do not expose this private safety assessment; use it only to shape the response. The selected route is ${assessment.route}.
`.trim();
}

async function callOpenAI({
  apiKey,
  model,
  instructions,
  prompt,
}: {
  apiKey: string;
  model: string;
  instructions: string;
  prompt: string;
}) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      instructions,
      input: prompt,
      max_output_tokens: 700,
    }),
  });

  const data = (await parseJsonResponse(response)) as {
    output_text?: unknown;
    output?: Array<{ content?: Array<{ text?: unknown }> }>;
  };
  const outputText =
    typeof data.output_text === "string"
      ? data.output_text
      : data.output
          ?.flatMap((item) => item.content ?? [])
          .map((part) => part.text)
          .filter(Boolean)
          .join("\n");

  return requireText(outputText, "OpenAI");
}

async function callGroq({
  apiKey,
  model,
  instructions,
  prompt,
}: {
  apiKey: string;
  model: string;
  instructions: string;
  prompt: string;
}) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: prompt },
      ],
      temperature: 0.35,
      max_completion_tokens: 700,
    }),
  });

  const data = (await parseJsonResponse(response)) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  return requireText(data.choices?.[0]?.message?.content, "Groq");
}

async function callGemini({
  apiKey,
  model,
  instructions,
  prompt,
}: {
  apiKey: string;
  model: string;
  instructions: string;
  prompt: string;
}) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: instructions }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.35,
          maxOutputTokens: 700,
        },
      }),
    }
  );

  const data = (await parseJsonResponse(response)) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>;
  };
  const outputText = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("\n");

  return requireText(outputText, "Gemini");
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const message = readErrorMessage(data) ?? `HTTP ${response.status} ${response.statusText}`;
    throw new Error(String(message));
  }

  return data;
}

function readErrorMessage(data: Record<string, unknown>) {
  const error = data.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  if (typeof data.message === "string") return data.message;
  return undefined;
}

function requireText(value: unknown, provider: string) {
  if (typeof value === "string" && value.trim()) return value.trim();
  throw new Error(`${provider} returned no text.`);
}

function providerLabel(provider: ProviderId) {
  if (provider === "openai") return "OpenAI";
  if (provider === "groq") return "Groq";
  return "Gemini";
}
