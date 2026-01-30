import React, { useState, useEffect } from 'react';
import { Plus, Printer, Edit2, Trash2, LayoutTemplate } from 'lucide-react';
import printService, { PrintLayout } from '../../services/printService';
import LayoutEditor from './LayoutEditor';

const PrintSettings: React.FC = () => {
    const [layouts, setLayouts] = useState<PrintLayout[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingLayout, setEditingLayout] = useState<PrintLayout | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadLayouts();
    }, []);

    const loadLayouts = async () => {
        try {
            setLoading(true);
            const data = await printService.getLayouts();
            setLayouts(data);
        } catch (error) {
            console.error('Error loading layouts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (layout: PrintLayout) => {
        try {
            await printService.saveLayout(layout);
            await loadLayouts();
            setEditingLayout(null);
            setIsCreating(false);
        } catch (error) {
            console.error('Error saving layout:', error);
            alert('Error al guardar el layout');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este layout?')) return;

        try {
            await printService.deleteLayout(id);
            await loadLayouts();
        } catch (error) {
            console.error('Error deleting layout:', error);
            alert('Error al eliminar el layout');
        }
    };

    if (editingLayout || isCreating) {
        return (
            <LayoutEditor
                layout={editingLayout || undefined}
                onSave={handleSave}
                onCancel={() => {
                    setEditingLayout(null);
                    setIsCreating(false);
                }}
            />
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-text-main flex items-center gap-2">
                        <Printer className="text-primary" />
                        Layouts de Impresión
                    </h2>
                    <p className="text-text-muted mt-1">Configura las posiciones de impresión para tus facturas pre-impresas</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20 active:scale-95"
                >
                    <Plus size={20} />
                    Nuevo Layout
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 rounded-2xl bg-surface border border-border animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {layouts.map(layout => (
                        <div key={layout.id} className="group bg-surface border border-border rounded-2xl p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                    <LayoutTemplate size={24} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingLayout(layout)}
                                        className="p-2 text-text-muted hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(layout.id)}
                                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-text-main mb-2">{layout.name}</h3>

                            <div className="space-y-2 text-sm text-text-muted">
                                <div className="flex items-center gap-2">
                                    <Printer size={14} />
                                    <span>{layout.printerName || 'Sin impresora asignada'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs border border-border px-1.5 py-0.5 rounded">
                                        {layout.pageWidthMm}mm x {layout.pageHeightMm}mm
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}

                    {layouts.length === 0 && (
                        <div className="col-span-full py-12 text-center text-text-muted bg-surface/30 rounded-2xl border border-dashed border-border">
                            <LayoutTemplate size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium">No hay layouts configurados</p>
                            <p className="text-sm">Crea uno nuevo para empezar a imprimir facturas</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PrintSettings;
