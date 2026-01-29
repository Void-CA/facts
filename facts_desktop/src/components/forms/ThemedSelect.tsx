import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface ThemedSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    size?: 'sm' | 'md';
}

const ThemedSelect: React.FC<ThemedSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = "Seleccionar...",
    size = 'md'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const containerPadding = size === 'sm' ? 'px-2 py-1.5' : 'px-4 py-2.5';
    const textSize = size === 'sm' ? 'text-sm' : 'text-base';

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full bg-surface border border-border rounded-xl cursor-pointer transition-all hover:border-primary/50 ${containerPadding} ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}`}
            >
                <span className={`truncate ${selectedOption ? 'text-text-main' : 'text-text-muted'} ${textSize}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} size={size === 'sm' ? 16 : 20} />
            </div>

            {isOpen && (
                <div className="absolute z-[70] mt-2 w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {options.map(opt => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt.value)}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-primary/10 transition-colors ${value === opt.value ? 'bg-primary/5 text-primary font-bold' : 'text-text-main'}`}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemedSelect;
