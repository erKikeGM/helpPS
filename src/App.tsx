import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Bot,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileWarning,
  Gauge,
  HeartPulse,
  KeyRound,
  Lock,
  MessageSquareText,
  Mic,
  Moon,
  PanelLeft,
  RotateCcw,
  Send,
  Settings2,
  Shield,
  ShieldAlert,
  Sparkles,
  Sun,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  agentRoles,
  defaultStressors,
  ksaResources,
  providerCatalog,
  validatorInventory,
} from "./data";
import {
  createDefaultConfig,
  runAgentPipeline,
  scoreStressor,
  summarizeLoad,
} from "./engine";
import {
  canUseLiveModel,
  generateLiveReply,
  getAvailableProviders,
  getVoiceReadyProviders,
} from "./llm";
import type {
  AgentResponse,
  ApiKeys,
  AppConfig,
  ChatMessage,
  ProviderId,
  RoleConfig,
  RouteAction,
  Stressor,
  TraceStep,
} from "./types";

type TabId = "chat" | "load" | "admin" | "evidence";
type Theme = "light" | "dark";

const routeLabels: Record<RouteAction, string> = {
  normal_ai: "Conversation support",
  recovery_flow: "Recovery flow",
  education: "Education",
  low_burden_mitigation: "Low-burden mitigation",
  human_support: "Human support",
  resource_directory: "Resource directory",
  block_refuse: "Refusal",
  quick_exit_prompt: "Privacy prompt",
  crisis_disclaimer: "Crisis disclaimer",
  pathway_4: "Protection support",
  pathway_6: "Separation support",
  admin_review: "Admin review",
};

function loadJsonState<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function useStoredState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => loadJsonState(key, fallback));

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

const providerById = Object.fromEntries(providerCatalog.map((provider) => [provider.id, provider]));
const localProviderLabel = "Local guardrail";
const providerPriorityFallback: ProviderId[] = ["openai", "gemini", "groq"];

function hasProviderKey(apiKeys: ApiKeys, provider: ProviderId) {
  return Boolean(apiKeys[provider]?.trim());
}

function providerLabel(provider: TraceStep["provider"]) {
  return provider === "local" ? localProviderLabel : providerById[provider].label;
}

const providerModelByRole: Record<ProviderId, Record<string, string>> = {
  openai: {
    "safety-classifier": "gpt-5.4-nano",
    "safety-mind-classifier": "gpt-5.4-mini",
    router: "gpt-5.4-mini",
    "one-side-layer": "gpt-5.4-nano",
    "relief-coach": "gpt-5.4-mini",
    "recovery-flow": "gpt-5.5",
    "load-audit": "gpt-5.4-mini",
    "content-delivery": "gpt-5.4",
    "safety-planner": "gpt-5.5",
    "crisis-handoff": "gpt-5.4-nano",
    "privacy-compliance": "gpt-5.5",
    "couple-mediation": "gpt-5.5",
  },
  groq: {
    "safety-classifier": "openai/gpt-oss-safeguard-20b",
    "safety-mind-classifier": "openai/gpt-oss-20b",
    router: "openai/gpt-oss-120b",
    "one-side-layer": "openai/gpt-oss-safeguard-20b",
    "relief-coach": "llama-3.3-70b-versatile",
    "recovery-flow": "openai/gpt-oss-120b",
    "load-audit": "openai/gpt-oss-20b",
    "content-delivery": "llama-3.3-70b-versatile",
    "safety-planner": "openai/gpt-oss-120b",
    "crisis-handoff": "openai/gpt-oss-safeguard-20b",
    "privacy-compliance": "openai/gpt-oss-120b",
    "couple-mediation": "openai/gpt-oss-120b",
  },
  gemini: {
    "safety-classifier": "gemini-3.1-flash-lite",
    "safety-mind-classifier": "gemini-2.5-flash",
    router: "gemini-3.5-flash",
    "one-side-layer": "gemini-3.1-flash-lite",
    "relief-coach": "gemini-2.5-flash",
    "recovery-flow": "gemini-2.5-pro",
    "load-audit": "gemini-2.5-flash",
    "content-delivery": "gemini-2.5-pro",
    "safety-planner": "gemini-3.1-pro-preview",
    "crisis-handoff": "gemini-3.1-flash-lite",
    "privacy-compliance": "gemini-2.5-pro",
    "couple-mediation": "gemini-3.1-pro-preview",
  },
};

const providerValidatorModelByRole: Partial<Record<ProviderId, Record<string, string>>> = {
  groq: {
    "safety-classifier": "llama-3.3-70b-versatile",
    "safety-mind-classifier": "qwen/qwen3-32b",
    router: "openai/gpt-oss-20b",
    "one-side-layer": "meta-llama/llama-prompt-guard-2-86m",
    "relief-coach": "openai/gpt-oss-20b",
    "recovery-flow": "llama-3.3-70b-versatile",
    "load-audit": "qwen/qwen3-32b",
    "content-delivery": "allam-2-7b",
    "safety-planner": "openai/gpt-oss-safeguard-20b",
    "crisis-handoff": "llama-3.1-8b-instant",
    "privacy-compliance": "openai/gpt-oss-safeguard-20b",
    "couple-mediation": "openai/gpt-oss-safeguard-20b",
  },
};

