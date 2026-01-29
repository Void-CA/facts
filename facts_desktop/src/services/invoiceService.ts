import apiClient from './apiClient';
import { Invoice } from './types';

const invoiceService = {
    getAll: async () => {
        const response = await apiClient.get<Invoice[]>('/invoices');
        return response.data;
    },
    getById: async (id: string) => {
        const response = await apiClient.get<Invoice>(`/invoices/${id}`);
        return response.data;
    },
    create: async (invoice: Omit<Invoice, 'id' | 'clientName'>) => {
        const response = await apiClient.post<Invoice>('/invoices', invoice);
        return response.data;
    },
    update: async (id: string, invoice: Partial<Invoice>) => {
        const response = await apiClient.put<Invoice>(`/invoices/${id}`, invoice);
        return response.data;
    },
    delete: async (id: string) => {
        await apiClient.delete(`/invoices/${id}`);
    },
};

export default invoiceService;
