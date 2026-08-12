export interface Incident {
  incident_id: string;
  title: string;
  type: string;
  timestamp: string;
  system: string;
  severity: string;
  status: string; // 'Active' | 'Investigated' | 'Resolved'
  indicators: string[];
  description: string;
  attack_behavior: string;
  root_cause?: string;
  analyst_investigation?: string;
  actions_attempted: string[];
  successful_actions: string[];
  failed_actions: string[];
  resolution?: string;
  resolution_time?: number;
  outcome?: string;
  analyst_notes?: string;
  lessons_learned?: string;
}

export interface MemoryCard {
  incident_id: string;
  title: string;
  relevance: number;
  type: string;
  attack: string;
  root_cause: string;
  successful_remediation: string;
  failed_remediation: string;
  outcome: string;
  resolution_time: number;
}

export interface AIRecommendation {
  recommendation_id: string;
  incident_id: string;
  findings: string[];
  recommendations: string[];
  confidence: number;
  historical_evidence_count: number;
  previous_successful_strategy: string;
  reasoning: string;
}

export interface Pattern {
  pattern_id: string;
  title: string;
  incidents: string[];
  confidence: number;
  observation: string;
  recommendation: string;
}

export interface LearningJourneyItem {
  interaction_id: string;
  title: string;
  description: string;
  learned_fact: string;
  outcome_impact: string;
  step_number: number;
}

export interface DashboardStats {
  active_incidents: number;
  resolved_incidents: number;
  memory_facts: number;
  patterns_detected: number;
  average_resolution_time: number;
}

export interface InvestigationResult {
  incident: Incident;
  recommendation: AIRecommendation;
  memories: MemoryCard[];
  reflection: string;
}