const bestProviderByRole: Record<string, ProviderId[]> = {
  "safety-classifier": ["openai", "groq", "gemini"],
  "safety-mind-classifier": ["gemini", "openai", "groq"],
  router: ["openai", "groq", "gemini"],
  "one-side-layer": ["groq", "openai", "gemini"],
  "relief-coach": ["openai", "gemini", "groq"],
  "recovery-flow": ["openai", "gemini", "groq"],
  "load-audit": ["gemini", "openai", "groq"],
  "content-delivery": ["groq", "gemini", "openai"],
  "safety-planner": ["openai", "gemini", "groq"],
  "crisis-handoff": ["groq", "openai", "gemini"],
  "privacy-compliance": ["gemini", "openai", "groq"],
  "couple-mediation": ["openai", "gemini", "groq"],
};

function providerDefaultModel(provider: ProviderId) {
  return providerById[provider].models[0]?.id ?? "";
}

function modelForRole(provider: ProviderId, roleId: string) {
  return providerModelByRole[provider][roleId] ?? providerDefaultModel(provider);
}

function validatorModelForRole(provider: ProviderId, roleId: string) {
  return providerValidatorModelByRole[provider]?.[roleId] ?? modelForRole(provider, roleId);
}

function chooseBestProvider(roleId: string, availableProviders: ProviderId[]) {
  const priority = bestProviderByRole[roleId] ?? providerPriorityFallback;
  return priority.find((provider) => availableProviders.includes(provider)) ?? availableProviders[0] ?? "openai";
}

function chooseValidatorProvider(primaryProvider: ProviderId, roleId: string, availableProviders: ProviderId[]) {
  const priority = bestProviderByRole[roleId] ?? providerPriorityFallback;
  return (
    priority.find((provider) => provider !== primaryProvider && availableProviders.includes(provider)) ??
    availableProviders.find((provider) => provider !== primaryProvider) ??
    primaryProvider
  );
}

function buildAutoConfig(availableProviders: ProviderId[], singleProvider?: ProviderId): AppConfig {
  return Object.fromEntries(
    agentRoles.map((role) => {
      const provider = singleProvider ?? chooseBestProvider(role.id, availableProviders);
      const validatorProvider = singleProvider ?? chooseValidatorProvider(provider, role.id, availableProviders);

      return [
        role.id,
        {
          provider,
          model: modelForRole(provider, role.id),
          validatorProvider,
          validatorModel: validatorModelForRole(validatorProvider, role.id),
          enabled: role.phase !== "Phase 2 gated",
        },
      ];
    })
  ) as AppConfig;
}

function constrainToAvailableProviders(response: AgentResponse, apiKeys: ApiKeys): AgentResponse {
  return {
    ...response,
    trace: response.trace.map((step) => {
      const providerAvailable =
        step.provider === "local" || hasProviderKey(apiKeys, step.provider);
      const validatorAvailable =
        step.validatorProvider && hasProviderKey(apiKeys, step.validatorProvider);

      return {
        ...step,
        provider: providerAvailable ? step.provider : "local",
        model: providerAvailable ? step.model : "local-safety-check",
        validatorProvider: validatorAvailable ? step.validatorProvider : undefined,
        validatorModel: validatorAvailable ? step.validatorModel : undefined,
        output: providerAvailable
          ? step.output
          : "Local safety precheck used because this provider is not connected.",
      };
    }),
  };
}

function markLiveResponse(
  response: AgentResponse,
  liveReply: { text: string; roleId: string; provider: ProviderId; model: string }
): AgentResponse {
  return {
    ...response,
    answer: [liveReply.text],
    answeredBy: {
      roleId: liveReply.roleId,
      provider: liveReply.provider,
      model: liveReply.model,
      mode: "live",
    },
    trace: response.trace.map((step) =>
      step.roleId === liveReply.roleId
        ? {
            ...step,
            provider: liveReply.provider,
            model: liveReply.model,
            status: "live",
            output: "Live model response generated after safety routing.",
          }
        : step
    ),
  };
}

function markFallbackResponse(response: AgentResponse, modelError: string): AgentResponse {
  return {
    ...response,
    answeredBy: {
      roleId: "local-safety-fallback",
      provider: "local",
      model: "local-guardrail",
      mode: "local",
    },
    modelError,
    trace: response.trace.map((step) =>
      ["router", "recovery-flow", "relief-coach", "safety-planner", "content-delivery"].includes(step.roleId)
        ? {
            ...step,
            status: step.status === "blocked" || step.status === "escalated" ? step.status : "fallback",
            output:
              step.status === "blocked" || step.status === "escalated"
                ? step.output
                : "Local safety fallback used because the selected model was unavailable.",
          }
        : step
    ),
  };
}

