/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, UserProfile, Opportunity, MarketEvidenceItem, GovernmentScheme, BusinessPlan, FinancialInputs, FinancialEvaluation, CalculatorSnapshot } from '../types/index.js';

const TOKEN_KEY = 'ruralrise_auth_token';

export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(name: string, email: string, passwordPlain: string) {
    const data = await apiRequest<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: passwordPlain })
    });
    setStoredToken(data.token);
    return data;
  },

  async login(email: string, passwordPlain: string) {
    const data = await apiRequest<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: passwordPlain })
    });
    setStoredToken(data.token);
    return data;
  },

  async logout() {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      clearStoredToken();
    }
  },

  async getMe() {
    return apiRequest<{ user: User; profile: UserProfile | null }>('/api/auth/me');
  },

  async deleteAccount() {
    try {
      return await apiRequest<{ success: boolean; message: string }>('/api/auth/account', {
        method: 'DELETE'
      });
    } finally {
      clearStoredToken();
    }
  },

  async requestPasswordReset(email: string) {
    return apiRequest<{
      success: boolean;
      message: string;
      emailDeliveryConfigured?: boolean;
      dispatched?: boolean;
      deliveryNotice?: string;
    }>('/api/auth/reset-password-request', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(token: string, newPasswordPlain: string) {
    return apiRequest<{ success: boolean; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword: newPasswordPlain })
    });
  },

  // Profile
  async updateProfile(profileData: Partial<UserProfile>) {
    return apiRequest<{ profile: UserProfile }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  // Opportunities
  async getOpportunities(params?: { category?: string; maxBudget?: number; search?: string }) {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.maxBudget) query.set('maxBudget', String(params.maxBudget));
    if (params?.search) query.set('search', params.search);

    const qs = query.toString();
    return apiRequest<{ opportunities: Opportunity[]; total: number; isPersonalized: boolean }>(
      `/api/opportunities${qs ? `?${qs}` : ''}`
    );
  },

  async getOpportunityById(id: string) {
    return apiRequest<{ opportunity: Opportunity }>(`/api/opportunities/${id}`);
  },

  // Saved Opportunities
  async getSavedOpportunities() {
    return apiRequest<{ savedOpportunities: Array<{ record: any; opportunity: Opportunity }> }>('/api/saved-opportunities');
  },

  async saveOpportunity(opportunityId: string, notes?: string) {
    return apiRequest<{ savedOpportunity: any }>('/api/saved-opportunities', {
      method: 'POST',
      body: JSON.stringify({ opportunityId, notes })
    });
  },

  async removeSavedOpportunity(opportunityId: string) {
    return apiRequest<{ success: boolean }>(`/api/saved-opportunities/${opportunityId}`, {
      method: 'DELETE'
    });
  },

  // Market Intelligence
  async getMarketIntelligence() {
    return apiRequest<{ datasets: MarketEvidenceItem[]; mandals: string[]; lastVerifiedDate: string }>('/api/market-intelligence');
  },

  async queryMarketIntelligence(category?: string, query?: string) {
    return apiRequest<{ results: MarketEvidenceItem[]; count: number; timestamp: string }>('/api/market-intelligence/query', {
      method: 'POST',
      body: JSON.stringify({ category, query })
    });
  },

  // Schemes
  async getSchemes() {
    return apiRequest<{ schemes: GovernmentScheme[]; leadBanksWarangal: any[] }>('/api/schemes');
  },

  // Calculator
  async evaluateCalculator(inputs: FinancialInputs) {
    return apiRequest<FinancialEvaluation>('/api/calculator/evaluate', {
      method: 'POST',
      body: JSON.stringify(inputs)
    });
  },

  async getCalculatorPresets() {
    return apiRequest<{ presets: Record<string, FinancialInputs> }>('/api/calculator/presets');
  },

  async saveCalculatorSnapshot(name: string, inputs: FinancialInputs, results: FinancialEvaluation) {
    return apiRequest<{ snapshot: CalculatorSnapshot }>('/api/calculator/save', {
      method: 'POST',
      body: JSON.stringify({ name, inputs, results })
    });
  },

  async getCalculatorSnapshots() {
    return apiRequest<{ snapshots: CalculatorSnapshot[] }>('/api/calculator/saved');
  },

  async deleteCalculatorSnapshot(id: string) {
    return apiRequest<{ success: boolean }>(`/api/calculator/saved/${id}`, {
      method: 'DELETE'
    });
  },

  // Business Plans
  async getBusinessPlans() {
    return apiRequest<{ plans: BusinessPlan[] }>('/api/plans');
  },

  async getBusinessPlanById(id: string) {
    return apiRequest<{ plan: BusinessPlan }>(`/api/plans/${id}`);
  },

  async createBusinessPlan(plan: Omit<BusinessPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    return apiRequest<{ plan: BusinessPlan }>('/api/plans', {
      method: 'POST',
      body: JSON.stringify(plan)
    });
  },

  async updateBusinessPlan(id: string, updates: Partial<BusinessPlan>) {
    return apiRequest<{ plan: BusinessPlan }>(`/api/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteBusinessPlan(id: string) {
    return apiRequest<{ success: boolean }>(`/api/plans/${id}`, {
      method: 'DELETE'
    });
  },

  // Server-side AI Business Plan Refinement
  async refineBusinessPlanWithAI(plan: BusinessPlan) {
    return apiRequest<{ refinement: NonNullable<BusinessPlan['aiRefinement']> }>('/api/ai/refine-plan', {
      method: 'POST',
      body: JSON.stringify(plan)
    });
  },

  // RuralRise AI Entrepreneurship Assistant
  async chatWithAssistant(request: import('../types/index.js').ChatRequest) {
    return apiRequest<import('../types/index.js').ChatResponse>('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify(request)
    });
  },

  async transcribeAudio(audioBase64: string, mimeType: string = 'audio/webm') {
    return apiRequest<import('../types/index.js').TranscribeResponse>('/api/ai/transcribe', {
      method: 'POST',
      body: JSON.stringify({ audioBase64, mimeType })
    });
  }
};
