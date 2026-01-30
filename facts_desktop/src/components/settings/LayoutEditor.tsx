import React, { useState, useEffect } from 'react';
import printService, { PrintLayout, LayoutFields, PrintField } from '../../services/printService';
import { Monitor, Printer, Check, List } from 'lucide-react';
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
    const [loadingPrinters, setLoadingPrinters] = useState(false);

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
                        <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Ajustes Generales */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                        <Monitor size={20} className="text-primary" />
                        Configuración General
                    </h3>

                    <div className="space-y-4 bg-surface/30 p-5 rounded-2xl border border-border">
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Nombre del Layout</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 bg-background border border-border rounded-xl focus:border-primary transition-all"
                                placeholder="Ej. Ticket Térmico 80mm"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-1">Ancho (mm)</label>
                                <input
                                    type="number"
                                    required
                                    value={pageWidth}
                                    onChange={(e) => setPageWidth(parseFloat(e.target.value))}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-xl"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-1">Alto (mm)</label>
                                <input
                                    type="number"
                                    required
                                    value={pageHeight}
                                    onChange={(e) => setPageHeight(parseFloat(e.target.value))}
                                    className="w-full px-4 py-2 bg-background border border-border rounded-xl"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Impresora Destino</label>
                            <div className="relative">
                                <Printer className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                                <select
                                    value={printerName}
                                    onChange={(e) => setPrinterName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl appearance-none focus:border-primary transition-all"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {printers.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Configuración de Campos */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                        <Check size={20} className="text-primary" />
                        Campos y Posiciones
                    </h3>

                    <div className="grid grid-cols-1 gap-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-2">Cabecera</h4>
                        {renderFieldInput('cliente', 'Cliente')}
                        {renderFieldInput('ruc', 'RUC / CI')}
                        {renderFieldInput('fecha', 'Fecha Emisión')}
                        {renderFieldInput('numero', 'Nº Factura')}
                        
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mt-4 flex items-center gap-2">
                            <List size={12} /> Cuerpo del Documento
                        </h4>
                        {renderFieldInput('servicios', 'Tabla de Servicios')}
                        
                        <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mt-4">Totales y Otros</h4>
                        {renderFieldInput('total', 'Importe Total')}
                        {renderFieldInput('descripcion', 'Observaciones')}
                    </div>
                </div>
            </div>
        </FormLayout>
    );
};

export default LayoutEditor;