function App() {
  const [activeTab, setActiveTab] = useState<TabId>("chat");
  const [input, setInput] = useState("");
  const [disguised, setDisguised] = useState(false);
  const [config, setConfig] = useStoredState<AppConfig>("safety-mind-config-v2", createDefaultConfig());
  const [apiKeys, setApiKeys] = useStoredState<ApiKeys>("safety-mind-api-keys", {});
  const [stressors, setStressors] = useStoredState<Stressor[]>("safety-mind-load", defaultStressors);
  const [theme, setTheme] = useStoredState<Theme>("safety-mind-theme", "light");
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      from: "assistant",
      text:
        "I’m here. Tell me what happened in your own words, including whether anyone may be unsafe right now.",
    },
  ]);

  const latestResponse = [...messages].reverse().find((message) => message.response)?.response;
  const voiceReadyProviders = getVoiceReadyProviders(apiKeys);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDisguised(true);
        document.title = "Daily Schedule";
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function returnToApp() {
    setDisguised(false);
    document.title = "Safety Mind Platform";
  }

  function toggleTheme() {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }

  async function submitMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), from: "user", text: trimmed };
    const pendingId = crypto.randomUUID();
    const history = [...messages, userMessage];
    const localResponse = constrainToAvailableProviders(runAgentPipeline(trimmed, config), apiKeys);

    setIsThinking(true);
    setInput("");
    setActiveTab("chat");
    setMessages((current) => [
      ...current,
      userMessage,
      {
        id: pendingId,
        from: "assistant",
        text: "I’m taking this in.",
        response: localResponse,
        pending: true,
      },
    ]);

    let finalResponse = localResponse;

    if (canUseLiveModel(localResponse)) {
      try {
        const liveReply = await generateLiveReply({
          text: trimmed,
          assessment: localResponse.assessment,
          config,
          apiKeys,
          history,
        });
        finalResponse = markLiveResponse(localResponse, liveReply);
      } catch (error) {
        finalResponse = markFallbackResponse(
          localResponse,
          error instanceof Error ? error.message : "The selected model could not be reached."
        );
      }
    } else {
      finalResponse = {
        ...localResponse,
        answeredBy: {
          roleId: localResponse.assessment.route === "block_refuse" ? "router" : "crisis-handoff",
          provider: "local",
          model: "local-guardrail",
          mode: "local",
        },
      };
    }

    setMessages((current) =>
      current.map((message) =>
        message.id === pendingId
          ? {
              ...message,
              text: finalResponse.answer.join("\n\n"),
              response: finalResponse,
              pending: false,
            }
          : message
      )
    );
    setIsThinking(false);
  }

  function resetPrototype() {
    setMessages([
      {
        id: "welcome-reset",
        from: "assistant",
        text: "We can start fresh. Tell me what is happening now, in your own words.",
      },
    ]);
  }

  if (disguised) {
    return <NeutralScreen onReturn={returnToApp} />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <div className="brand-lockup">
          <div className="brand-mark">
            <Shield size={22} aria-hidden />
          </div>
          <div>
            <p className="eyebrow">Safety Mind</p>
            <h1>Pains & Gains</h1>
          </div>
        </div>

        <nav className="nav-stack">
          <NavButton
            active={activeTab === "chat"}
            icon={<MessageSquareText size={18} />}
            label="Relief Chat"
            onClick={() => setActiveTab("chat")}
          />
          <NavButton
            active={activeTab === "load"}
            icon={<Gauge size={18} />}
            label="Load Audit"
            onClick={() => setActiveTab("load")}
          />
          <NavButton
            active={activeTab === "admin"}
            icon={<Settings2 size={18} />}
            label="Admin Console"
            onClick={() => setActiveTab("admin")}
          />
          <NavButton
            active={activeTab === "evidence"}
            icon={<ClipboardList size={18} />}
            label="Safety Evidence"
            onClick={() => setActiveTab("evidence")}
          />
        </nav>

        <div className="phase-card">
          <p className="eyebrow">Phase Gate</p>
          <strong>Phase 1 Individual Mode</strong>
          <span>Couple tooling is visible but gated until safety review passes.</span>
        </div>
      </aside>

      <main className="workspace">
        <TopBar latestResponse={latestResponse} theme={theme} toggleTheme={toggleTheme} />
        {activeTab === "chat" && (
          <ChatView
            input={input}
            setInput={setInput}
            messages={messages}
            submitMessage={submitMessage}
            resetPrototype={resetPrototype}
            latestResponse={latestResponse}
            isThinking={isThinking}
            voiceReady={voiceReadyProviders.length > 0}
          />
        )}
        {activeTab === "load" && (
          <LoadAuditView stressors={stressors} setStressors={setStressors} />
        )}
        {activeTab === "admin" && (
          <AdminConsole
            config={config}
            setConfig={setConfig}
            apiKeys={apiKeys}
            setApiKeys={setApiKeys}
          />
        )}
        {activeTab === "evidence" && (
          <SafetyEvidence latestResponse={latestResponse} />
        )}
      </main>
    </div>
  );
}

