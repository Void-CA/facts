import apiClient from './apiClient';
import { Client } from './types';

const clientService = {
    getAll: async () => {
        const response = await apiClient.get<Client[]>('/clients');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await apiClient.get<Client>(`/clients/${id}`);
        return response.data;
    },
    create: async (client: Omit<Client, 'id' | 'createdAt'>) => {
        const response = await apiClient.post<Client>('/clients', client);
        return response.data;
    },
    update: async (id: string, client: Partial<Client>) => {
        const response = await apiClient.put<Client>(`/clients/${id}`, client);
        return response.data;
    },
    delete: async (id: string) => {
        await apiClient.delete(`/clients/${id}`);
    },
};

export default clientService;
