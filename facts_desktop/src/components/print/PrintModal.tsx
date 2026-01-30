import React, { useState, useEffect } from 'react';
import { X, Printer, Check, LayoutTemplate } from 'lucide-react';
import printService, { PrintLayout } from '../../services/printService';
import { Loader2 } from 'lucide-react';

interface PrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (layoutId: number) => void;
    loading?: boolean;
}

const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose, onConfirm, loading = false }) => {
    const [layouts, setLayouts] = useState<PrintLayout[]>([]);
    const [selectedLayoutId, setSelectedLayoutId] = useState<number | null>(null);
    const [loadingLayouts, setLoadingLayouts] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadLayouts();
        }
    }, [isOpen]);

    const loadLayouts = async () => {
        try {
            setLoadingLayouts(true);
            const data = await printService.getLayouts();
            setLayouts(data);
            if (data.length > 0) {
                setSelectedLayoutId(data[0].id);
            }
        } catch (error) {
            console.error('Error loading layouts:', error);
        } finally {
            setLoadingLayouts(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
            <div className="bg-background border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-border bg-surface/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Printer size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-text-main">Seleccionar Layout</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-text-muted hover:bg-surface hover:text-text-main rounded-xl transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {loadingLayouts ? (
                        <div className="py-8 text-center text-text-muted flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin" size={24} />
                            <span className="text-sm font-medium">Cargando layouts...</span>
                        </div>
                    ) : layouts.length === 0 ? (
                        <div className="py-8 text-center text-text-muted p-4 bg-surface rounded-2xl border border-dashed border-border">
                            <LayoutTemplate className="mx-auto mb-2 opacity-50" size={32} />
                            <p className="font-medium">No se encontraron layouts.</p>
                            <p className="text-xs mt-1">Configura un layout en Ajustes primero.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-text-muted uppercase tracking-widest pl-1">
                                Layout de Impresión
                            </label>
                            <div className="grid grid-cols-1 gap-3">
                                {layouts.map((layout) => (
                                    <button
                                        key={layout.id}
                                        onClick={() => setSelectedLayoutId(layout.id)}
                                        className={`relative p-4 rounded-xl border-2 text-left transition-all group ${selectedLayoutId === layout.id
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border bg-surface hover:border-primary/30'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`font-bold ${selectedLayoutId === layout.id ? 'text-primary' : 'text-text-main'}`}>
                                                {layout.name}
                                            </span>
                                            {selectedLayoutId === layout.id && (
                                                <Check size={16} className="text-primary" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-text-muted">
                                            <Printer size={12} />
                                            <span>{layout.printerName || 'Sin impresora asignada'}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-border bg-surface/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2.5 rounded-xl font-medium text-text-muted hover:bg-surface hover:text-text-main transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => selectedLayoutId && onConfirm(selectedLayoutId)}
                        disabled={!selectedLayoutId || loading || loadingLayouts || layouts.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Imprimiendo...
                            </>
                        ) : (
                            <>
                                <Printer size={18} />
                                Imprimir
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrintModal;
