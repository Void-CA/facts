import React, { useEffect, useState } from 'react';
import clientService from '../services/clientService';
import { Client } from '../services/types';
import { Plus, Edit2, Trash2, Mail, Phone, MapPin, Search } from 'lucide-react';
import ClientForm from '../components/forms/ClientForm';

const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);

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

    const handleDelete = async (id: number) => {
        if (confirm('¿Estás seguro de eliminar este cliente?')) {
            try {
                await clientService.delete(id.toString());
                fetchClients();
            } catch (error) {
                console.error('Delete failed');
            }
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
                <div className="flex justify-center py-12 text-primary">Cargando...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map(client => (
                        <div key={client.id} className="bg-surface border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl uppercase">
                                    {client.name.charAt(0)}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(client)} className="p-2 text-text-muted hover:text-primary transition-colors hover:bg-primary/5 rounded-lg">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(client.id)} className="p-2 text-text-muted hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-text-main mb-1">{client.name}</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider bg-background px-2 py-0.5 rounded border border-border">RUC: {client.ruc || 'Sin ID'}</span>
                            </div>

                            <div className="space-y-3 pt-3 border-t border-border/50">
                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                    <Mail size={14} className="text-primary/60" />
                                    <span className="truncate">{client.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                    <Phone size={14} className="text-primary/60" />
                                    {client.phone}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                    <MapPin size={14} className="text-primary/60" />
                                    <span className="line-clamp-1">{client.address}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredClients.length === 0 && (
                        <div className="col-span-full py-12 text-center text-text-muted bg-surface border-2 border-dashed border-border rounded-2xl">
                            No se encontraron clientes.
                        </div>
                    )}
                </div>
            )}

            {/* Modal */}
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
        </div>
    );
};

export default Clients;
