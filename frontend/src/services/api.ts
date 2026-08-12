import type { 
  Incident, DashboardStats, InvestigationResult, 
  Pattern, LearningJourneyItem 
} from '../types';

const API_BASE = 'http://localhost:8000/api';

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Failed to fetch health');
    return res.json();
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  async getIncidents(filters?: {
    severity?: string;
    status?: string;
    type?: string;
    system?: string;
  }): Promise<Incident[]> {
    const query = new URLSearchParams();
    if (filters) {
      if (filters.severity) query.append('severity', filters.severity);
      if (filters.status) query.append('status', filters.status);
      if (filters.type) query.append('type', filters.type);
      if (filters.system) query.append('system', filters.system);
    }
    const res = await fetch(`${API_BASE}/incidents?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async getIncidentById(incidentId: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}`);
    if (!res.ok) throw new Error('Failed to fetch incident details');
    return res.json();
  },

  async createIncident(data: {
    title: string;
    type: string;
    system: string;
    severity: string;
    description: string;
    indicators: string[];
    attack_behavior: string;
  }): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create incident');
    return res.json();
  },

  async investigateIncident(incidentId: string): Promise<InvestigationResult> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/investigate`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to run AI investigation');
    return res.json();
  },

  async approveRecommendation(incidentId: string): Promise<{ status: string; simulated_logs: string[] }> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/approve`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to approve recommendation');
    return res.json();
  },

  async resolveIncident(
    incidentId: string, 
    data: {
      actions_taken: string[];
      resolution: string;
      resolution_time: number;
      outcome: string;
      lessons_learned: string;
    }
  ): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to resolve incident');
    return res.json();
  },

  async retainIncidentMemory(incidentId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/${incidentId}/retain`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to retain incident memory');
    return res.json();
  },

  async getPatterns(): Promise<Pattern[]> {
    const res = await fetch(`${API_BASE}/patterns`);
    if (!res.ok) throw new Error('Failed to fetch patterns');
    return res.json();
  },

  async getLearningTimeline(): Promise<LearningJourneyItem[]> {
    const res = await fetch(`${API_BASE}/learning-timeline`);
    if (!res.ok) throw new Error('Failed to fetch learning timeline');
    return res.json();
  },

  async resetDatabase(): Promise<any> {
    const res = await fetch(`${API_BASE}/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset database');
    return res.json();
  }
};
