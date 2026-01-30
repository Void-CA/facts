import React from 'react';
import {
    Users,
    ReceiptText,
    TrendingUp,
    ArrowRight,
    Plus,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useInvoices } from '../hooks/useInvoices';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    const { invoices, clients, loading } = useInvoices();

    // Data calculations
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.calcTotal || 0), 0);
    const pendingAmount = invoices
        .filter(inv => inv.state.toLowerCase() === 'pendiente')
        .reduce((sum, inv) => sum + (inv.calcTotal || 0), 0);
    const recentInvoices = [...invoices]
        .sort((a, b) => new Date(b.emittedDate).getTime() - new Date(a.emittedDate).getTime())
        .slice(0, 5);

    const stats = [
        {
            label: 'Ingresos Totales',
            value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            label: 'Saldo Pendiente',
            value: `$${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
        {
            label: 'Clientes Activos',
            value: clients.length.toString(),
            icon: Users,
            color: 'text-primary',
            bg: 'bg-primary/10'
        },
    ];

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-primary font-black animate-pulse uppercase tracking-widest">
                    Cargando Dashboard...
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-text-main tracking-tight leading-none mb-2">Panel de Control</h1>
                    <p className="text-text-muted font-medium italic">Resumen general de tu facturación y actividad.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        to="/invoices"
                        state={{ openNew: true }}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Plus size={18} />
                        Nueva Factura
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="group bg-surface p-8 rounded-[2.5rem] border border-border/50 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                        <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            <stat.icon size={28} />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted/60">{stat.label}</span>
                            <p className="text-3xl font-black text-text-main tracking-tighter">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Invoices Table */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <ReceiptText size={20} className="text-primary" />
                            <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Actividad Reciente</h3>
                        </div>
                        <Link to="/invoices" className="text-[10px] font-black uppercase text-primary tracking-widest hover:underline flex items-center gap-2">
                            Ver todas <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="bg-surface rounded-[2.5rem] border border-border/50 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-surface/50 border-b border-border/50">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.15em]">Factura</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.15em]">Cliente</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.15em] text-right">Total</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-text-muted uppercase tracking-[0.15em] text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {recentInvoices.map((inv) => (
                                    <tr key={inv.id} className="group hover:bg-primary/5 transition-colors duration-200 cursor-pointer">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-text-main">#{inv.printNumber}</span>
                                                <span className="text-[10px] text-text-muted font-medium italic">
                                                    {new Date(inv.emittedDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-text-main text-sm">
                                            {clients.find(c => c.id === inv.clientId)?.name || 'Cliente Desconocido'}
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-text-main">
                                            ${(inv.calcTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                {inv.state.toLowerCase() === 'pagado' ? (
                                                    <CheckCircle2 size={18} className="text-emerald-500" />
                                                ) : inv.state.toLowerCase() === 'vencido' ? (
                                                    <AlertCircle size={18} className="text-red-500" />
                                                ) : (
                                                    <Clock size={18} className="text-amber-500" />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {recentInvoices.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-12 text-center text-text-muted italic font-medium">
                                            No hay facturas registradas recientemente.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Health / Quick Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <TrendingUp size={20} className="text-primary" />
                        <h3 className="text-sm font-black text-text-main uppercase tracking-widest">Resumen de Salud</h3>
                    </div>

                    <div className="bg-primary/5 border-2 border-primary/10 rounded-[2.5rem] p-8 space-y-8">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Pagado vs Total</span>
                                <span className="text-xs font-black text-primary">
                                    {totalRevenue > 0 ? Math.round(((totalRevenue - pendingAmount) / totalRevenue) * 100) : 0}%
                                </span>
                            </div>
                            <div className="h-2 bg-primary/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary transition-all duration-1000 ease-out"
                                    style={{ width: `${totalRevenue > 0 ? ((totalRevenue - pendingAmount) / totalRevenue) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface-muted/50 dark:bg-surface-muted/10 p-4 rounded-2xl border border-border/50">
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Pagado</span>
                                <p className="text-sm font-black text-emerald-500">${(totalRevenue - pendingAmount).toLocaleString()}</p>
                            </div>
                            <div className="bg-surface-muted/50 dark:bg-surface-muted/10 p-4 rounded-2xl border border-border/50">
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest block mb-1">Pendiente</span>
                                <p className="text-sm font-black text-amber-500">${pendingAmount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-primary/10">
                            <p className="text-xs text-text-muted italic leading-relaxed">
                                Mantén un seguimiento cercano de tus facturas pendientes para asegurar un flujo de caja saludable.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
