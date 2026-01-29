import React from 'react';
import { FileText, Eye, Edit2, Trash2 } from 'lucide-react';
import { Invoice, Client } from '../../services/types';

interface InvoiceTableProps {
    invoices: Invoice[];
    clients: Client[];
    onView: (invoice: Invoice) => void;
    onEdit: (invoice: Invoice) => void;
    onDelete: (invoice: Invoice) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
    invoices,
    clients,
    onView,
    onEdit,
    onDelete
}) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pagado': return 'text-green-500 bg-green-500/10';
            case 'vencido': case 'overdue': return 'text-red-500 bg-red-500/10';
            case 'pendiente': case 'draft': return 'text-text-muted bg-text-muted/10';
            default: return 'text-primary bg-primary/10';
        }
    };

    return (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden transition-all shadow-sm">
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
                                    <button onClick={() => onView(invoice)} className="p-2 text-text-muted hover:text-primary transition-colors hover:bg-primary/5 rounded-lg">
                                        <Eye size={18} />
                                    </button>
                                    <button onClick={() => onEdit(invoice)} className="p-2 text-text-muted hover:text-primary transition-colors hover:bg-primary/5 rounded-lg">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => onDelete(invoice)} className="p-2 text-text-muted hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg">
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
        </div>
    );
};

export default InvoiceTable;
