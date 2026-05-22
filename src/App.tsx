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
  Moon,
  Network,
  PanelLeft,
  RotateCcw,
  Send,
  Settings2,
  Shield,
  ShieldAlert,
  Sparkles,
  Sun,
  UsersRound,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { canUseLiveModel, generateLiveReply, getAvailableProviders } from "./llm";
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
  normal_ai: "Normal AI",
  recovery_flow: "Recovery Flow",
  education: "Education",
  low_burden_mitigation: "Low-burden mitigation",
  human_support: "Human support",
  resource_directory: "Resource directory",
  block_refuse: "Refusal",
  quick_exit_prompt: "Quick-exit prompt",
  crisis_disclaimer: "Crisis disclaimer",
  pathway_4: "Pathway 4",
  pathway_6: "Pathway 6",
  admin_review: "Admin review",
};

const routeTone: Partial<Record<RouteAction, string>> = {
  resource_directory: "critical",
  pathway_4: "critical",
  pathway_6: "caution",
  block_refuse: "caution",
  recovery_flow: "steady",
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

function hasProviderKey(apiKeys: ApiKeys, provider: ProviderId) {
  return Boolean(apiKeys[provider]?.trim());
}

function providerLabel(provider: TraceStep["provider"]) {
  return provider === "local" ? localProviderLabel : providerById[provider].label;
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
        text: "I’m checking safety first, then I’ll answer you directly.",
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
        text:
          "The conversation has been cleared locally. You can start again with safety screening first.",
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
        <p className="eyebrow">Private support mode</p>
        <h2>Talk it through safely</h2>
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
            label="Safety check"
            value="Always on"
            tone="locked"
          />
          <MetricPill
            icon={<Network size={16} />}
            label="Support mode"
            value={route ? userModeLabel(route) : "Ready"}
            tone={route ? routeTone[route] : undefined}
          />
          <MetricPill
            icon={<UsersRound size={16} />}
            label="Sharing"
            value={latestResponse?.assessment.coupleFeaturesAllowed === false ? "Private" : "Individual"}
            tone={latestResponse?.assessment.coupleFeaturesAllowed === false ? "critical" : "caution"}
          />
        </div>
      </div>
    </header>
  );
}

function userModeLabel(route: RouteAction) {
  if (route === "resource_directory") return "Urgent support";
  if (route === "pathway_4") return "Protection";
  if (route === "pathway_6") return "Structured support";
  if (route === "block_refuse") return "Boundary";
  if (route === "recovery_flow") return "Reflection";
  return "Conversation";
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
}: {
  input: string;
  setInput: (value: string) => void;
  messages: ChatMessage[];
  submitMessage: (text?: string) => void | Promise<void>;
  resetPrototype: () => void;
  latestResponse?: AgentResponse;
  isThinking: boolean;
}) {
  return (
    <section className="content-grid chat-grid">
      <div className="chat-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Safety-first chat</p>
            <h3>What’s happening?</h3>
          </div>
          <button className="icon-button" type="button" onClick={resetPrototype} aria-label="Reset chat">
            <RotateCcw size={17} />
          </button>
        </div>

        <div className="message-list" aria-live="polite">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
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
            placeholder="Tell me what happened..."
            rows={4}
            disabled={isThinking}
          />
          <button type="submit" disabled={isThinking}>
            {isThinking ? <Sparkles size={18} /> : <Send size={18} />}
            {isThinking ? "Checking" : "Send"}
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
        <p className="eyebrow">Behind the scenes</p>
        <h3>Ready when you are</h3>
        <p>
          I check for immediate risk before replying, then keep the conversation private and focused.
        </p>
      </div>
    );
  }

  return (
    <div className="panel-block">
      <p className="eyebrow">Behind the scenes</p>
      <h3>{userModeLabel(response.assessment.route)}</h3>
      <dl className="snapshot-list">
        <div>
          <dt>Reply source</dt>
          <dd>
            {response.answeredBy
              ? response.answeredBy.mode === "live"
                ? `${providerLabel(response.answeredBy.provider)} / ${response.answeredBy.model}`
                : "Local fallback"
              : "Processing"}
          </dd>
        </div>
        <div>
          <dt>Safety check</dt>
          <dd>{response.assessment.severity === "low" ? "Clear" : response.assessment.severity}</dd>
        </div>
        <div>
          <dt>Focus</dt>
          <dd>{response.assessment.problemAreas[0] ?? "Relationship support"}</dd>
        </div>
        <div>
          <dt>Mode</dt>
          <dd>{routeLabels[response.assessment.route]}</dd>
        </div>
        <div>
          <dt>Privacy</dt>
          <dd>{response.assessment.coupleFeaturesAllowed ? "Individual" : "Protected"}</dd>
        </div>
      </dl>
      {response.assessment.notes.length > 0 && (
        <div className="note-stack">
          {response.assessment.notes.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      )}
      {response.modelError && (
        <div className="model-error">
          <strong>Model connection note</strong>
          <p>{response.modelError}</p>
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

  function changeProvider(roleId: string, provider: ProviderId, target: "primary" | "validator") {
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
        </div>
      </div>

      <ApiKeyPanel apiKeys={apiKeys} setApiKeys={setApiKeys} />

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
            <small>{hasProviderKey(apiKeys, provider.id) ? "Connected" : "Not used until key is saved"}</small>
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
                onProviderChange={(provider) => changeProvider(role.id, provider, "primary")}
                onModelChange={(model) => updateRole(role.id, { model })}
              />

              <ModelPicker
                label="Validator model"
                provider={roleConfig.validatorProvider}
                model={roleConfig.validatorModel}
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
  onProviderChange,
  onModelChange,
}: {
  label: string;
  provider: ProviderId;
  model: string;
  onProviderChange: (provider: ProviderId) => void;
  onModelChange: (model: string) => void;
}) {
  const selectedProvider = providerById[provider];

  return (
    <div className="model-picker">
      <label>
        <span>{label}</span>
        <select value={provider} onChange={(event) => onProviderChange(event.target.value as ProviderId)}>
          {providerCatalog.map((item) => (
            <option value={item.id} key={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Model</span>
        <select value={model} onChange={(event) => onModelChange(event.target.value)}>
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
            <TraceList response={latestResponse} />
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
    ["Quick exit", "The fixed Quick Exit button and Escape key move to a neutral screen."],
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
