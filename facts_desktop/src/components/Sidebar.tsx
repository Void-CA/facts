import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Home,
    FileText,
    LineChart,
    Share2,
    Users,
    Bell,
    UserCircle,
    Settings,
    LogOut,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
    username: string;
}

const Sidebar: React.FC<SidebarProps> = ({ username }) => {
    const { theme, toggleTheme } = useTheme();
    const activeClass = "flex items-center gap-3 px-4 py-3 text-primary bg-primary/10 rounded-lg transition-all duration-200";
    const inactiveClass = "flex items-center gap-3 px-4 py-3 text-text-muted hover:bg-primary/5 rounded-lg transition-all duration-200";

    return (
        <aside className="w-72 bg-surface border-r border-border flex flex-col h-screen sticky top-0 transition-colors duration-300">
            <div className="p-6 flex items-center justify-between border-b border-border mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20">
                        A
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-text-main uppercase">Alliance</h2>
                </div>
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg bg-background border border-border text-text-muted hover:text-primary transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </div>

            <div className="flex-1 px-4 space-y-8 overflow-y-auto pb-6">
                {/* Main Menu */}
                <div>
                    <h4 className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Menu Principal</h4>
                    <nav className="space-y-1">
                        <NavLink to="/" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                            <Home size={20} />
                            <span className="font-medium">Inicio</span>
                        </NavLink>
                        <NavLink to="/invoices" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                            <FileText size={20} />
                            <span className="font-medium">Facturas</span>
                        </NavLink>
                        <NavLink to="/stats" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                            <LineChart size={20} />
                            <span className="font-medium">Estadísticas</span>
                        </NavLink>
                    </nav>
                </div>

                {/* General */}
                <div>
                    <h4 className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">General</h4>
                    <nav className="space-y-1">
                        <NavLink to="/export" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                            <Share2 size={20} />
                            <span className="font-medium">Exportación</span>
                        </NavLink>
                        <NavLink to="/clients" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                            <Users size={20} />
                            <span className="font-medium">Clientes</span>
                        </NavLink>
                        <NavLink to="/notifications" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                            <Bell size={20} />
                            <span className="font-medium">Notificaciones</span>
                        </NavLink>
                    </nav>
                </div>

                {/* Account */}
                <div>
                    <h4 className="px-4 text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Cuenta</h4>
                    <nav className="space-y-1">
                        <NavLink to="/profile" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                            <UserCircle size={20} />
                            <span className="font-medium">Perfil</span>
                        </NavLink>
                        <NavLink to="/settings" className={({ isActive }) => isActive ? activeClass : inactiveClass}>
                            <Settings size={20} />
                            <span className="font-medium">Ajustes</span>
                        </NavLink>
                        <button className={`${inactiveClass} w-full text-left mt-4 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20`}>
                            <LogOut size={20} />
                            <span className="font-medium">Cerrar Sesión</span>
                        </button>
                    </nav>
                </div>
            </div>

            <div className="p-4 bg-background border-t border-border mt-auto transition-colors duration-300">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold border-2 border-surface shadow-sm overflow-hidden">
                        <img
                            src={`https://ui-avatars.com/api/?name=${username}&background=random`}
                            alt={username}
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-sm font-semibold text-text-main leading-tight">{username}</h3>
                        <span className="text-xs text-text-muted">Administrador</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
