import React from 'react';

const home: React.FC = () => (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-text-main tracking-tight">Inicio</h1>
            <div className="text-sm text-text-muted font-medium bg-surface px-4 py-2 rounded-full border border-border">
                Bienvenido de nuevo
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4 font-bold text-xl">
                        {i}
                    </div>
                    <h3 className="text-lg font-bold text-text-main mb-2">Métrica {i}</h3>
                    <p className="text-text-muted text-sm">Resumen breve de la actividad reciente en el sistema.</p>
                </div>
            ))}
        </div>
    </div>
);

export default home;
