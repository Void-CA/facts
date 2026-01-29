import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { InvoiceItem } from '../../services/types';

interface ServicesTableProps {
    items: InvoiceItem[];
    onUpdate: (index: number, field: string, value: any) => void;
    onRemove: (index: number) => void;
    onAdd: () => void;
}

const ServicesTable: React.FC<ServicesTableProps> = ({
    items,
    onUpdate,
    onRemove,
    onAdd
}) => {
    return (
        <div className="w-full flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Plus className="text-primary" size={18} />
                    </div>
                    <h2 className="font-bold text-text-main">Conceptos de Facturación</h2>
                </div>
                <button
                    type="button"
                    onClick={onAdd}
                    className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary/20 transition-all flex items-center gap-2"
                >
                    <Plus size={16} /> Agregar Concepto
                </button>
            </div>

            <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-sm flex-grow">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-background/50 border-b border-border text-[10px] font-bold text-text-muted uppercase tracking-wider">
                                <th className="px-4 py-3 w-20">Cant.</th>
                                <th className="px-4 py-3">Descripción / Servicio</th>
                                <th className="px-4 py-3 w-32">Precio Unit.</th>
                                <th className="px-4 py-3 w-32 text-right">Subtotal</th>
                                <th className="px-4 py-3 w-16 text-center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {items.map((item, index) => (
                                <tr key={index} className="hover:bg-primary/5 transition-colors group items-start">
                                    <td className="px-4 py-3 align-top">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => onUpdate(index, 'quantity', e.target.value)}
                                            className="w-full bg-transparent text-text-main font-medium focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1 transition-all"
                                        />
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <textarea
                                            value={item.description}
                                            onChange={(e) => onUpdate(index, 'description', e.target.value)}
                                            className="w-full bg-transparent text-text-main focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1 transition-all resize-none min-h-[38px] overflow-hidden"
                                            placeholder="Describa el servicio..."
                                            rows={1}
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'auto';
                                                target.style.height = `${target.scrollHeight}px`;
                                            }}
                                            ref={(el) => {
                                                if (el) {
                                                    el.style.height = 'auto';
                                                    el.style.height = `${el.scrollHeight}px`;
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className="px-4 py-3 align-top">
                                        <div className="flex items-center gap-1">
                                            <span className="text-text-muted text-sm">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={item.unitPrice}
                                                onChange={(e) => onUpdate(index, 'unitPrice', e.target.value)}
                                                className="w-full bg-transparent text-text-main font-bold focus:outline-none focus:ring-1 focus:ring-primary/30 rounded px-1 transition-all"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-right align-top">
                                        <span className="text-text-main font-bold">
                                            ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center align-top">
                                        <button
                                            type="button"
                                            onClick={() => onRemove(index)}
                                            className="text-text-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {items.length === 0 && (
                    <div className="p-12 text-center text-text-muted text-sm italic">
                        No hay conceptos agregados. Haga clic en "+ Agregar" para comenzar.
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServicesTable;
