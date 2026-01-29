import React, { useEffect, useState } from 'react';
import clientService from '../services/clientService';
import { Client } from '../services/types';
import { Plus, Edit2, Trash2, Mail, Phone, MapPin, Search } from 'lucide-react';

const Clients: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState<Omit<Client, 'id' | 'createdAt'>>({
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: ''
    });

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

    const handleSumbit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingClient) {
                await clientService.update(editingClient.id, formData);
            } else {
                await clientService.create(formData);
            }
            setShowModal(false);
            setEditingClient(null);
            setFormData({ name: '', email: '', phone: '', address: '', taxId: '' });
            fetchClients();
        } catch (error) {
            console.error('Operation failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este cliente?')) {
            try {
                await clientService.delete(id);
                fetchClients();
            } catch (error) {
                console.error('Delete failed');
            }
        }
    };

    const openEdit = (client: Client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            email: client.email,
            phone: client.phone,
            address: client.address,
            taxId: client.taxId
        });
        setShowModal(true);
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.taxId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-main tracking-tight">Clientes</h1>
                <button
                    onClick={() => { setEditingClient(null); setFormData({ name: '', email: '', phone: '', address: '', taxId: '' }); setShowModal(true); }}
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
                                    <button onClick={() => openEdit(client)} className="p-2 text-text-muted hover:text-primary transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(client.id)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-text-main mb-1">{client.name}</h3>
                            <p className="text-xs text-text-muted font-medium mb-4 uppercase tracking-wider">{client.taxId || 'Sin ID Fiscal'}</p>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                    <Mail size={14} />
                                    {client.email}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                    <Phone size={14} />
                                    {client.phone}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-text-muted">
                                    <MapPin size={14} />
                                    <span className="truncate">{client.address}</span>
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-surface border border-border w-full max-w-md rounded-2xl shadow-2xl transition-all duration-300 transform scale-100">
                        <div className="p-6 border-b border-border">
                            <h2 className="text-xl font-bold text-text-main">{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
                        </div>
                        <form onSubmit={handleSumbit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Nombre Completo</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Email</label>
                                    <input
                                        required
                                        type="email"
                                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Teléfono</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Dirección</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">RUC</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 text-text-main"
                                    value={formData.taxId}
                                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 py-2 border border-border text-text-muted rounded-lg hover:bg-primary/5 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                                >
                                    {editingClient ? 'Guardar Cambios' : 'Crear Cliente'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clients;
