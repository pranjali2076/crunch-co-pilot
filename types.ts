export interface TriageCard {
  id: string;
  phaseTitle: string;
  title: string;
  urgency: 'critical' | 'important' | 'recommended';
  timeEstimate: string;
  actions: string[];
}

export interface StabilityGuideline {
  title: string;
  text: string;
}

export interface ActionPlan {
  panicAlertLevel: 'high' | 'normal';
  comfortingIntro: string;
  triageCards: TriageCard[];
  proTips: string[];
  stabilityGuidelines: StabilityGuideline[];
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  mimeType: string;
  base64: string;
  contextType?: "media" | "code" | "gdrive" | "url";
  url?: string;
}

export interface HistoryEntry {
  id: string;
  title: string;
  timestamp: string;
  task: string;
  timeLeft: string;
  panicLevel: number;
  files: UploadedFile[];
  plan: ActionPlan;
  isSimulated: boolean;
}
