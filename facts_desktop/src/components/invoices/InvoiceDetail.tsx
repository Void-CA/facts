import React from 'react';
import { X, Download } from 'lucide-react';
import { Invoice, Client } from '../../services/types';

interface InvoiceDetailProps {
    invoice: Invoice;
    clients: Client[];
    onClose: () => void;
}

const InvoiceDetail: React.FC<InvoiceDetailProps> = ({
    invoice,
    clients,
    onClose
}) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pagado': return 'text-green-500 bg-green-500/10';
            case 'vencido': case 'overdue': return 'text-red-500 bg-red-500/10';
            case 'pendiente': case 'draft': return 'text-text-muted bg-text-muted/10';
            default: return 'text-primary bg-primary/10';
        }
    };

    const client = clients.find(c => c.id === invoice.clientId);

    console.log(invoice);
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-surface border border-border w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border flex justify-between items-center bg-background/30">
                    <div>
                        <h2 className="text-2xl font-black text-text-main tracking-tight">Detalle de Factura</h2>
                        <p className="text-primary font-bold">#{invoice.printNumber}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-red-50 hover:text-red-500 rounded-xl transition-all">
                        <X size={24} />
                    </button>
                </div>
                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Cliente</p>
                                <p className="text-lg font-bold text-text-main">{client?.name || 'N/A'}</p>
                                <p className="text-sm text-text-muted">{client?.ruc}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Tipo / Proveedor</p>
                                <p className="text-text-main font-medium">{invoice.invoiceType} - {invoice.provider || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-right">
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Emisión</p>
                                <p className="text-text-main font-medium">{new Date(invoice.emittedDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Estado</p>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(invoice.state)}`}>
                                    {invoice.state}
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
                                {invoice.services?.map((s, i) => (
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
                            <span className="text-2xl font-black text-primary">${(invoice.calcTotal || 0).toLocaleString()}</span>
                        </div>
                    </div>

                    {invoice.description && (
                        <div className="bg-background/50 p-4 rounded-2xl border border-border/50">
                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2">Notas / Observaciones</p>
                            <p className="text-sm text-text-main italic">{invoice.description}</p>
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
    );
};

export default InvoiceDetail;
