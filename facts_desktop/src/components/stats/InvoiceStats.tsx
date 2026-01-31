import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    TrendingUp,
    ReceiptText,
    Clock,
    CheckCircle2,
    AlertCircle,
    Users,
    UserCheck,
    UserX,
    PieChart
} from 'lucide-react';
import invoiceService from '../../services/invoiceService';
import { useClients } from '../../hooks/useClients';
import { Invoice } from '../../services/types';

const InvoiceStats: React.FC = () => {
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { clients } = useClients();

    const months = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun", 
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    const toggleMonth = (monthIndex: number) => {
        setSelectedMonths(prev => 
            prev.includes(monthIndex) 
            ? prev.filter(m => m !== monthIndex) 
            : [...prev, monthIndex].sort((a, b) => a - b)
        );
    };

    const fetchStats = useCallback(async () => {
        if (selectedMonths.length === 0) {
            setInvoices([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const months = selectedMonths.map(monthIndex => ({
                year,
                month: monthIndex + 1
            }));
            const result = await invoiceService.getByMonths(months);
            setInvoices(result);
        } catch (err) {
            console.error(err);
            setError('Error al cargar estadísticas');
        } finally {
            setLoading(false);
        }
    }, [selectedMonths, year]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const getInvoiceTotal = useCallback((invoice: Invoice) => {
        if (typeof invoice.calcTotal === 'number') return invoice.calcTotal;
        return invoice.services?.reduce((sum, s) => sum + s.quantity * s.price, 0) ?? 0;
    }, []);

    const clientById = useMemo(
        () => new Map(clients.map(client => [client.id, client])),
        [clients]
    );

    const totals = useMemo(() => {
        const totalRevenue = invoices.reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
        const pendingAmount = invoices
            .filter(inv => inv.state?.toLowerCase() === 'pendiente')
            .reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
        const overdueAmount = invoices
            .filter(inv => inv.state?.toLowerCase() === 'vencido')
            .reduce((sum, inv) => sum + getInvoiceTotal(inv), 0);
        const paidCount = invoices.filter(inv => inv.state?.toLowerCase() === 'pagado').length;
        const pendingCount = invoices.filter(inv => inv.state?.toLowerCase() === 'pendiente').length;
        const canceledCount = invoices.filter(inv => inv.state?.toLowerCase() === 'cancelado').length;
        const overdueCount = invoices.filter(inv => inv.state?.toLowerCase() === 'vencido').length;
        const averageTicket = invoices.length > 0 ? totalRevenue / invoices.length : 0;

        const typeTotals = invoices.reduce<Record<string, number>>((acc, inv) => {
            const key = (inv.invoiceType || 'Sin tipo').toLowerCase();
            acc[key] = (acc[key] ?? 0) + getInvoiceTotal(inv);
            return acc;
        }, {});

        const clientRevenue = invoices.reduce<Record<number, number>>((acc, inv) => {
            acc[inv.clientId] = (acc[inv.clientId] ?? 0) + getInvoiceTotal(inv);
            return acc;
        }, {});

        const topClients = Object.entries(clientRevenue)
            .map(([clientId, total]) => ({
                clientId: Number(clientId),
                total
            }))
            .sort((a, b) => b.total - a.total)
            .slice(0, 5);

        const activeClients = new Set(invoices.map(inv => inv.clientId)).size;

        return {
            totalRevenue,
            pendingAmount,
            overdueAmount,
            paidCount,
            pendingCount,
            canceledCount,
            overdueCount,
            averageTicket,
            typeTotals,
            topClients,
            activeClients
        };
    }, [invoices, getInvoiceTotal]);

    const formatCurrency = useCallback((value: number) => {
        return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    }, []);

    return (
        <div className="space-y-8">
            {/* Selector de Tiempo Pro */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2 text-primary font-bold text-xl">
                        <Calendar size={24} />
                        <span>Periodo de Análisis</span>
                    </div>
                    
                    {/* Selector de Año */}
                    <div className="flex items-center bg-secondary/50 rounded-lg p-1">
                        <button onClick={() => setYear(y => y - 1)} className="p-2 hover:bg-background rounded-md"><ChevronLeft size={18}/></button>
                        <span className="px-4 font-mono font-bold">{year}</span>
                        <button onClick={() => setYear(y => y + 1)} className="p-2 hover:bg-background rounded-md"><ChevronRight size={18}/></button>
                    </div>
                </div>

                {/* Grid de Meses (Multi-select) */}
                <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-2">
                    {months.map((month, index) => (
                        <button
                            key={month}
                            onClick={() => toggleMonth(index)}
                            className={`py-3 px-2 rounded-xl text-xs font-semibold transition-all border ${
                                selectedMonths.includes(index)
                                ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105'
                                : 'bg-background border-border hover:border-primary/50 text-muted-foreground'
                            }`}
                        >
                            {month}
                        </button>
                    ))}
                </div>
            </div>

            {/* Renderizado de Datos Condicional */}
            {selectedMonths.length > 0 ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-black text-text-main">Resumen de Negocio</h2>
                            <p className="text-xs text-muted-foreground">
                                Meses seleccionados: {selectedMonths.map(m => months[m]).join(', ')} {year}
                            </p>
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                            {selectedMonths.length} meses
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16 bg-secondary/10 rounded-3xl border border-border">
                            <span className="text-primary font-black uppercase tracking-widest animate-pulse">Cargando estadísticas...</span>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-16 bg-red-500/5 rounded-3xl border border-red-500/20">
                            <span className="text-red-600 font-black uppercase tracking-widest">{error}</span>
                        </div>
                    ) : invoices.length === 0 ? (
                        <div className="flex items-center justify-center py-16 bg-secondary/10 rounded-3xl border border-border">
                            <span className="text-muted-foreground font-black uppercase tracking-widest">
                                No hay facturas en los meses seleccionados
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                <div className="group bg-surface p-6 rounded-4xl border border-border/50 shadow-sm">
                                    <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-5">
                                        <ReceiptText size={22} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/60">Facturas</span>
                                    <p className="text-3xl font-black text-text-main tracking-tighter">{invoices.length}</p>
                                </div>
                                <div className="group bg-surface p-6 rounded-4xl border border-border/50 shadow-sm">
                                    <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-5">
                                        <TrendingUp size={22} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/60">Ingresos</span>
                                    <p className="text-3xl font-black text-text-main tracking-tighter">{formatCurrency(totals.totalRevenue)}</p>
                                </div>
                                <div className="group bg-surface p-6 rounded-4xl border border-border/50 shadow-sm">
                                    <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mb-5">
                                        <Clock size={22} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/60">Saldo pendiente</span>
                                    <p className="text-3xl font-black text-text-main tracking-tighter">{formatCurrency(totals.pendingAmount + totals.overdueAmount)}</p>
                                </div>
                                <div className="group bg-surface p-6 rounded-4xl border border-border/50 shadow-sm">
                                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-5">
                                        <PieChart size={22} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/60">Ticket promedio</span>
                                    <p className="text-3xl font-black text-text-main tracking-tighter">{formatCurrency(totals.averageTicket)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-surface rounded-4xl border border-border/50 p-6 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <BarChart3 size={18} className="text-primary" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Estados de facturas</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center justify-between p-4 bg-emerald-500/10 rounded-2xl">
                                            <div className="flex items-center gap-2 text-emerald-600">
                                                <CheckCircle2 size={16} />
                                                <span className="text-xs font-black uppercase tracking-widest">Pagadas</span>
                                            </div>
                                            <span className="text-lg font-black text-emerald-700">{totals.paidCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-amber-500/10 rounded-2xl">
                                            <div className="flex items-center gap-2 text-amber-600">
                                                <Clock size={16} />
                                                <span className="text-xs font-black uppercase tracking-widest">Pendientes</span>
                                            </div>
                                            <span className="text-lg font-black text-amber-700">{totals.pendingCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-red-500/10 rounded-2xl">
                                            <div className="flex items-center gap-2 text-red-600">
                                                <AlertCircle size={16} />
                                                <span className="text-xs font-black uppercase tracking-widest">Vencidas</span>
                                            </div>
                                            <span className="text-lg font-black text-red-700">{totals.overdueCount}</span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-500/10 rounded-2xl">
                                            <div className="flex items-center gap-2 text-slate-600">
                                                <AlertCircle size={16} />
                                                <span className="text-xs font-black uppercase tracking-widest">Canceladas</span>
                                            </div>
                                            <span className="text-lg font-black text-slate-700">{totals.canceledCount}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">Por tipo</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {Object.entries(totals.typeTotals).map(([type, total]) => (
                                                <div key={type} className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/40">
                                                    <span className="text-xs font-black uppercase tracking-widest text-text-main">{type}</span>
                                                    <span className="text-xs font-black text-text-main">{formatCurrency(total)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-surface rounded-4xl border border-border/50 p-6 space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Users size={18} className="text-primary" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-text-main">Clientes</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                        <div className="p-4 rounded-2xl bg-primary/10 text-primary">
                                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                                <Users size={14} /> Total
                                            </div>
                                            <p className="text-2xl font-black">{clients.length}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600">
                                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                                <UserCheck size={14} /> Activos
                                            </div>
                                            <p className="text-2xl font-black">{totals.activeClients}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-slate-500/10 text-slate-600">
                                            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                                                <UserX size={14} /> Sin movimiento
                                            </div>
                                            <p className="text-2xl font-black">{Math.max(clients.length - totals.activeClients, 0)}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-text-muted">Top clientes</h4>
                                        {totals.topClients.length === 0 ? (
                                            <div className="text-xs text-muted-foreground">No hay datos suficientes.</div>
                                        ) : (
                                            <div className="space-y-2">
                                                {totals.topClients.map((item, index) => {
                                                    const client = clientById.get(item.clientId);
                                                    return (
                                                        <div key={item.clientId} className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/40">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">#{index + 1}</span>
                                                                <span className="text-sm font-bold text-text-main">
                                                                    {client?.name || 'Cliente'}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs font-black text-text-main">{formatCurrency(item.total)}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 bg-secondary/10 rounded-3xl border-2 border-dashed border-border">
                    <BarChart3 className="mx-auto mb-4 text-muted-foreground/50" size={48} />
                    <p className="text-muted-foreground">Selecciona uno o más meses para ver las estadísticas</p>
                </div>
            )}
        </div>
    );
};

export default InvoiceStats;