import React, { useEffect, useState } from 'react';
import clientService from '../services/clientService';
import { Client } from '../services/types';
import { Plus, Search } from 'lucide-react';
import ClientForm from '../components/forms/ClientForm';
import ConfirmModal from '../components/ConfirmModal';
import ClientCard from '../components/clients/ClientCard';

const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            setLoading(true);
            const data = await clientService.getAll();
            setClients(data);
        } catch (error) {
            console.error('Failed to fetch clients');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (data: any) => {
        try {
            if (editingClient) {
                await clientService.update(editingClient.id.toString(), data);
            } else {
                await clientService.create(data);
            }
            setShowModal(false);
            setEditingClient(null);
            fetchClients();
        } catch (error) {
            console.error('Operation failed');
        }
    };

    const handleDelete = async () => {
        if (!clientToDelete) return;
        try {
            await clientService.delete(clientToDelete.id.toString());
            setClientToDelete(null);
            fetchClients();
        } catch (error) {
            console.error('Delete failed');
        }
    };

    const openEdit = (client: Client) => {
        setEditingClient(client);
        setShowModal(true);
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.ruc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-main tracking-tight">Clientes</h1>
                <button
                    onClick={() => { setEditingClient(null); setShowModal(true); }}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus size={20} />
                    Nuevo Cliente
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={20} />
                <input
                    type="text"
                    placeholder="Buscar por nombre, email o RUC..."
                    className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12 text-primary uppercase font-bold tracking-widest animate-pulse">Cargando...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map(client => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onEdit={openEdit}
                            onDelete={setClientToDelete}
                        />
                    ))}
                    {filteredClients.length === 0 && (
                        <div className="col-span-full py-12 text-center text-text-muted bg-surface border-2 border-dashed border-border rounded-2xl">
                            No se encontraron clientes.
                        </div>
                    )}
                </div>
            )}

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="w-full max-w-4xl my-8">
                        <ClientForm
                            initialData={editingClient || undefined}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setShowModal(false)}
                            isEdit={!!editingClient}
                        />
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!clientToDelete}
                title="Eliminar Cliente"
                message={`¿Estás seguro de que deseas eliminar a "${clientToDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar permanentemente"
                cancelText="Mantener cliente"
                onConfirm={handleDelete}
                onCancel={() => setClientToDelete(null)}
                type="danger"
            />
        </div>
    );
};

export default Clients;
