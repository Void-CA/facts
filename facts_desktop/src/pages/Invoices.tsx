import React, { useEffect, useState } from 'react';
import invoiceService from '../services/invoiceService';
import clientService from '../services/clientService';
import { Invoice, Client } from '../services/types';
import { Plus, Trash2, Calendar, User, DollarSign, FileText, Filter } from 'lucide-react';
import InvoiceForm from '../components/forms/InvoiceForm';

const Invoices: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [invoiceData, clientData] = await Promise.all([
                invoiceService.getAll(),
                clientService.getAll()
            ]);
            setInvoices(invoiceData);
            setClients(clientData);
        } catch (error) {
            console.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (data: any) => {
        try {
            await invoiceService.create(data);
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Create failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar esta factura?')) {
            try {
                await invoiceService.delete(id);
                fetchData();
            } catch (error) {
                console.error('Delete failed');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Paid': return 'text-green-500 bg-green-500/10';
            case 'Overdue': return 'text-red-500 bg-red-500/10';
            case 'Draft': return 'text-text-muted bg-text-muted/10';
            default: return 'text-primary bg-primary/10';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-main tracking-tight">Facturas</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                >
                    <Plus size={20} />
                    Nueva Factura
                </button>
            </div>

            <div className="bg-surface rounded-2xl border border-border overflow-hidden transition-all shadow-sm">
                <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-border rounded-lg text-text-muted hover:bg-surface transition-colors">
                            <Filter size={16} />
                            Filtros
                        </button>
                    </div>
                    <div className="text-sm text-text-muted">
                        Total: {invoices.length} facturas
                    </div>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-primary">Cargando facturas...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border text-xs font-semibold text-text-muted uppercase tracking-wider">
                                <th className="px-6 py-4">Nº Factura</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Total</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {invoices.map(invoice => (
                                <tr key={invoice.id} className="hover:bg-primary/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 font-semibold text-text-main">
                                            <FileText size={16} className="text-primary" />
                                            #{invoice.invoiceNumber}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-main">{invoice.clientName || 'Cliente desconocido'}</td>
                                    <td className="px-6 py-4 text-text-muted text-sm capitalize">
                                        {new Date(invoice.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-text-main">
                                        ${invoice.calcTotal.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(invoice.status)}`}>
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => handleDelete(invoice.id)} className="p-2 text-text-muted hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-text-muted">
                                        No hay facturas registradas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal - Usando el nuevo InvoiceForm */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="w-full max-w-5xl my-8">
                        <InvoiceForm
                            clients={clients}
                            onSubmit={handleFormSubmit}
                            onCancel={() => setShowModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
