import React, { useState, useEffect } from 'react';
import printService, { PrintLayout, LayoutFields, PrintField } from '../../services/printService';
import { Monitor, Printer, Loader2, Eye, LayoutTemplate, Settings2 } from 'lucide-react';
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
    total: { x: 50, y: 150, enabled: true },
    estado: { x: 10, y: 150, enabled: true },
    descripcion: { x: 10, y: 60, enabled: true },
    // Campos añadidos para el cuerpo de la factura
    servicios: { x: 10, y: 80, enabled: true, fontSize: 9 },
    rowHeight: 8
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
    const [, setLoadingPrinters] = useState(false);
    // 1. Añade estos estados
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

    // 2. Efecto para actualizar la preview cuando cambien los campos
    useEffect(() => {
        const timer = setTimeout(() => {
            generatePreview();
        }, 800); // Espera 800ms después de que el usuario deje de escribir
        return () => clearTimeout(timer);
    }, [fields, pageWidth, pageHeight]);

    const generatePreview = async () => {
        try {
            setIsGeneratingPreview(true);

            const tempLayout: PrintLayout = {
                id: layout?.id || 0,
                name: name || 'Preview',
                printerName: printerName || '',
                pageWidthMm: pageWidth || 210,
                pageHeightMm: pageHeight || 297,
                fieldsJson: JSON.stringify(fields), // Aquí van los cambios actuales
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const base64 = await printService.getPreview(1, tempLayout);
            setPreviewUrl(`data:image/png;base64,${base64}`);
        } catch (err: any) {
            const msg = err.response?.data?.detail || "Error interno del servidor";
            console.error("Detalle del error:", msg);
        } finally {
            setIsGeneratingPreview(false);
        }
    };

    useEffect(() => {
        loadPrinters();
    }, []);

    const loadPrinters = async () => {
        try {
            setLoadingPrinters(true);
            const list = await printService.getPrinters();
            setPrinters(list);
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

    const handleFieldChange = (key: keyof LayoutFields, value: any) => {
        setFields(prev => ({
            ...prev,
            [key]: typeof value === 'object' ? { ...prev[key as keyof LayoutFields] as object, ...value } : value
        }));
    };

    const renderFieldInput = (key: string, label: string) => {
        const fieldKey = key as keyof LayoutFields;
        const field = fields[fieldKey] as PrintField;

        // Si es rowHeight, no renderizamos el bloque estándar de coordenadas
        if (key === 'rowHeight') return null;

        return (
            <div className={`border border-border rounded-xl p-4 space-y-3 transition-all ${field?.enabled ? 'bg-surface/50 border-primary/20' : 'bg-background/50 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-text-main capitalize">{label}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={field?.enabled || false}
                            onChange={(e) => handleFieldChange(fieldKey, { enabled: e.target.checked })}
                        />
                        <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                {field?.enabled && (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">X (mm)</label>
                            <input
                                type="number"
                                value={field.x}
                                onChange={(e) => handleFieldChange(fieldKey, { x: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Y (mm)</label>
                            <input
                                type="number"
                                value={field.y}
                                onChange={(e) => handleFieldChange(fieldKey, { y: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-sm"
                            />
                        </div>
                        <div className="col-span-2 lg:col-span-1">
                            <label className="block text-[10px] font-bold text-text-muted uppercase mb-1">Tamaño Fuente</label>
                            <input
                                type="number"
                                value={field.fontSize || 10}
                                onChange={(e) => handleFieldChange(fieldKey, { fontSize: parseFloat(e.target.value) || 10 })}
                                className="w-full px-3 py-1.5 bg-background border border-border rounded-lg text-sm"
                            />
                        </div>

                        {/* Input especial para rowHeight si estamos en el campo servicios */}
                        {key === 'servicios' && (
                            <div className="col-span-full pt-2 border-t border-border mt-2">
                                <label className="block text-[10px] font-bold text-primary uppercase mb-1">Espaciado entre Filas (mm)</label>
                                <input
                                    type="number"
                                    value={fields.rowHeight || 8}
                                    onChange={(e) => handleFieldChange('rowHeight', parseFloat(e.target.value) || 0)}
                                    className="w-full px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg text-sm font-bold text-primary"
                                    placeholder="Ej. 8"
                                />
                            </div>
                        )}
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
            <div className="flex flex-col xl:flex-row gap-8 items-start">
                {/* Left Panel: Configuration */}
                <div className="flex-1 w-full space-y-8 min-w-0">

                    {/* General Settings Card */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-black text-text-main flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <Settings2 size={20} />
                            </div>
                            Configuración General
                        </h3>

                        <div className="bg-surface/30 p-6 rounded-4xl border border-border space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="col-span-full">
                                    <label className="block text-xs font-black text-text-muted uppercase tracking-wider mb-2 ml-1">Nombre del Layout</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                                        placeholder="Ej. Ticket Térmico 80mm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-text-muted uppercase tracking-wider mb-2 ml-1">Ancho (mm)</label>
                                    <input
                                        type="number"
                                        required
                                        value={pageWidth}
                                        onChange={(e) => setPageWidth(parseFloat(e.target.value))}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-text-muted uppercase tracking-wider mb-2 ml-1">Alto (mm)</label>
                                    <input
                                        type="number"
                                        required
                                        value={pageHeight}
                                        onChange={(e) => setPageHeight(parseFloat(e.target.value))}
                                        className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary font-bold"
                                    />
                                </div>

                                <div className="col-span-full">
                                    <label className="block text-xs font-black text-text-muted uppercase tracking-wider mb-2 ml-1">Impresora Destino</label>
                                    <div className="relative">
                                        <Printer className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-50" size={18} />
                                        <select
                                            value={printerName}
                                            onChange={(e) => setPrinterName(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-xl appearance-none focus:border-primary transition-all font-medium"
                                        >
                                            <option value="">-- Seleccionar Impresora del Sistema --</option>
                                            {printers.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select>
                                    </div>
                                    <p className="mt-2 text-[10px] text-text-muted ml-1">Se intentará usar esta impresora automáticamente al imprimir.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fields Configuration */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-black text-text-main flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                <LayoutTemplate size={20} />
                            </div>
                            Diseño del Documento
                        </h3>

                        <div className="bg-surface/30 rounded-[2rem] border border-border overflow-hidden">
                            <div className="p-2 space-y-2">
                                {/* Header Section */}
                                <div className="bg-background/50 rounded-2xl border border-border/50 p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                        <h4 className="text-xs font-black text-text-main uppercase tracking-widest">Cabecera</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {renderFieldInput('cliente', 'Cliente')}
                                        {renderFieldInput('ruc', 'RUC / CI')}
                                        {renderFieldInput('fecha', 'Fecha Emisión')}
                                        {renderFieldInput('numero', 'Nº Factura')}
                                    </div>
                                </div>

                                {/* Body Section */}
                                <div className="bg-background/50 rounded-2xl border border-border/50 p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                        <h4 className="text-xs font-black text-text-main uppercase tracking-widest">Cuerpo</h4>
                                    </div>
                                    {renderFieldInput('servicios', 'Tabla de Servicios')}
                                </div>

                                {/* Footer Section */}
                                <div className="bg-background/50 rounded-2xl border border-border/50 p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        <h4 className="text-xs font-black text-text-main uppercase tracking-widest">Totales y Pie</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {renderFieldInput('total', 'Importe Total')}
                                        {renderFieldInput('descripcion', 'Observaciones')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Live Preview */}
                <div className="xl:w-120 shrink-0">
                    <div className="sticky top-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black text-text-main flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                    <Eye size={20} />
                                </div>
                                Vista Previa
                            </h3>
                            {isGeneratingPreview && (
                                <div className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse">
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Actualizando...</span>
                                </div>
                            )}
                        </div>

                        <div className="relative w-full bg-zinc-900 border border-border rounded-[2rem] overflow-hidden shadow-2xl shadow-black/20 group">
                            {/* Paper Background */}
                            <div className="w-full min-h-150 max-h-[85vh] overflow-y-auto custom-scrollbar p-8 flex justify-center bg-[#505050]">
                                {previewUrl ? (
                                    <div
                                        className="bg-white shadow-lg transition-opacity duration-300 relative"
                                        style={{
                                            width: `${pageWidth}mm`,
                                            minHeight: `${pageHeight}mm`,
                                            maxWidth: '100%',
                                            opacity: isGeneratingPreview ? 0.7 : 1
                                        }}
                                    >
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 text-zinc-400">
                                        <Loader2 size={48} className="animate-spin mb-4 text-zinc-600" />
                                        <p className="text-sm font-medium">Generando vista previa...</p>
                                    </div>
                                )}
                            </div>

                            {/* Overlay Info */}
                            <div className="absolute bottom-4 right-4 px-4 py-2 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 text-white text-[10px] font-mono">
                                {pageWidth}mm x {pageHeight}mm
                            </div>
                        </div>

                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-3">
                            <div className="mt-1 text-primary">
                                <Monitor size={16} />
                            </div>
                            <p className="text-xs text-text-muted leading-relaxed">
                                <span className="font-bold text-primary">Nota:</span> Esta vista previa usa datos de ejemplo. La impresión real puede variar ligeramente dependiendo de los drivers de la impresora.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </FormLayout>
    );
};

export default LayoutEditor;