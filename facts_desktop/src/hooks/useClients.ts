import { useState, useEffect, useCallback } from 'react';
import clientService from '../services/clientService';
import { Client } from '../services/types';

export const useClients = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClients = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await clientService.getAll();
            setClients(data);
        } catch (err) {
            setError('Error al cargar clientes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const addClient = async (data: any) => {
        try {
            const newClient = await clientService.create(data);
            setClients(prev => [...prev, newClient]);
            return newClient;
        } catch (err) {
            setError('Error al crear cliente');
            throw err;
        }
    };

    const updateClient = async (id: string, data: any) => {
        try {
            const updated = await clientService.update(id, data);
            setClients(prev => prev.map(c => c.id.toString() === id ? { ...c, ...data } : c));
            return updated;
        } catch (err) {
            setError('Error al actualizar cliente');
            throw err;
        }
    };

    const deleteClient = async (id: string) => {
        try {
            await clientService.delete(id);
            setClients(prev => prev.filter(c => c.id.toString() !== id));
        } catch (err) {
            setError('Error al eliminar cliente');
            throw err;
        }
    };

    return {
        clients,
        loading,
        error,
        refresh: fetchClients,
        addClient,
        updateClient,
        deleteClient
    };
};
