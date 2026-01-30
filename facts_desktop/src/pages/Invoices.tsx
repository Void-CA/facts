import React, { useState, useEffect } from 'react';
import { Plus, Filter, ReceiptText } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import InvoiceForm from '../components/forms/InvoiceForm';
import ConfirmModal from '../components/ConfirmModal';
import InvoiceTable from '../components/invoices/InvoiceTable';
import InvoiceDetail from '../components/invoices/InvoiceDetail';
import { useInvoices } from '../hooks/useInvoices';
import { Invoice } from '../services/types';
import PageHeader from '../components/PageHeader';

const Invoices: React.FC = () => {
    const { invoices, clients, loading, addInvoice, updateInvoice, deleteInvoice } = useInvoices();
    const location = useLocation();
    const [showModal, setShowModal] = useState(false);
    const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

    useEffect(() => {
        if (location.state?.openNew) {
            setShowModal(true);
            setEditingInvoice(null);
            // Clear state to avoid reopening on refresh if possible, 
            // though react-router state persist on refresh usually.
        }
    }, [location.state]);

    const handleFormSubmit = async (data: any) => {
        try {
            if (editingInvoice) {
                await updateInvoice(editingInvoice.id.toString(), data);
            } else {
                await addInvoice(data);
            }
            setShowModal(false);
            setEditingInvoice(null);
        } catch (error) {
            console.error('Operation failed');
        }
    };

    const handleDelete = async () => {
        if (!invoiceToDelete) return;
        try {
            await deleteInvoice(invoiceToDelete.id.toString());
            setInvoiceToDelete(null);
        } catch (error) {
            console.error('Delete failed');
        }
    };

    const handleEdit = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Facturas"
                description="Gestiona y emite tus comprobantes fiscales"
                icon={ReceiptText}
            >
                <button
                    onClick={() => { setEditingInvoice(null); setShowModal(true); }}
                    className="bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus size={20} />
                    Nueva Factura
                </button>
            </PageHeader>

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
                    <InvoiceTable
                        invoices={invoices}
                        clients={clients}
                        onView={setViewingInvoice}
                        onEdit={handleEdit}
                        onDelete={setInvoiceToDelete}
                    />
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
                <InvoiceDetail
                    invoice={viewingInvoice}
                    clients={clients}
                    onClose={() => setViewingInvoice(null)}
                />
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
