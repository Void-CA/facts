import React, { useState, useEffect } from 'react';
import FormLayout from '../FormLayout';
import ServiceItem from './ServiceItem';
import { Client, InvoiceItem } from '../../services/types';
import { User, Calendar, FileText, Info, Plus } from 'lucide-react';

interface InvoiceFormData {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    clientId: string;
    items: InvoiceItem[];
    notes: string;
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
    printNumber?: string;
    invoiceType?: string;
    provider?: string;
}

interface InvoiceFormProps {
    initialData?: Partial<InvoiceFormData>;
    clients: Client[];
    onSubmit: (data: any) => void;
    onCancel: () => void;
    isEdit?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
    initialData,
    clients,
    onSubmit,
    onCancel,
    isEdit = false
}) => {
    const [formData, setFormData] = useState<InvoiceFormData>({
        invoiceNumber: initialData?.invoiceNumber || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
        clientId: initialData?.clientId || '',
        items: initialData?.items || [
            { id: '1', description: '', quantity: 1, unitPrice: 0, total: 0 }
        ],
        notes: initialData?.notes || '',
        status: initialData?.status || 'Draft',
        printNumber: initialData?.printNumber || '',
        invoiceType: initialData?.invoiceType || 'Factura A',
        provider: initialData?.provider || ''
    });

    const [total, setTotal] = useState(0);

    useEffect(() => {
        const newTotal = formData.items.reduce((sum, item) => sum + item.total, 0);
        setTotal(newTotal);
    }, [formData.items]);

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newItems = [...formData.items];
        const item = { ...newItems[index], [field]: value };

        if (field === 'quantity') {
            item.quantity = value;
            item.total = value * item.unitPrice;
        } else if (field === 'unitPrice') {
            item.unitPrice = value;
            item.total = item.quantity * value;
        } else {
            (item as any)[field] = value;
        }

        newItems[index] = item;
        setFormData({ ...formData, items: newItems });
    };

    const handleAddItem = () => {
        const newItem: InvoiceItem = {
            id: (formData.items.length + 1).toString(),
            description: '',
            quantity: 1,
            unitPrice: 0,
            total: 0
        };
        setFormData({ ...formData, items: [...formData.items, newItem] });
    };

    const handleRemoveItem = (index: number) => {
        if (formData.items.length === 1) {
            handleUpdateItem(0, 'description', '');
            handleUpdateItem(0, 'quantity', 1);
            handleUpdateItem(0, 'unitPrice', 0);
            return;
        }
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.16;
        const calcTotal = subtotal + tax;

        onSubmit({
            ...formData,
            subtotal,
            tax,
            calcTotal
        });
    };

    return (
        <FormLayout
            title="Factura"
            isEdit={isEdit}
            onSubmit={handleSubmit}
            onCancel={onCancel}
        >
            {/* Grid Superior: 3 Secciones */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Sección: Cliente */}
                <div className="bg-background rounded-2xl p-6 border border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                        <User className="text-primary" size={20} />
                        <h2 className="font-bold text-text-main">Cliente</h2>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Nombre del Cliente</label>
                        <select
                            value={formData.clientId}
                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            required
                        >
                            <option value="">Seleccionar cliente...</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Sección: Fechas */}
                <div className="bg-background rounded-2xl p-6 border border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="text-primary" size={20} />
                        <h2 className="font-bold text-text-main">Fechas</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Emisión</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Vencimiento</label>
                            <input
                                type="date"
                                value={formData.dueDate}
                                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Sección: Detalles */}
                <div className="bg-background rounded-2xl p-6 border border-border/50">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="text-primary" size={20} />
                        <h2 className="font-bold text-text-main">Detalles</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Nº Imp.</label>
                            <input
                                type="text"
                                value={formData.printNumber}
                                onChange={(e) => setFormData({ ...formData, printNumber: e.target.value })}
                                className="w-full bg-surface border border-border rounded-lg px-2 py-2 text-sm text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="001..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Tipo</label>
                            <select
                                value={formData.invoiceType}
                                onChange={(e) => setFormData({ ...formData, invoiceType: e.target.value })}
                                className="w-full bg-surface border border-border rounded-lg px-2 py-2 text-sm text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            >
                                <option value="Factura A">Factura A</option>
                                <option value="Factura B">Factura B</option>
                                <option value="Recibo">Recibo</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Estado</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full bg-surface border border-border rounded-lg px-2 py-2 text-sm text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            >
                                <option value="Draft">Borrador</option>
                                <option value="Paid">Pagada</option>
                                <option value="Overdue">Vencida</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Inferior: Servicios y Notas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Servicios */}
                <div className="lg:col-span-8 bg-background rounded-2xl p-6 border border-border/50 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Plus className="text-primary" size={18} />
                            </div>
                            <h2 className="font-bold text-text-main">Servicios / Conceptos</h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="text-primary text-sm font-bold hover:underline underline-offset-4 flex items-center gap-1"
                        >
                            <Plus size={16} /> Agregar concepto
                        </button>
                    </div>

                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {formData.items.map((item, index) => (
                            <ServiceItem
                                key={index}
                                index={index}
                                quantity={item.quantity}
                                specification={item.description}
                                price={item.unitPrice}
                                onUpdate={handleUpdateItem}
                                onRemove={handleRemoveItem}
                            />
                        ))}
                    </div>
                </div>

                {/* Notas y Total */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-background rounded-2xl p-6 border border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Info className="text-primary" size={20} />
                            <h2 className="font-bold text-text-main">Detalles Opcionales</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Proveedor</label>
                                <input
                                    type="text"
                                    value={formData.provider}
                                    onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Nombre del proveedor..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Notas</label>
                                <textarea
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text-main h-32 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                    placeholder="Notas adicionales..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary text-white rounded-2xl p-6 shadow-xl shadow-primary/20">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white/80 font-medium">Subtotal</span>
                            <span className="font-bold">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/20 text-sm">
                            <span className="text-white/80">IVA (16%)</span>
                            <span>${(total * 0.16).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">Total</span>
                            <span className="text-3xl font-black">${(total * 1.16).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </FormLayout>
    );
};

export default InvoiceForm;
