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
    create: async (invoice: any) => {
        const response = await apiClient.post<Invoice>('/invoices', invoice);
        return response.data;
    },
    update: async (id: string, invoice: any) => {
        const response = await apiClient.put<Invoice>(`/invoices/${id}`, invoice);
        return response.data;
    },
    delete: async (id: string) => {
        await apiClient.delete(`/invoices/${id}`);
    },
    getFullInvoice: async (id: string) => {
        const response = await apiClient.get<Invoice>(`/invoices/full_invoice/${id}`);
        return response.data;
    },
    getLastPrintNumber: async () => {
        const response = await apiClient.get<number>('/invoices/last-print-number');
        return response.data;
    },
    exportInvoices: async (startDate: string, endDate: string, format: string) => {
        const response = await apiClient.get('/invoices/export', {
            params: { startDate, endDate, format },
            responseType: 'blob'
        });
        return response.data;
    },
};

export default invoiceService;
