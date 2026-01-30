import React from 'react';
import { X, Printer, User, Calendar, Landmark, CreditCard, FileText, Hash, ReceiptText } from 'lucide-react';
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
            case 'pagado': return 'text-green-600 bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20';
            case 'vencido': case 'overdue': return 'text-red-600 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20';
            case 'pendiente': case 'draft': return 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
            default: return 'text-primary bg-primary/5 dark:bg-primary/10 border-primary/20';
        }
    };

    const client = clients.find(c => c.id === invoice.clientId);

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-background border border-border w-full max-w-4xl rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 ease-out">
                {/* Header */}
                <div className="relative p-8 border-b border-border bg-gradient-to-r from-primary/10 via-background to-background">
                    <div className="flex justify-between items-start">
                        <div className="flex gap-4 items-center">
                            <div className="p-4 bg-primary rounded-2xl shadow-lg shadow-primary/20 text-white">
                                <ReceiptText size={32} />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-text-main tracking-tight leading-none mb-1">Detalle de Factura</h2>
                                <div className="flex items-center gap-2 text-primary font-black text-lg">
                                    <Hash size={18} />
                                    <span>{invoice.printNumber}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="group p-3 text-text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 rounded-2xl transition-all duration-200 active:scale-95"
                        >
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {/* Top Info Section - Ultra Clean & Elegant */}
                    <div className="bg-surface/30 border border-border/40 rounded-[2.5rem] p-10">
                        <div className="flex flex-col lg:flex-row justify-between gap-12">
                            {/* Left: Key Identifiers */}
                            <div className="flex-1 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                        <User size={24} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/60 mb-1">Cliente Receptor</span>
                                        <p className="text-xl font-black text-text-main leading-tight">{client?.name || 'N/A'}</p>
                                        <div className="flex items-center gap-2 mt-2 text-text-muted font-bold text-xs bg-surface-muted/50 dark:bg-surface-muted/10 w-fit px-3 py-1 rounded-full border border-border/20">
                                            <span className="opacity-50">RUC:</span> {client?.ruc || 'No registrado'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border/30">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-text-muted mb-1">
                                            <Landmark size={14} className="text-primary/60" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.15em] opacity-60">Proveedor / Negocio</span>
                                        </div>
                                        <p className="text-sm font-bold text-text-main px-0.5">
                                            {invoice.providerName || invoice.provider || <span className="text-text-muted/40 font-medium">No especificado</span>}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-text-muted mb-1">
                                            <CreditCard size={14} className="text-primary/60" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.15em] opacity-60">Tipo de Comprobante</span>
                                        </div>
                                        <p className="text-sm font-bold text-text-main px-0.5">{invoice.invoiceType}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Dates & Status */}
                            <div className="flex-shrink-0 lg:w-72 bg-surface/40 dark:bg-background/20 border border-border/20 rounded-3xl p-6 space-y-6 shadow-sm shadow-black/5">
                                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-text-muted/60">Fecha Emisión</span>
                                        <div className="flex items-center gap-2 text-text-main font-bold">
                                            <Calendar size={14} className="text-primary/50" />
                                            <span className="text-sm">{new Date(invoice.emittedDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-text-muted/60">Vencimiento</span>
                                        <div className="flex items-center gap-2 text-text-main font-bold">
                                            <Calendar size={14} className="text-primary/50" />
                                            <span className="text-sm">{invoice.expireDate ? new Date(invoice.expireDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-border/20 flex flex-col gap-3">
                                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-text-muted/60">Estado de Factura</span>
                                    <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border shadow-sm ${getStatusColor(invoice.state)}`}>
                                        {invoice.state}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description Section - Integrated but distinct */}
                        {invoice.description && (
                            <div className="mt-8 pt-8 border-t border-border/40">
                                <div className="flex items-start gap-3">
                                    <FileText size={18} className="text-primary/50 mt-1" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-text-muted/60 mb-2">Descripción / Notas Adicionales</span>
                                        <p className="text-sm font-medium text-text-main/80 italic leading-relaxed bg-surface-muted/30 dark:bg-surface-muted/10 p-4 rounded-2xl border border-border/10 border-dashed">
                                            "{invoice.description}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Services Table & Totals Unified */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 px-2">
                            <FileText size={20} className="text-primary" />
                            <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Servicios / Conceptos</h3>
                        </div>

                        <div className="border border-border rounded-[2rem] overflow-hidden shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-surface/30 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest">Especificación</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-center w-24">Cant</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Unitario</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-text-muted uppercase tracking-widest text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {invoice.services?.map((s, i) => (
                                        <tr key={i} className="group hover:bg-surface/20 transition-colors duration-150">
                                            <td className="px-6 py-4 text-sm text-text-main font-semibold whitespace-pre-wrap">{s.specification}</td>
                                            <td className="px-6 py-4 text-sm text-text-main text-center font-bold">{s.quantity}</td>
                                            <td className="px-6 py-4 text-sm text-text-main text-right font-medium">
                                                <span className="text-text-muted/60 text-[10px] mr-1">$</span>
                                                {(s.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-main font-black text-right">
                                                <span className="text-primary/60 text-[10px] mr-1">$</span>
                                                {(s.subtotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals Section - Unified with table width and closer */}
                        <div className="bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 rounded-[2rem] p-6 shadow-xl shadow-primary/5">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-black text-text-muted uppercase tracking-[0.2em]">Total</span>
                                <div className="flex items-baseline gap-2 text-primary">
                                    <span className="text-lg font-black opacity-60">$</span>
                                    <span className="text-3xl font-black tracking-tighter">
                                        {(invoice.calcTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-surface/30 border-t border-border flex justify-end gap-4">
                    <button onClick={onClose} className="flex items-center gap-2 px-8 py-3.5 bg-background text-text-main font-black rounded-2xl border border-border hover:bg-surface transition-all duration-200 active:scale-95 shadow-lg shadow-black/5 hover:shadow-xl">
                        Cancelar
                    </button>
                    <button className="flex items-center gap-3 px-8 py-3.5 bg-primary text-white font-black rounded-2xl hover:bg-primary/90 transition-all duration-300 active:scale-95 shadow-xl shadow-primary/30 hover:shadow-primary/40">
                        <Printer size={20} />
                        Imprimir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InvoiceDetail;
