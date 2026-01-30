import React, { useState, useEffect } from 'react';
import printService, { PrintLayout, LayoutFields, PrintField } from '../../services/printService';
import { Monitor, Printer, Check } from 'lucide-react';
import FormLayout from '../FormLayout';

interface LayoutEditorProps {
    layout?: PrintLayout;
    onSave: (layout: PrintLayout) => void;
    onCancel: () => void;
}

const defaultFields: LayoutFields = {
    cliente: { x: 10, y: 10, enabled: true },
    ruc: { x: 10, y: 20, enabled: true },
    fecha: { x: 10, y: 30, enabled: true },
    fechaVencimiento: { x: 50, y: 30, enabled: true },
    tipo: { x: 10, y: 40, enabled: true },
    numero: { x: 50, y: 40, enabled: true },
    proveedor: { x: 10, y: 50, enabled: true },
    total: { x: 50, y: 100, enabled: true },
    estado: { x: 10, y: 100, enabled: true },
    descripcion: { x: 10, y: 60, enabled: true },
};

const LayoutEditor: React.FC<LayoutEditorProps> = ({ layout, onSave, onCancel }) => {
    const [name, setName] = useState(layout?.name || '');
    const [printerName, setPrinterName] = useState(layout?.printerName || '');
    const [pageWidth, setPageWidth] = useState(layout?.pageWidthMm || 210);
    const [pageHeight, setPageHeight] = useState(layout?.pageHeightMm || 297);
    const [fields, setFields] = useState<LayoutFields>(
        layout?.fieldsJson ? JSON.parse(layout.fieldsJson) : defaultFields
    );
    const [printers, setPrinters] = useState<string[]>([]);
    const [loadingPrinters, setLoadingPrinters] = useState(false);

    useEffect(() => {
        loadPrinters();
    }, []);

    const loadPrinters = async () => {
        try {
            setLoadingPrinters(true);
            const list = await printService.getPrinters();
            setPrinters(list);
            // Auto-select first printer if none selected and printers available
            if (!printerName && list.length > 0) {
                setPrinterName(list[0]);
            }
        } catch (error) {
            console.error('Failed to load printers', error);
        } finally {
            setLoadingPrinters(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newLayout: PrintLayout = {
            id: layout?.id || 0,
            name,
            printerName,
            pageWidthMm: pageWidth,
            pageHeightMm: pageHeight,
            fieldsJson: JSON.stringify(fields),
            createdAt: layout?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        onSave(newLayout);
    };

    const handleFieldChange = (key: keyof LayoutFields, field: Partial<PrintField>) => {
        setFields(prev => ({
            ...prev,
            [key]: { ...prev[key]!, ...field }
        }));
    };

    const renderFieldInput = (key: string, label: string) => {
        const fieldKey = key as keyof LayoutFields;
        const field = fields[fieldKey] || { x: 0, y: 0, enabled: false };

        return (
            <div className="bg-surface/50 border border-border rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-text-main capitalize">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={field.enabled}
                            onChange={(e) => handleFieldChange(fieldKey, { enabled: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {field.enabled && (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">X (mm)</label>
                            <input
                                type="number"
                                value={field.x}
                                onChange={(e) => handleFieldChange(fieldKey, { x: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Y (mm)</label>
                            <input
                                type="number"
                                value={field.y}
                                onChange={(e) => handleFieldChange(fieldKey, { y: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Font Size</label>
                            <input
                                type="number"
                                value={field.fontSize || 10}
                                onChange={(e) => handleFieldChange(fieldKey, { fontSize: parseFloat(e.target.value) || 10 })}
                                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <FormLayout
            title={`${layout ? 'Editar' : 'Nuevo'} Layout`}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            isEdit={!!layout}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* General Settings */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                        <Monitor size={20} className="text-primary" />
                        Configuración General
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Nombre del Layout</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                placeholder="Ej. Factura Standard"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Impresora</label>
                            <div className="relative">
                                <Printer className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                {loadingPrinters ? (
                                    <div className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-text-muted italic flex items-center">
                                        <span className="animate-pulse">Buscando impresoras...</span>
                                    </div>
                                ) : printers.length > 0 ? (
                                    <select
                                        value={printerName}
                                        onChange={(e) => setPrinterName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm appearance-none"
                                    >
                                        <option value="">-- Seleccionar Impresora --</option>
                                        {printers.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="text"
                                        value={printerName}
                                        onChange={(e) => setPrinterName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                        placeholder="Nombre exacto de la impresora"
                                    />
                                )}
                            </div>
                            {printers.length === 0 && !loadingPrinters && (
                                <p className="text-xs text-amber-500 mt-1">No se detectaron impresoras. Ingrese el nombre manualmente.</p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-1">Ancho (mm)</label>
                                <input
                                    type="number"
                                    required
                                    value={pageWidth}
                                    onChange={(e) => setPageWidth(parseFloat(e.target.value))}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-1">Alto (mm)</label>
                                <input
                                    type="number"
                                    required
                                    value={pageHeight}
                                    onChange={(e) => setPageHeight(parseFloat(e.target.value))}
                                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-text-main focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fields Configuration */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                        <Check size={20} className="text-primary" />
                        Campos a Imprimir
                    </h3>

                    <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {renderFieldInput('cliente', 'Cliente')}
                        {renderFieldInput('ruc', 'RUC / CI')}
                        {renderFieldInput('fecha', 'Fecha Emisión')}
                        {renderFieldInput('fechaVencimiento', 'Fecha Vencimiento')}
                        {renderFieldInput('numero', 'Número Factura')}
                        {renderFieldInput('tipo', 'Tipo Comprobante')}
                        {renderFieldInput('proveedor', 'Datos Proveedor')}
                        {renderFieldInput('descripcion', 'Descripción/Nota')}
                        {renderFieldInput('total', 'Total General')}
                    </div>
                </div>
            </div>
        </FormLayout>
    );
};

export default LayoutEditor;