function NeutralScreen({ onReturn }: { onReturn: () => void }) {
  const items = [
    ["09:00", "Project review"],
    ["11:30", "Supplier call"],
    ["14:00", "Budget check"],
    ["17:15", "Pickup reminder"],
  ];

  return (
    <main className="neutral-page">
      <section className="neutral-panel" aria-label="Daily schedule">
        <p className="eyebrow">Daily Schedule</p>
        <h1>Today</h1>
        <div className="schedule-list">
          {items.map(([time, label]) => (
            <div className="schedule-row" key={time}>
              <span>{time}</span>
              <strong>{label}</strong>
            </div>
          ))}
        </div>
        <button className="text-return" type="button" onClick={onReturn}>
          Open tools
        </button>
      </section>
    </main>
  );
}

function NavButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={`nav-button ${active ? "active" : ""}`} type="button" onClick={onClick}>
      {icon}
      <span>{label}</span>
      <ChevronRight size={16} aria-hidden />
    </button>
  );
}

function TopBar({
  latestResponse,
  theme,
  toggleTheme,
}: {
  latestResponse?: AgentResponse;
  theme: Theme;
  toggleTheme: () => void;
}) {
  const route = latestResponse?.assessment.route;

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Private support</p>
        <h2>Talk it through</h2>
      </div>
      <div className="topbar-actions">
        <button
          className="theme-toggle"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          <span>{theme === "dark" ? "Light" : "Dark"}</span>
        </button>
        <div className="topbar-metrics" aria-label="Current safety state">
          <MetricPill
            icon={<ShieldAlert size={16} />}
            label="Status"
            value={route ? userModeLabel(route) : "Protected"}
            tone="locked"
          />
        </div>
      </div>
    </header>
  );
}

function userModeLabel(route: RouteAction) {
  if (route === "resource_directory") return "Immediate support";
  if (route === "pathway_4") return "Protection first";
  if (route === "pathway_6") return "Organize the next step";
  if (route === "block_refuse") return "Keep it safe";
  if (route === "recovery_flow") return "Slow the loop";
  if (route === "low_burden_mitigation") return "Reduce the pressure";
  return "Understand the problem";
}

function safetyCheckLabel(severity: AgentResponse["assessment"]["severity"]) {
  if (severity === "critical") return "Needs urgent help";
  if (severity === "high") return "Protection first";
  if (severity === "medium") return "Stay careful";
  return "No immediate risk found";
}

function supportPaceLabel(assessment: AgentResponse["assessment"]) {
  if (assessment.route === "resource_directory") return "Get human help now";
  if (assessment.route === "pathway_4") return "Privacy before repair";
  if (assessment.route === "pathway_6") return "Handle only today";
  if (assessment.route === "recovery_flow") return "Fact, fear, next step";
  if (assessment.route === "low_burden_mitigation") return "One small reduction";
  return "Clarify before acting";
}

function supportNote(route: RouteAction) {
  if (route === "resource_directory") {
    return "I’m keeping this focused on immediate human support, not relationship analysis.";
  }

  if (route === "pathway_4") {
    return "Couple prompts stay off while fear, control, or privacy risk may be present.";
  }

  if (route === "block_refuse") {
    return "I can help with your wellbeing and next step, not monitoring, hacking, or evidence building.";
  }

  if (route === "pathway_6") {
    return "I can help organize what matters today; legal decisions need qualified guidance.";
  }

  return "";
}

