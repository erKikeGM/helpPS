export type ProviderId = "openai" | "groq" | "gemini";
export type ExecutionProvider = ProviderId | "local";

export type RouteAction =
  | "normal_ai"
  | "recovery_flow"
  | "education"
  | "low_burden_mitigation"
  | "human_support"
  | "resource_directory"
  | "block_refuse"
  | "quick_exit_prompt"
  | "crisis_disclaimer"
  | "pathway_4"
  | "pathway_6"
  | "admin_review";

export type TonType =
  | "Trauma / Threat"
  | "Obsession / Loop"
  | "External Nuisance"
  | "Internal Noise"
  | "Unclassified";

export type Modality = "Mental" | "Emotional" | "Physical" | "Purpose / Values";
export type ThreatState = "Fear" | "Worry" | "Anxiety" | "Panic" | "Not future-oriented";

export interface ModelOption {
  id: string;
  label: string;
  bestFor: string;
  stability: "stable" | "preview" | "specialized";
}

export interface ProviderOption {
  id: ProviderId;
  label: string;
  description: string;
  sourceUrl: string;
  models: ModelOption[];
}

export interface AgentRole {
  id: string;
  name: string;
  phase: "Phase 1" | "Phase 2 gated" | "Governance";
  type: "agent" | "validator";
  purpose: string;
  defaultProvider: ProviderId;
  defaultModel: string;
  validatorProvider: ProviderId;
  validatorModel: string;
  required: boolean;
}

export interface RoleConfig {
  provider: ProviderId;
  model: string;
  validatorProvider: ProviderId;
  validatorModel: string;
  enabled: boolean;
}

export type AppConfig = Record<string, RoleConfig>;

export interface SafetyAssessment {
  labels: string[];
  ton: TonType;
  modalities: Modality[];
  threatState: ThreatState;
  problemAreas: string[];
  route: RouteAction;
  severity: "low" | "medium" | "high" | "critical";
  coupleFeaturesAllowed: boolean;
  notes: string[];
}

export interface TraceStep {
  roleId: string;
  roleName: string;
  provider: ExecutionProvider;
  model: string;
  validatorProvider?: ProviderId;
  validatorModel?: string;
  status: "passed" | "blocked" | "escalated" | "simulated" | "live" | "fallback";
  output: string;
}

export interface AgentResponse {
  assessment: SafetyAssessment;
  answer: string[];
  nextSteps: string[];
  trace: TraceStep[];
  answeredBy?: {
    roleId: string;
    provider: ExecutionProvider;
    model: string;
    mode: "live" | "local";
  };
  modelError?: string;
}

export interface ChatMessage {
  id: string;
  from: "user" | "assistant";
  text: string;
  response?: AgentResponse;
  pending?: boolean;
}

export type ApiKeys = Partial<Record<ProviderId, string>>;

export interface Stressor {
  id: string;
  label: string;
  area: string;
  ton: TonType;
  modality: Modality;
  intensity: number;
  frequency: number;
  duration: number;
  capacity: number;
  active: boolean;
}
