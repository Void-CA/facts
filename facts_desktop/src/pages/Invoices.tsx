import React, { useEffect, useState } from 'react';
import invoiceService from '../services/invoiceService';
import clientService from '../services/clientService';
import { Invoice, Client } from '../services/types';
import { Plus, Trash2, Calendar, FileText, Filter, Eye, Edit2, X, Download } from 'lucide-react';
import InvoiceForm from '../components/forms/InvoiceForm';
import ConfirmModal from '../components/ConfirmModal';

const Invoices: React.FC = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

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
            if (editingInvoice) {
                await invoiceService.update(editingInvoice.id.toString(), data);
            } else {
                await invoiceService.create(data);
            }
            setShowModal(false);
            setEditingInvoice(null);
            fetchData();
        } catch (error) {
            console.error('Operation failed');
        }
    };

    const handleDelete = async () => {
        if (!invoiceToDelete) return;
        try {
            await invoiceService.delete(invoiceToDelete.id.toString());
            setInvoiceToDelete(null);
            fetchData();
        } catch (error) {
            console.error('Delete failed');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pagado': return 'text-green-500 bg-green-500/10';
            case 'vencido': case 'overdue': return 'text-red-500 bg-red-500/10';
            case 'pendiente': case 'draft': return 'text-text-muted bg-text-muted/10';
            default: return 'text-primary bg-primary/10';
        }
    };

    const handleEdit = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-main tracking-tight">Facturas</h1>
                <button
                    onClick={() => { setEditingInvoice(null); setShowModal(true); }}
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
                    <div className="p-12 text-center text-primary font-bold">Cargando facturas...</div>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                <th className="px-6 py-4">Nº Imp.</th>
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Fecha Emisión</th>
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
                                            #{invoice.printNumber}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-main font-medium">
                                        {clients.find(c => c.id === invoice.clientId)?.name || 'Cliente desconocido'}
                                    </td>
                                    <td className="px-6 py-4 text-text-muted text-sm">
                                        {new Date(invoice.emittedDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-text-main">
                                        ${(invoice.calcTotal || 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(invoice.state)}`}>
                                            {invoice.state}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => setViewingInvoice(invoice)} className="p-2 text-text-muted hover:text-primary transition-colors hover:bg-primary/5 rounded-lg">
                                                <Eye size={18} />
                                            </button>
                                            <button onClick={() => handleEdit(invoice)} className="p-2 text-text-muted hover:text-primary transition-colors hover:bg-primary/5 rounded-lg">
                                                <Edit2 size={18} />
                                            </button>
                                            <button onClick={() => setInvoiceToDelete(invoice)} className="p-2 text-text-muted hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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

            {/* Modal Form */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="w-full max-w-6xl my-8">
                        <InvoiceForm
                            initialData={editingInvoice || undefined}
                            clients={clients}
                            onSubmit={handleFormSubmit}
                            onCancel={() => { setShowModal(false); setEditingInvoice(null); }}
                            isEdit={!!editingInvoice}
                        />
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {viewingInvoice && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-surface border border-border w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-background/30">
                            <div>
                                <h2 className="text-2xl font-black text-text-main tracking-tight">Detalle de Factura</h2>
                                <p className="text-primary font-bold">#{viewingInvoice.printNumber}</p>
                            </div>
                            <button onClick={() => setViewingInvoice(null)} className="p-2 text-text-muted hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Cliente</p>
                                        <p className="text-lg font-bold text-text-main">{clients.find(c => c.id === viewingInvoice.clientId)?.name || 'N/A'}</p>
                                        <p className="text-sm text-text-muted">{clients.find(c => c.id === viewingInvoice.clientId)?.ruc}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Tipo / Proveedor</p>
                                        <p className="text-text-main font-medium">{viewingInvoice.invoiceType} - {viewingInvoice.provider || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 text-right">
                                    <div>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Emisión</p>
                                        <p className="text-text-main font-medium">{new Date(viewingInvoice.emittedDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Estado</p>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(viewingInvoice.state)}`}>
                                            {viewingInvoice.state}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-border rounded-2xl overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-background/50 border-b border-border">
                                        <tr>
                                            <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase">Servicio</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase text-right w-20">Cant</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase text-right">Precio</th>
                                            <th className="px-4 py-3 text-[10px] font-bold text-text-muted uppercase text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {viewingInvoice.services?.map((s, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3 text-sm text-text-main font-medium whitespace-pre-wrap">{s.specification}</td>
                                                <td className="px-4 py-3 text-sm text-text-main text-right">{s.quantity}</td>
                                                <td className="px-4 py-3 text-sm text-text-main text-right">${(s.price || 0).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-sm text-text-main font-bold text-right">${(s.subtotal || 0).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col items-end gap-2 pr-4">
                                <div className="flex gap-12 text-sm">
                                    <span className="text-text-muted font-bold uppercase tracking-widest">Total Factura</span>
                                    <span className="text-2xl font-black text-primary">${(viewingInvoice.calcTotal || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            {viewingInvoice.description && (
                                <div className="bg-background/50 p-4 rounded-2xl border border-border/50">
                                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Notas / Observaciones</p>
                                    <p className="text-sm text-text-main italic">{viewingInvoice.description}</p>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-background/50 border-t border-border flex justify-end gap-3">
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                                <Download size={18} /> Descargar PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!invoiceToDelete}
                title="Eliminar Factura"
                message={`¿Estás seguro de que deseas eliminar la factura "${invoiceToDelete?.printNumber}"? Esta acción eliminará permanentemente todos sus conceptos vinculados.`}
                confirmText="Eliminar permanentemente"
                cancelText="Mantener factura"
                onConfirm={handleDelete}
                onCancel={() => setInvoiceToDelete(null)}
                type="danger"
            />
        </div>
    );
};

export default Invoices;
