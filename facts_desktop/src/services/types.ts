export interface Client {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    createdAt?: string;
}

export interface Invoice {
    id: string;
    invoiceNumber: string;
    date: string;
    dueDate: string;
    clientId: string;
    clientName?: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    calcTotal: number;
    status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
    notes?: string;
}

export interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}