function MetricPill({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className={`metric-pill ${tone ?? ""}`}>
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ChatView({
  input,
  setInput,
  messages,
  submitMessage,
  resetPrototype,
  latestResponse,
  isThinking,
  voiceReady,
}: {
  input: string;
  setInput: (value: string) => void;
  messages: ChatMessage[];
  submitMessage: (text?: string) => void | Promise<void>;
  resetPrototype: () => void;
  latestResponse?: AgentResponse;
  isThinking: boolean;
  voiceReady: boolean;
}) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    messagesEndRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "end",
    });
  }, [messages]);

  return (
    <section className="content-grid chat-grid">
      <div className="chat-panel">
        <div className="panel-heading">
          <div className="panel-heading-copy">
            <p className="eyebrow">Relief chat</p>
            <h3>Tell me what happened</h3>
            <div className="chat-status-row" aria-label="Conversation safeguards">
              <span>
                <Shield size={14} />
                Private
              </span>
              <span>
                <HeartPulse size={14} />
                Safety first
              </span>
              {voiceReady && (
                <span>
                  <Mic size={14} />
                  Voice ready
                </span>
              )}
            </div>
          </div>
          <button className="icon-button" type="button" onClick={resetPrototype} aria-label="Reset chat">
            <RotateCcw size={17} />
          </button>
        </div>

        <div className="message-list" aria-live="polite">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} aria-hidden />
        </div>

        <form
          className="composer"
          onSubmit={(event) => {
            event.preventDefault();
            submitMessage();
          }}
        >
          <label className="sr-only" htmlFor="problem-input">
            Describe the relationship problem
          </label>
          <textarea
            id="problem-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submitMessage();
              }
            }}
            placeholder="Tell me what happened..."
            rows={4}
            disabled={isThinking}
          />
          {voiceReady && (
            <button
              className="voice-button"
              type="button"
              aria-label="Voice input available"
              title="Voice input available"
            >
              <Mic size={18} />
            </button>
          )}
          <button type="submit" disabled={isThinking}>
            {isThinking ? <Sparkles size={18} /> : <Send size={18} />}
            {isThinking ? "..." : "Send"}
          </button>
        </form>
      </div>

      <aside className="insight-panel">
        <SafetySnapshot response={latestResponse} />
        <ResourceDirectory visible={latestResponse?.assessment.route === "resource_directory" || latestResponse?.assessment.route === "pathway_4"} />
      </aside>
    </section>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  return (
    <article className={`message-bubble ${message.from} ${message.pending ? "pending" : ""}`}>
      <div className="message-avatar" aria-hidden>
        {message.from === "user" ? <PanelLeft size={16} /> : <Bot size={17} />}
      </div>
      <div className="message-body">
        {message.text.split("\n\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}

function SafetySnapshot({ response }: { response?: AgentResponse }) {
  if (!response) {
    return (
      <div className="panel-block">
        <p className="eyebrow">Conversation guide</p>
        <h3>Start wherever you are</h3>
        <p>
          I’ll check for immediate risk first, then help you slow the problem down into
          what happened, what it means, and what can safely happen next.
        </p>
      </div>
    );
  }

  const note = supportNote(response.assessment.route);

  return (
    <div className="panel-block">
      <p className="eyebrow">Conversation guide</p>
      <h3>{userModeLabel(response.assessment.route)}</h3>
      <dl className="snapshot-list">
        <div>
          <dt>Safety</dt>
          <dd>{safetyCheckLabel(response.assessment.severity)}</dd>
        </div>
        <div>
          <dt>Focus</dt>
          <dd>{response.assessment.problemAreas[0] ?? "Relationship support"}</dd>
        </div>
        <div>
          <dt>Pace</dt>
          <dd>{supportPaceLabel(response.assessment)}</dd>
        </div>
        <div>
          <dt>Privacy</dt>
          <dd>{response.assessment.coupleFeaturesAllowed ? "Individual only" : "Protected"}</dd>
        </div>
      </dl>
      {note && (
        <div className="note-stack">
          <p>{note}</p>
        </div>
      )}
    </div>
  );
}

function ResourceDirectory({ visible }: { visible: boolean }) {
  return (
    <div className={`panel-block resource-block ${visible ? "show" : ""}`}>
      <div className="resource-heading">
        <AlertTriangle size={18} />
        <div>
          <p className="eyebrow">KSA resource directory</p>
          <h3>Human support stays visible</h3>
        </div>
      </div>
      <p>
        This prototype surfaces resources when crisis, coercion, child risk, or imminent danger
        labels appear. Accuracy must be legally and operationally verified before launch.
      </p>
      <div className="resource-list">
        {ksaResources.map((resource) => (
          <a href={resource.source} target="_blank" rel="noreferrer" key={resource.phone}>
            <strong>{resource.phone}</strong>
            <span>{resource.name}</span>
            <small>{resource.note}</small>
          </a>
        ))}
      </div>
    </div>
  );
}

function LoadAuditView({
  stressors,
  setStressors,
}: {
  stressors: Stressor[];
  setStressors: React.Dispatch<React.SetStateAction<Stressor[]>>;
}) {
  const summary = useMemo(() => summarizeLoad(stressors), [stressors]);

  function updateStressor(id: string, patch: Partial<Stressor>) {
    setStressors((current) =>
      current.map((stressor) => (stressor.id === id ? { ...stressor, ...patch } : stressor))
    );
  }

  return (
    <section className="load-layout">
      <div className="audit-header">
        <div>
          <p className="eyebrow">Safety Mind Load Audit</p>
          <h3>Cumulative stress, not one isolated problem</h3>
        </div>
        <div className={`load-score ${summary.band}`}>
          <span>Total load</span>
          <strong>{summary.total}</strong>
          <small>{summary.band}</small>
        </div>
      </div>

      <div className="audit-flow">
        {["Inventory", "Classify", "Score", "Delete", "Reduce", "Support", "Escalate"].map(
          (step, index) => (
            <div className="flow-step" key={step}>
              <span>{index + 1}</span>
              {step}
            </div>
          )
        )}
      </div>

      <div className="stressor-grid">
        {stressors.map((stressor) => (
          <article className={`stressor-card ${stressor.active ? "active" : ""}`} key={stressor.id}>
            <div className="stressor-topline">
              <button
                className="check-toggle"
                type="button"
                onClick={() => updateStressor(stressor.id, { active: !stressor.active })}
                aria-label={`Toggle ${stressor.label}`}
              >
                {stressor.active ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
              </button>
              <div>
                <h4>{stressor.label}</h4>
                <p>{stressor.ton} · {stressor.modality}</p>
              </div>
              <strong>{scoreStressor(stressor)}</strong>
            </div>

            <RangeRow
              label="Intensity"
              value={stressor.intensity}
              onChange={(value) => updateStressor(stressor.id, { intensity: value })}
            />
            <RangeRow
              label="Frequency"
              value={stressor.frequency}
              onChange={(value) => updateStressor(stressor.id, { frequency: value })}
            />
            <RangeRow
              label="Duration"
              value={stressor.duration}
              onChange={(value) => updateStressor(stressor.id, { duration: value })}
            />
            <RangeRow
              label="Capacity"
              value={stressor.capacity}
              onChange={(value) => updateStressor(stressor.id, { capacity: value })}
            />
          </article>
        ))}
      </div>

      <div className="audit-recommendation">
        <HeartPulse size={20} />
        <div>
          <p className="eyebrow">Recommended route</p>
          <h3>
            {summary.highest
              ? `${summary.highest.area}: ${summary.highest.ton}`
              : "No active stressors selected"}
          </h3>
          <p>
            {summary.band === "critical"
              ? "Escalate safety, human support, and capacity relief before adding more reflection."
              : summary.band === "high"
                ? "Reduce or support the largest stressor before attempting a difficult conversation."
                : "Use a low-burden action and repeat the audit if stressors stack again."}
          </p>
        </div>
      </div>
    </section>
  );
}

function RangeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="range-row">
      <span>{label}</span>
      <input
        type="range"
        min={1}
        max={5}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <strong>{value}</strong>
    </label>
  );
}

function AdminConsole({
  config,
  setConfig,
  apiKeys,
  setApiKeys,
}: {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
  apiKeys: ApiKeys;
  setApiKeys: React.Dispatch<React.SetStateAction<ApiKeys>>;
}) {
  const phaseOneAgents = agentRoles.filter((role) => role.phase === "Phase 1" && role.type === "agent").length;
  const validators = agentRoles.filter((role) => role.type === "validator").length;
  const availableProviders = getAvailableProviders(apiKeys);
  const voiceReadyProviders = getVoiceReadyProviders(apiKeys);

  function updateRole(roleId: string, patch: Partial<RoleConfig>) {
    setConfig((current) => {
      const existing = current[roleId];
      return {
        ...current,
        [roleId]: {
          ...existing,
          ...patch,
        },
      };
    });
  }

  function applyAutoConfig(singleProvider?: ProviderId) {
    if (availableProviders.length === 0) return;
    if (singleProvider && !availableProviders.includes(singleProvider)) return;

    setConfig(buildAutoConfig(singleProvider ? [singleProvider] : availableProviders, singleProvider));
  }

  function changeProvider(roleId: string, provider: ProviderId, target: "primary" | "validator") {
    if (!availableProviders.includes(provider)) return;

    const firstModel = providerCatalog.find((item) => item.id === provider)?.models[0]?.id ?? "";
    if (target === "primary") {
      updateRole(roleId, { provider, model: firstModel });
    } else {
      updateRole(roleId, { validatorProvider: provider, validatorModel: firstModel });
    }
  }

  return (
    <section className="admin-layout">
      <div className="admin-hero">
        <div>
          <p className="eyebrow">Admin configuration</p>
          <h3>Agent roles and model validation</h3>
          <p>
            The BRD requires multiple AI models, parallel safety classification, user-visible
            handoffs, and validators. This console makes those roles explicit.
          </p>
        </div>
        <div className="admin-stat-grid">
          <MetricBlock label="Phase 1 agents" value={String(phaseOneAgents)} />
          <MetricBlock label="System validators" value={String(validators)} />
          <MetricBlock label="Validator checks" value={String(validatorInventory.length)} />
          <MetricBlock label="Providers live" value={String(availableProviders.length)} />
          <MetricBlock label="Voice ready" value={String(voiceReadyProviders.length)} />
        </div>
      </div>

      <ApiKeyPanel apiKeys={apiKeys} setApiKeys={setApiKeys} />

      <AutoConfigPanel
        availableProviders={availableProviders}
        onBest={() => applyAutoConfig()}
        onProvider={(provider) => applyAutoConfig(provider)}
      />

      <div className="provider-band">
        {providerCatalog.map((provider) => (
          <a
            href={provider.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className={`provider-card ${hasProviderKey(apiKeys, provider.id) ? "connected" : "unavailable"}`}
            key={provider.id}
          >
            <KeyRound size={18} />
            <strong>{provider.label}</strong>
            <small>
              {hasProviderKey(apiKeys, provider.id)
                ? provider.voiceModels?.length
                  ? "Connected · voice ready"
                  : "Connected"
                : "Not used until key is saved"}
            </small>
            <span>{provider.description}</span>
          </a>
        ))}
      </div>

      <div className="agent-matrix">
        {agentRoles.map((role) => {
          const roleConfig = config[role.id];
          return (
            <article className={`agent-row ${role.phase === "Phase 2 gated" ? "gated" : ""}`} key={role.id}>
              <div className="agent-identity">
                <span className={`role-type ${role.type}`}>{role.type}</span>
                <h4>{role.name}</h4>
                <p>{role.purpose}</p>
                <small>{role.phase} · {role.required ? "Required" : "Optional"}</small>
              </div>

              <ModelPicker
                label="Primary model"
                provider={roleConfig.provider}
                model={roleConfig.model}
                availableProviders={availableProviders}
                onProviderChange={(provider) => changeProvider(role.id, provider, "primary")}
                onModelChange={(model) => updateRole(role.id, { model })}
              />

              <ModelPicker
                label="Validator model"
                provider={roleConfig.validatorProvider}
                model={roleConfig.validatorModel}
                availableProviders={availableProviders}
                onProviderChange={(provider) => changeProvider(role.id, provider, "validator")}
                onModelChange={(validatorModel) => updateRole(role.id, { validatorModel })}
              />

              <label className="switch-row">
                <input
                  type="checkbox"
                  checked={roleConfig.enabled}
                  disabled={role.required}
                  onChange={(event) => updateRole(role.id, { enabled: event.target.checked })}
                />
                <span>{roleConfig.enabled ? "Enabled" : "Disabled"}</span>
              </label>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AutoConfigPanel({
  availableProviders,
  onBest,
  onProvider,
}: {
  availableProviders: ProviderId[];
  onBest: () => void;
  onProvider: (provider: ProviderId) => void;
}) {
  const hasProviders = availableProviders.length > 0;
  const routingSummary =
    availableProviders.length === 0
      ? "Add at least one API key before routing agents."
      : availableProviders.length === 1 && availableProviders[0] === "groq"
        ? "Groq-only preset uses GPT-OSS, Llama, Safeguard, Prompt Guard, and ALLAM; Compound remains manual."
      : availableProviders.length === 1
        ? `${providerById[availableProviders[0]].label} will run every enabled role.`
        : `${availableProviders.length} providers are available for cross-validation.`;

  return (
    <section className="auto-config-panel" aria-label="Automatic provider configuration">
      <div>
        <p className="eyebrow">Runtime routing</p>
        <h3>Auto configuration</h3>
        <p>
          Uses only connected providers. With all three connected, roles are distributed by best
          fit and validators are placed on a second provider where possible. For Groq-only,
          validators use different Groq model families where the catalog allows it.
        </p>
        <strong className="routing-summary">{routingSummary}</strong>
      </div>

      <div className="auto-config-control">
        <div className="provider-chip-row" aria-label="Connected providers">
          {hasProviders ? (
            availableProviders.map((provider) => (
              <span className="provider-chip connected" key={provider}>
                {providerById[provider].label}
              </span>
            ))
          ) : (
            <span className="provider-chip">No connected providers</span>
          )}
        </div>

        <div className="auto-config-actions">
          <button className="primary" type="button" onClick={onBest} disabled={!hasProviders}>
            Best available
          </button>
          {providerCatalog.map((provider) => {
            const connected = availableProviders.includes(provider.id);
            return (
              <button
                type="button"
                key={provider.id}
                onClick={() => onProvider(provider.id)}
                disabled={!connected}
              >
                {provider.label} only
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ApiKeyPanel({
  apiKeys,
  setApiKeys,
}: {
  apiKeys: ApiKeys;
  setApiKeys: React.Dispatch<React.SetStateAction<ApiKeys>>;
}) {
  function updateKey(provider: ProviderId, value: string) {
    setApiKeys((current) => ({ ...current, [provider]: value }));
  }

  function clearKey(provider: ProviderId) {
    setApiKeys((current) => {
      const next = { ...current };
      delete next[provider];
      return next;
    });
  }

  return (
    <section className="key-panel" aria-label="API keys">
      <div>
        <p className="eyebrow">Model access</p>
        <h3>API keys</h3>
        <p>
          Keys are stored only in this browser for prototype testing. Production should move these
          calls behind a server-side gateway with consent, audit logging, rate limits, and residency
          controls. The runtime only uses providers that have a saved key.
        </p>
      </div>

      <div className="key-grid">
        {providerCatalog.map((provider) => {
          const hasKey = Boolean(apiKeys[provider.id]?.trim());
          return (
            <label className="key-row" key={provider.id}>
              <span>
                <strong>{provider.label}</strong>
                <small>{hasKey ? "Connected for runtime use" : "Not used by the system"}</small>
              </span>
              <input
                type="password"
                value={apiKeys[provider.id] ?? ""}
                onChange={(event) => updateKey(provider.id, event.target.value)}
                placeholder={`${provider.label} API key`}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="button" onClick={() => clearKey(provider.id)}>
                Clear
              </button>
            </label>
          );
        })}
      </div>
    </section>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric-block">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ModelPicker({
  label,
  provider,
  model,
  availableProviders,
  onProviderChange,
  onModelChange,
}: {
  label: string;
  provider: ProviderId;
  model: string;
  availableProviders: ProviderId[];
  onProviderChange: (provider: ProviderId) => void;
  onModelChange: (model: string) => void;
}) {
  const selectedProvider = providerById[provider];
  const hasProviders = availableProviders.length > 0;
  const providerConnected = availableProviders.includes(provider);
  const selectionDisabled = !hasProviders || !providerConnected;

  return (
    <div className="model-picker">
      <label>
        <span>{label}</span>
        <select
          value={provider}
          onChange={(event) => onProviderChange(event.target.value as ProviderId)}
          disabled={!hasProviders}
        >
          {providerCatalog.map((item) => (
            <option value={item.id} key={item.id} disabled={hasProviders && !availableProviders.includes(item.id)}>
              {item.label}{hasProviders && !availableProviders.includes(item.id) ? " · no key" : ""}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Model</span>
        <select value={model} onChange={(event) => onModelChange(event.target.value)} disabled={selectionDisabled}>
          {selectedProvider.models.map((item) => (
            <option value={item.id} key={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function SafetyEvidence({ latestResponse }: { latestResponse?: AgentResponse }) {
  return (
    <section className="evidence-layout">
      <div className="evidence-column">
        <div className="panel-block">
          <p className="eyebrow">Non-negotiable guardrails</p>
          <h3>Implemented in the prototype surface</h3>
          <GuardrailList />
        </div>
        <div className="panel-block">
          <p className="eyebrow">Validator inventory</p>
          <h3>Checks required before model output is trusted</h3>
          <div className="validator-list">
            {validatorInventory.map((validator) => (
              <p key={validator}>
                <BadgeCheck size={15} />
                {validator}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="evidence-column">
        <div className="panel-block">
          <p className="eyebrow">Latest handoff trace</p>
          <h3>User-visible model log</h3>
          {latestResponse ? (
            <>
              <p>Current support track: {routeLabels[latestResponse.assessment.route]}</p>
              {latestResponse.modelError && (
                <div className="model-error">
                  <strong>Provider connection note</strong>
                  <p>{latestResponse.modelError}</p>
                </div>
              )}
              <TraceList response={latestResponse} />
            </>
          ) : (
            <p>No message processed yet. Use the chat to generate a trace.</p>
          )}
        </div>

        <div className="panel-block">
          <p className="eyebrow">Explicit exclusions</p>
          <div className="exclusion-grid">
            {[
              "Not therapy",
              "Not diagnosis",
              "Not surveillance",
              "Not crisis response",
              "No AI companion",
              "No evidence packages",
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GuardrailList() {
  const items = [
    ["Safety classifier", "Every user message runs through the safety classifier simulator first."],
    ["Safety override", "Danger, coercion, self-harm, and child risk stop ordinary reframing."],
    ["Privacy escape", "The Escape key moves to a neutral screen without showing relationship content."],
    ["No partner exposure", "Phase 1 keeps account mode individual; couple tools stay gated or blocked."],
    ["One side story", "Absent partner judgment is redirected toward reflection, safety, or support."],
    ["Refusals", "Surveillance, hacking, and legal evidence-package requests are refused."],
  ];

  return (
    <div className="guardrail-list">
      {items.map(([label, detail]) => (
        <div key={label}>
          <Lock size={16} />
          <strong>{label}</strong>
          <span>{detail}</span>
        </div>
      ))}
    </div>
  );
}

function TraceList({ response, compact = false }: { response: AgentResponse; compact?: boolean }) {
  return (
    <div className={`trace-list ${compact ? "compact" : ""}`}>
      {response.trace.map((step) => (
        <article className={`trace-step ${step.status}`} key={`${step.roleId}-${step.roleName}`}>
          <div className="trace-status">
            {step.status === "blocked" ? (
              <FileWarning size={16} />
            ) : step.status === "escalated" ? (
              <AlertTriangle size={16} />
            ) : (
              <Activity size={16} />
            )}
          </div>
          <div>
            <h4>{step.roleName}</h4>
            <p>{step.output}</p>
            <small>
              {providerLabel(step.provider)} / {step.model}
              {step.validatorModel
                ? ` · validated by ${providerById[step.validatorProvider ?? "openai"].label} / ${step.validatorModel}`
                : ""}
            </small>
          </div>
        </article>
      ))}
    </div>
  );
}

export default App;
