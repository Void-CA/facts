import React from 'react';
import PrintSettings from '../components/settings/PrintSettings';
import PageHeader from '../components/PageHeader';
import { Settings as SettingsIcon } from 'lucide-react';

const Settings: React.FC = () => {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <PageHeader
                title="Configuración"
                description="Administra las preferencias generales de la aplicación"
                icon={SettingsIcon}
            />

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <PrintSettings />
            </section>
        </div>
    );
};

export default Settings;
