import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

// EMI Bank entity
export interface EmiBank {
  id: string;
  bankname: string;
  // Add more fields as needed
}

// EMI Plan entity (based on your entity)
export interface EmiPlan {
  id: string;
  bankId: string;
  bank?: EmiBank;
  months: number;
  planName: string;
  interestRate: number;
  bankName?: string;
}

// Request types
export interface CreateEmiPlanRequest {
  bankId: string;
  months: number;
  planName: string;
  interestRate: number;
}

export interface UpdateEmiPlanRequest {
  bankId?: string;
  months?: number;
  planName?: string;
  interestRate?: number;
}

export interface CreateEmiBankRequest {
  bankname: string;
}

export interface UpdateEmiBankRequest {
  bankname?: string;
}

export const emiService = {
  // EMI Plan CRUD
  createPlan: async (data: CreateEmiPlanRequest): Promise<EmiPlan> => {
    const response = await apiClient.post(API_ENDPOINTS.EMI_PLAN_CREATE, data);
    return response.data;
  },
  updatePlan: async (id: string, data: UpdateEmiPlanRequest): Promise<EmiPlan> => {
    const endpoint = API_ENDPOINTS.EMI_PLAN_UPDATE.replace('{id}', id);
    const response = await apiClient.patch(endpoint, data);
    return response.data;
  },
  getPlan: async (id: string): Promise<EmiPlan> => {
    const endpoint = API_ENDPOINTS.EMI_PLAN_GET.replace('{id}', id);
    const response = await apiClient.get(endpoint);
    return response.data;
  },
  deletePlan: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.EMI_PLAN_DELETE.replace('{id}', id);
    await apiClient.delete(endpoint);
  },
  getPlans: async (): Promise<EmiPlan[]> => {
    const response = await apiClient.get(API_ENDPOINTS.EMI_PLANS_GET);
    return response.data;
  },

  // EMI Bank CRUD
  createBank: async (data: CreateEmiBankRequest): Promise<EmiBank> => {
    const response = await apiClient.post(API_ENDPOINTS.EMI_BANK_CREATE, data);
    return response.data;
  },
  updateBank: async (id: string, data: UpdateEmiBankRequest): Promise<EmiBank> => {
    const endpoint = API_ENDPOINTS.EMI_BANK_UPDATE.replace('{id}', id);
    const response = await apiClient.patch(endpoint, data);
    return response.data;
  },
  getBank: async (id: string): Promise<EmiBank> => {
    const endpoint = API_ENDPOINTS.EMI_BANK_GET.replace('{id}', id);
    const response = await apiClient.get(endpoint);
    return response.data;
  },
  getBanks: async (): Promise<EmiBank[]> => {
    const response = await apiClient.get(API_ENDPOINTS.EMI_BANKS_GET);
    return response.data;
  },

  deleteBank: async (id: string): Promise<void> => {
    const endpoint = API_ENDPOINTS.EMI_BANK_DELETE.replace('{id}', id);
    await apiClient.delete(endpoint);
  },
};

export default emiService;
