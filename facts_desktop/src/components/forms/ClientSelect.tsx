import React, { useState, useRef, useEffect } from 'react';
import { Client } from '../../services/types';
import { Search, ChevronDown, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ClientSelectProps {
    clients: Client[];
    selectedClientId: string;
    onSelect: (clientId: string) => void;
    placeholder?: string;
}

const ClientSelect: React.FC<ClientSelectProps> = ({
    clients,
    selectedClientId,
    onSelect,
    placeholder = "Seleccionar cliente..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const selectedClient = clients.find(c => c.id === selectedClientId);

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (clientId: string) => {
        onSelect(clientId);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Display / Trigger */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full bg-surface border border-border rounded-xl px-4 py-2.5 cursor-pointer transition-all hover:border-primary/50 ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}`}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`truncate ${selectedClient ? 'text-text-main' : 'text-text-muted'}`}>
                        {selectedClient ? selectedClient.name : placeholder}
                    </span>
                </div>
                <ChevronDown className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={20} />
            </div>

            {/* Dropdown Panel */}
            {isOpen && (
                <div className="absolute z-[60] mt-2 w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search Input */}
                    <div className="p-2 border-b border-border bg-background/30">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                            <input
                                type="text"
                                autoFocus
                                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-text-main focus:outline-none focus:ring-1 focus:ring-primary outline-none"
                                placeholder="Buscar cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {filteredClients.length > 0 ? (
                            filteredClients.map(client => (
                                <div
                                    key={client.id}
                                    onClick={() => handleSelect(client.id)}
                                    className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/10 transition-colors flex flex-col ${selectedClientId === client.id ? 'bg-primary/5' : ''}`}
                                >
                                    <span className={`font-bold ${selectedClientId === client.id ? 'text-primary' : 'text-text-main'}`}>
                                        {client.name}
                                    </span>
                                    <span className="text-xs text-text-muted">{client.taxId || 'Sin RUC'}</span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-text-muted text-sm italic">
                                No se encontraron resultados
                            </div>
                        )}
                    </div>

                    {/* Footer: Create New */}
                    <div
                        onClick={() => navigate('/clients')}
                        className="p-3 bg-primary/5 border-t border-border hover:bg-primary/10 cursor-pointer transition-colors group"
                    >
                        <div className="flex items-center gap-2 text-primary text-sm font-bold justify-center">
                            <UserPlus size={16} />
                            Crear nuevo cliente
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientSelect;
