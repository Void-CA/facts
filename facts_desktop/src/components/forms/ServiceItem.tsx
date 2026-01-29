import React from 'react';
import { X } from 'lucide-react';

interface ServiceItemProps {
    index: number;
    quantity: number;
    specification: string;
    price: number;
    onUpdate: (index: number, field: string, value: any) => void;
    onRemove: (index: number) => void;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
    index,
    quantity,
    specification,
    price,
    onUpdate,
    onRemove
}) => {
    const subtotal = (quantity * price).toFixed(2);

    return (
        <div className="service-item grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-border rounded-xl bg-background/50 hover:bg-background transition-colors group">
            <div className="md:col-span-2">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">Cantidad</label>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="0"
                />
            </div>
            <div className="md:col-span-4">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">Descripción</label>
                <input
                    type="text"
                    value={specification}
                    onChange={(e) => onUpdate(index, 'specification', e.target.value)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Descripción del servicio"
                />
            </div>
            <div className="md:col-span-3">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block">Precio</label>
                <input
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => onUpdate(index, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="0.00"
                />
            </div>
            <div className="md:col-span-2 flex flex-col justify-end">
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1 block md:text-right">Subtotal</label>
                <div className="text-lg font-bold text-primary md:text-right h-[42px] flex items-center justify-end">
                    ${parseFloat(subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            </div>
            <div className="md:col-span-1 flex items-end justify-center pb-1">
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-text-muted hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default ServiceItem;
