import React from 'react';

interface FormLayoutProps {
    title: string;
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    submitLabel?: string;
    isEdit?: boolean;
}

const FormLayout: React.FC<FormLayoutProps> = ({
    title,
    children,
    onSubmit,
    onCancel,
    submitLabel = 'Guardar',
    isEdit = false
}) => {
    return (
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-xl w-full max-w-7xl mx-auto transition-all duration-300">
            <h1 className="text-3xl font-bold text-text-main mb-8 tracking-tight">
                {isEdit ? 'Editar' : 'Crear'} {title}
            </h1>
            <form onSubmit={onSubmit} className="space-y-8">
                {children}

                <div className="flex justify-end gap-4 mt-10 pt-6 border-t border-border">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2.5 rounded-xl border border-border text-text-muted font-medium hover:bg-background transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-[0.98]"
                    >
                        {isEdit ? 'Actualizar' : submitLabel} {title}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FormLayout;
