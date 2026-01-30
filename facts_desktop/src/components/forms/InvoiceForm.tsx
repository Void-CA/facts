import React, { useState, useEffect } from 'react';
import FormLayout from '../FormLayout';
import ServicesTable from './ServicesTable';
import ClientSelect from './ClientSelect';
import ThemedSelect from './ThemedSelect';
import { Client, Invoice, InvoiceItem } from '../../services/types';
import { User, Calendar, FileText, Info } from 'lucide-react';
import invoiceService from '../../services/invoiceService';

interface InvoiceFormProps {
    initialData?: Partial<Invoice>;
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
    const [formData, setFormData] = useState<Omit<Invoice, 'id' | 'calcTotal'>>({
        clientId: initialData?.clientId || 0,
        emittedDate: initialData?.emittedDate || new Date().toISOString().split('T')[0],
        expireDate: initialData?.expireDate || new Date().toISOString().split('T')[0],
        state: initialData?.state || 'pendiente',
        invoiceType: initialData?.invoiceType || 'Ingreso',
        printNumber: initialData?.printNumber || 0,
        description: initialData?.description || '',
        providerName: initialData?.providerName || '',
        services: initialData?.services || [
            { id: 0, specification: '', quantity: 1, price: 0, subtotal: 0 }
        ]
    });

    const [total, setTotal] = useState(0);

    useEffect(() => {
        const newTotal = formData.services.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
        setTotal(newTotal);
    }, [formData.services]);

    useEffect(() => {
        const fetchLastNumber = async () => {
            if (!isEdit && !initialData?.printNumber) {
                try {
                    const lastNumber = await invoiceService.getLastPrintNumber();
                    setFormData(prev => ({ ...prev, printNumber: lastNumber + 1 }));
                } catch (error) {
                    console.error("Error fetching last print number:", error);
                }
            }
        };

        fetchLastNumber();
    }, [isEdit, initialData]);

    const handleUpdateItem = (index: number, field: string, value: any) => {
        const newServices = [...formData.services];
        const item = { ...newServices[index] };

        // Actualizamos el campo específico
        (item as any)[field] = value;

        // Recalculamos el subtotal del item si cambió precio o cantidad
        if (field === 'quantity' || field === 'price') {
            item.subtotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
        }

        newServices[index] = item;
        setFormData({ ...formData, services: newServices });
    };

    const handleAddItem = () => {
        const newItem: InvoiceItem = {
            id: 0,
            specification: '',
            quantity: 1,
            price: 0,
            subtotal: 0
        };
        setFormData({ ...formData, services: [...formData.services, newItem] });
    };

    const handleRemoveItem = (index: number) => {
        if (formData.services.length === 1) {
            handleUpdateItem(0, 'specification', '');
            handleUpdateItem(0, 'quantity', 1);
            handleUpdateItem(0, 'price', 0);
            return;
        }
        const newServices = formData.services.filter((_, i) => i !== index);
        setFormData({ ...formData, services: newServices });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prepare payload for backend
        const payload = {
            ...formData,
            clientId: Number(formData.clientId),
            printNumber: Number(formData.printNumber),
            services: formData.services.map(s => ({
                ...s,
                quantity: Number(s.quantity) || 0,
                price: Number(s.price) || 0
            }))
        };

        onSubmit(payload);
    };

    const typeOptions = [
        { value: 'Ingreso', label: 'Ingreso' },
        { value: 'Egreso', label: 'Egreso' },
        { value: 'Caja', label: 'Caja' }
    ];

    const stateOptions = [
        { value: 'pendiente', label: 'Pendiente' },
        { value: 'pagado', label: 'Pagada' },
        { value: 'cancelado', label: 'Cancelada' }
    ];

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
                        <ClientSelect
                            clients={clients}
                            selectedClientId={formData.clientId.toString()}
                            onSelect={(id: string) => setFormData({ ...formData, clientId: Number(id) })}
                        />
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
                                value={formData.emittedDate.split('T')[0]}
                                onChange={(e) => setFormData({ ...formData, emittedDate: e.target.value })}
                                className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Vencimiento</label>
                            <input
                                type="date"
                                value={formData.expireDate?.split('T')[0] || ''}
                                onChange={(e) => setFormData({ ...formData, expireDate: e.target.value })}
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
                                type="number"
                                value={formData.printNumber || ''}
                                onChange={(e) => setFormData({ ...formData, printNumber: Number(e.target.value) })}
                                className="w-full bg-surface border border-border rounded-lg px-2 py-2 text-sm text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="001..."
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Tipo</label>
                            <ThemedSelect
                                size="sm"
                                options={typeOptions}
                                value={formData.invoiceType}
                                onChange={(val) => setFormData({ ...formData, invoiceType: val })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Estado</label>
                            <ThemedSelect
                                size="sm"
                                options={stateOptions}
                                value={formData.state}
                                onChange={(val) => setFormData({ ...formData, state: val as any })}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid Inferior: Servicios y Notas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Tabla de Servicios */}
                <div className="lg:col-span-8 bg-background rounded-2xl p-6 border border-border/50 flex flex-col">
                    <ServicesTable
                        items={formData.services}
                        onUpdate={handleUpdateItem}
                        onRemove={handleRemoveItem}
                        onAdd={handleAddItem}
                    />
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
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Proveedor / Negocio</label>
                                <input
                                    type="text"
                                    value={formData.providerName}
                                    onChange={(e) => setFormData({ ...formData, providerName: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Nombre del proveedor o comercio..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Notas / Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                            <span className="text-white/80">IVA (Incluido)</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xl font-bold">Total</span>
                            <span className="text-3xl font-black">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </FormLayout>
    );
};

export default InvoiceForm;
