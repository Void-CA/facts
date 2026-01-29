import React, { useState } from 'react';
import FormLayout from '../FormLayout';

import { User, Mail, Phone, MapPin, Hash } from 'lucide-react';

interface ClientFormData {
    name: string;
    email: string;
    phone: string;
    address: string;
    ruc: string;
}

interface ClientFormProps {
    initialData?: Partial<ClientFormData>;
    onSubmit: (data: ClientFormData) => void;
    onCancel: () => void;
    isEdit?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isEdit = false
}) => {
    const [formData, setFormData] = useState<ClientFormData>({
        name: initialData?.name || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        address: initialData?.address || '',
        ruc: initialData?.ruc || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <FormLayout
            title="Cliente"
            isEdit={isEdit}
            onSubmit={handleSubmit}
            onCancel={onCancel}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sección: Información Principal */}
                <div className="space-y-6">
                    <div className="bg-background rounded-2xl p-6 border border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="text-primary" size={20} />
                            <h2 className="font-bold text-text-main">Información Personal</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Nombre Completo</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Nombre del cliente..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Dirección</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-text-muted" size={18} />
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-text-main h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                                        placeholder="Dirección fiscal o comercial..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección: Contacto y Fiscal */}
                <div className="space-y-6">
                    <div className="bg-background rounded-2xl p-6 border border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Mail className="text-primary" size={20} />
                            <h2 className="font-bold text-text-main">Contacto</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="correo@ejemplo.com"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Teléfono</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="+595..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-background rounded-2xl p-6 border border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Hash className="text-primary" size={20} />
                            <h2 className="font-bold text-text-main">Identificación Fiscal</h2>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-wider">RUC</label>
                            <input
                                required
                                type="text"
                                value={formData.ruc}
                                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                                className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                placeholder="Ingresar RUC..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </FormLayout>
    );
};

export default ClientForm;
