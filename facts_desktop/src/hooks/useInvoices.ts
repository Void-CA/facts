import { useState, useEffect, useCallback } from 'react';
import invoiceService from '../services/invoiceService';
import clientService from '../services/clientService';
import { Invoice, Client } from '../services/types';

export const useInvoices = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [invoiceData, clientData] = await Promise.all([
                invoiceService.getAll(),
                clientService.getAll()
            ]);
            setInvoices(invoiceData);
            setClients(clientData);
        } catch (err) {
            setError('Error al cargar datos de facturación');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const addInvoice = async (data: any) => {
        try {
            const newInvoice = await invoiceService.create(data);
            await fetchData(); // Refresh to ensure correct aggregated data
            return newInvoice;
        } catch (err) {
            setError('Error al crear factura');
            throw err;
        }
    };

    const updateInvoice = async (id: string, data: any) => {
        try {
            const updated = await invoiceService.update(id, data);
            await fetchData(); // Refresh to ensure correct aggregated data
            return updated;
        } catch (err) {
            setError('Error al actualizar factura');
            throw err;
        }
    };

    const deleteInvoice = async (id: string) => {
        try {
            await invoiceService.delete(id);
            setInvoices(prev => prev.filter(i => i.id.toString() !== id));
        } catch (err) {
            setError('Error al eliminar factura');
            throw err;
        }
    };

    return {
        invoices,
        clients,
        loading,
        error,
        refresh: fetchData,
        addInvoice,
        updateInvoice,
        deleteInvoice
    };
};
