import React from 'react';
import PageHeader from '../components/PageHeader';
import { ChartNetwork } from 'lucide-react';
import InvoiceStats from '../components/stats/InvoiceStats';

const Settings: React.FC = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <PageHeader
                title="Estadisticas"
                description="Resumen de las estadísticas de uso y rendimiento"
                icon={ChartNetwork}
            />

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <InvoiceStats></InvoiceStats>
            </section>
        </div>
    );
};

export default Settings;
