import React from 'react';
import { AlertCircle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const colors = {
        danger: {
            bg: 'bg-red-500/10',
            text: 'text-red-500',
            button: 'bg-red-500 hover:bg-red-600 shadow-red-500/20',
            icon: Trash2
        },
        warning: {
            bg: 'bg-amber-500/10',
            text: 'text-amber-500',
            button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20',
            icon: AlertCircle
        },
        info: {
            bg: 'bg-primary/10',
            text: 'text-primary',
            button: 'bg-primary hover:bg-primary/hover shadow-primary/20',
            icon: AlertCircle
        }
    };

    const currentTheme = colors[type];
    const Icon = currentTheme.icon;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Modal Content */}
            <div className="relative bg-surface border border-border w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className={`w-16 h-16 ${currentTheme.bg} rounded-2xl flex items-center justify-center ${currentTheme.text}`}>
                            <Icon size={32} />
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-text-main tracking-tight">
                                {title}
                            </h2>
                            <p className="text-text-muted font-medium">
                                {message}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-10">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3 px-4 border border-border text-text-muted font-bold rounded-2xl hover:bg-background transition-all"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-3 px-4 text-white font-bold rounded-2xl transition-all shadow-lg ${currentTheme.button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main rounded-xl hover:bg-background transition-all"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default ConfirmModal;
