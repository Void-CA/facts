import React, { useState, useEffect, useMemo } from 'react';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [clientFilter, setClientFilter] = useState('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const controlClass = "px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 dark:[color-scheme:dark]";
    const selectClass = "px-3 py-2 rounded-lg border border-border bg-background text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-primary/30 dark:[color-scheme:dark] dark:bg-surface dark:text-text-main appearance-none";

    useEffect(() => {
        if (location.state?.openNew) {
            setShowModal(true);
            setEditingInvoice(null);
            // Clear state to avoid reopening on refresh if possible, 
            // though react-router state persist on refresh usually.
        }
    }, [location.state]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter, clientFilter, dateFrom, dateTo, pageSize]);

    const clientById = useMemo(
        () => new Map(clients.map(client => [client.id, client.name])),
        [clients]
    );

    const filteredInvoices = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        const fromDate = dateFrom ? new Date(dateFrom) : null;
        const toDate = dateTo ? new Date(dateTo) : null;

        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        if (toDate) toDate.setHours(23, 59, 59, 999);

        return invoices.filter(invoice => {
            const clientName = clientById.get(invoice.clientId) || '';
            const matchesSearch =
                normalizedSearch.length === 0 ||
                clientName.toLowerCase().includes(normalizedSearch) ||
                invoice.printNumber.toString().includes(normalizedSearch);

            const matchesStatus =
                statusFilter === 'all' ||
                invoice.state.toLowerCase() === statusFilter;

            const matchesType =
                typeFilter === 'all' ||
                (invoice.invoiceType || '').toLowerCase() === typeFilter;

            const matchesClient =
                clientFilter === 'all' ||
                invoice.clientId.toString() === clientFilter;

            const emittedDate = new Date(invoice.emittedDate);
            const matchesFrom = !fromDate || emittedDate >= fromDate;
            const matchesTo = !toDate || emittedDate <= toDate;

            return matchesSearch && matchesStatus && matchesType && matchesClient && matchesFrom && matchesTo;
        });
    }, [invoices, clientById, searchTerm, statusFilter, typeFilter, clientFilter, dateFrom, dateTo]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setTypeFilter('all');
        setClientFilter('all');
        setDateFrom('');
        setDateTo('');
    };

    const handlePreset = (preset: 'month' | 'last30' | 'all') => {
        if (preset === 'all') {
            setDateFrom('');
            setDateTo('');
            return;
        }

        const now = new Date();
        if (preset === 'month') {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            setDateFrom(start.toISOString().split('T')[0]);
            setDateTo(end.toISOString().split('T')[0]);
        }

        if (preset === 'last30') {
            const start = new Date();
            start.setDate(start.getDate() - 30);
            setDateFrom(start.toISOString().split('T')[0]);
            setDateTo(now.toISOString().split('T')[0]);
        }
    };

    const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const pagedInvoices = useMemo(() => {
        const start = (safeCurrentPage - 1) * pageSize;
        return filteredInvoices.slice(start, start + pageSize);
    }, [filteredInvoices, safeCurrentPage, pageSize]);

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
                <div className="p-4 border-b border-border bg-background/50 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                            onClick={() => setShowFilters((prev) => !prev)}
                            className="flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text-main transition-colors"
                        >
                            <Filter size={16} />
                            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
                        </button>
                        <div className="text-sm text-text-muted">
                            Total: {filteredInvoices.length} facturas
                        </div>
                    </div>
                    {showFilters && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar cliente o Nº"
                                    className={controlClass}
                                />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="all">Todos los estados</option>
                                    <option value="pagado">Pagado</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="vencido">Vencido</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="all">Todos los tipos</option>
                                    <option value="ingreso">Ingreso</option>
                                    <option value="egreso">Egreso</option>
                                    <option value="caja">Caja</option>
                                </select>
                                <select
                                    value={clientFilter}
                                    onChange={(e) => setClientFilter(e.target.value)}
                                    className={selectClass}
                                >
                                    <option value="all">Todos los clientes</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id.toString()}>
                                            {client.name}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className={controlClass}
                                />
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className={controlClass}
                                />
                                <select
                                    value={pageSize}
                                    onChange={(e) => setPageSize(Number(e.target.value))}
                                    className={selectClass}
                                >
                                    <option value={10}>10 por página</option>
                                    <option value={20}>20 por página</option>
                                    <option value={50}>50 por página</option>
                                </select>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => handlePreset('month')}
                                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-text-muted hover:text-text-main hover:bg-surface transition-colors"
                                >
                                    Este mes
                                </button>
                                <button
                                    onClick={() => handlePreset('last30')}
                                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-text-muted hover:text-text-main hover:bg-surface transition-colors"
                                >
                                    Últimos 30 días
                                </button>
                                <button
                                    onClick={() => handlePreset('all')}
                                    className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-text-muted hover:text-text-main hover:bg-surface transition-colors"
                                >
                                    Todo el tiempo
                                </button>
                                <div className="ml-auto">
                                    <button
                                        onClick={handleClearFilters}
                                        className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-text-muted hover:text-text-main hover:bg-surface transition-colors"
                                    >
                                        Limpiar filtros
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {loading ? (
                    <div className="p-12 text-center text-primary font-bold">Cargando facturas...</div>
                ) : (
                    <InvoiceTable
                        invoices={pagedInvoices}
                        clients={clients}
                        onView={setViewingInvoice}
                        onEdit={handleEdit}
                        onDelete={setInvoiceToDelete}
                    />
                )}
                {!loading && filteredInvoices.length > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-border bg-background/50">
                        <div className="text-xs text-text-muted">
                            Página {safeCurrentPage} de {totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={safeCurrentPage === 1}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-border text-text-muted disabled:opacity-40"
                            >
                                Anterior
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={safeCurrentPage === totalPages}
                                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-border text-text-muted disabled:opacity-40"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
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
