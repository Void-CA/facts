import React, { useState } from 'react';
import {
    Download,
    Calendar as CalendarIcon,
    FileSpreadsheet,
    FileText as FileCsv,
    FileType,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import invoiceService from '../services/invoiceService';
import PageHeader from '../components/PageHeader';

const Export: React.FC = () => {
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [format, setFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            setSuccess(false);

            const blob = await invoiceService.exportInvoices(startDate, endDate, format);

            // Determine file extension
            const extension = format === 'excel' ? 'xlsx' : format === 'csv' ? 'csv' : 'pdf';

            // Show save dialog
            const path = await save({
                defaultPath: `facturas_${startDate}_al_${endDate}.${extension}`,
                filters: [{
                    name: format.toUpperCase(),
                    extensions: [extension]
                }]
            });

            if (!path) {
                setLoading(false);
                return; // User cancelled
            }

            // Convert blob to ArrayBuffer and write to file
            const buffer = await blob.arrayBuffer();
            await writeFile(path, new Uint8Array(buffer));

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error('Export failed', error);
            alert('Error al exportar las facturas. Por favor intente de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const formats = [
        { id: 'excel', name: 'Excel', icon: FileSpreadsheet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { id: 'csv', name: 'CSV (Datos)', icon: FileCsv, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'pdf', name: 'PDF (Resumen)', icon: FileType, color: 'text-red-500', bg: 'bg-red-500/10' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <PageHeader
                title="Exportación"
                description="Descarga tus datos en múltiples formatos"
                icon={Download}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Configuration */}
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-surface p-8 rounded-[2.5rem] border border-border/50 shadow-sm space-y-8">
                        <div className="space-y-6">
                            <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                                <CalendarIcon size={18} className="text-primary" />
                                Rango de Fechas
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Desde</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full bg-background border border-border rounded-2xl px-5 py-3 font-bold text-text-main focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted px-1">Hasta</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full bg-background border border-border rounded-2xl px-5 py-3 font-bold text-text-main focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-8 border-t border-border/30">
                            <h3 className="text-sm font-black text-text-main uppercase tracking-widest flex items-center gap-2">
                                <Download size={18} className="text-primary" />
                                Formato de Salida
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {formats.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFormat(f.id as any)}
                                        className={`group relative p-6 rounded-[2rem] border-2 transition-all duration-300 text-left overflow-hidden ${format === f.id
                                            ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5 scale-[1.02]'
                                            : 'border-border/50 bg-background hover:border-primary/30 hover:bg-primary/5'
                                            }`}
                                    >
                                        <div className={`w-12 h-12 ${f.bg} ${f.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <f.icon size={24} />
                                        </div>
                                        <p className="font-black text-text-main text-sm">{f.name}</p>
                                        {format === f.id && (
                                            <div className="absolute top-4 right-4 text-primary">
                                                <CheckCircle2 size={16} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Actions / Info */}
                <div className="space-y-6">
                    <div className="bg-primary/5 border-2 border-primary/20 rounded-[2.5rem] p-8 space-y-8">
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Resumen de Exportación</h4>
                            <p className="text-xs text-text-muted italic leading-relaxed">
                                Se generará un archivo con toda la información detallada de las facturas, clientes y servicios dentro del periodo seleccionado.
                            </p>
                        </div>


                        <button
                            onClick={handleExport}
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-3 py-5 rounded-[2rem] font-black text-white transition-all shadow-xl active:scale-95 ${loading
                                ? 'bg-primary/70 cursor-not-allowed'
                                : success
                                    ? 'bg-emerald-500 shadow-emerald-500/20'
                                    : 'bg-primary shadow-primary/30 hover:bg-primary/90 hover:scale-[1.02]'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Generando...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2 size={24} />
                                    ¡Listo!
                                </>
                            ) : (
                                <>
                                    <Download size={24} />
                                    Exportar
                                </>
                            )}
                        </button>
                    </div>

                    <div className="p-6 bg-surface-muted/30 border border-border/30 rounded-3xl">
                        <p className="text-[10px] text-text-muted font-bold italic text-center">
                            Tip: El formato Excel es el más recomendado para contabilidad y análisis de datos.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Export;
