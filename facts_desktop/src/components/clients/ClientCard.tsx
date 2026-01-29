import React from 'react';
import { Edit2, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { Client } from '../../services/types';

interface ClientCardProps {
    client: Client;
    onEdit: (client: Client) => void;
    onDelete: (client: Client) => void;
}

const ClientCard: React.FC<ClientCardProps> = ({
    client,
    onEdit,
    onDelete
}) => {
    return (
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xl uppercase">
                    {client.name.charAt(0)}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(client)}
                        className="p-2 text-text-muted hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                        title="Editar"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(client)}
                        className="p-2 text-text-muted hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
                        title="Eliminar"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <h3 className="text-lg font-bold text-text-main mb-1">{client.name}</h3>
            <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider bg-background px-2 py-0.5 rounded border border-border">
                    RUC: {client.ruc || 'Sin ID'}
                </span>
            </div>

            <div className="space-y-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Mail size={14} className="text-primary/60" />
                    <span className="truncate" title={client.email}>{client.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <Phone size={14} className="text-primary/60" />
                    <span>{client.phone || 'Sin teléfono'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-muted">
                    <MapPin size={14} className="text-primary/60" />
                    <span className="line-clamp-1" title={client.address}>{client.address || 'Sin dirección'}</span>
                </div>
            </div>
        </div>
    );
};

export default ClientCard;
