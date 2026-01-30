export interface Client {
    id: number; // Changed to number to match int Id
    name: string;
    email: string;
    phone: string;
    address: string;
    ruc: string; // Changed from taxId to match RUC
    createdAt?: string;
}

export interface Invoice {
    id: number; // Changed to number
    clientId: number;
    clientName?: string;
    provider?: string;
    emittedDate: string; // Changed from date
    expireDate?: string; // Changed from dueDate
    state: string; // Changed from status
    invoiceType: string;
    printNumber: number; // Changed from invoiceNumber and to number
    description?: string; // Changed from notes
    providerName?: string;
    services: InvoiceItem[]; // Changed from items
    calcTotal: number;
}

export interface InvoiceItem {
    id: number; // Changed to number
    invoiceId?: number;
    specification: string; // Changed from description
    quantity: number;
    price: number; // Changed from unitPrice
    subtotal: number;
}
