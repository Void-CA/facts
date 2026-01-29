import React from 'react';
import Sidebar from '../components/Sidebar';

interface BaseLayoutProps {
    children: React.ReactNode;
    username?: string;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children, username = "Usuario" }) => {
    return (
        <div className="flex min-h-screen bg-background text-text-main transition-colors duration-300">
            {/* Sidebar Component */}
            <Sidebar username={username} />

            {/* Main Content Area */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default BaseLayout;
