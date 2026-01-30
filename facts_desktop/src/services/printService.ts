import apiClient from './apiClient';

export interface PrintField {
    x: number; // mm
    y: number; // mm
    enabled: boolean;
    fontName?: string;
    fontSize?: number;
}

export interface LayoutFields {
    cliente?: PrintField;
    ruc?: PrintField;
    fecha?: PrintField;
    fechaVencimiento?: PrintField;
    tipo?: PrintField;
    numero?: PrintField;
    proveedor?: PrintField;
    total?: PrintField;
    estado?: PrintField;
    descripcion?: PrintField;
}

export interface PrintLayout {
    id: number;
    name: string;
    pageWidthMm: number;
    pageHeightMm: number;
    printerName?: string;
    fieldsJson: string;
    createdAt: string;
    updatedAt: string;
}

const printService = {
    async getLayouts(): Promise<PrintLayout[]> {
        const response = await apiClient.get('/print/layouts');
        return response.data;
    },

    async getLayout(id: number): Promise<PrintLayout> {
        const response = await apiClient.get(`/print/layouts/${id}`);
        return response.data;
    },

    async saveLayout(layout: PrintLayout): Promise<PrintLayout> {
        const response = await apiClient.post('/print/layouts', layout);
        return response.data;
    },

    async deleteLayout(id: number): Promise<void> {
        await apiClient.delete(`/print/layouts/${id}`);
    },

    async getPrinters(): Promise<string[]> {
        const response = await apiClient.get('/print/printers');
        return response.data;
    },

    async printInvoice(invoiceId: number, layoutId: number): Promise<void> {
        await apiClient.post(`/print/invoice/${invoiceId}`, null, {
            params: { layoutId }
        });
    },

    async getPreview(invoiceId: number, layoutId: number): Promise<string> {
        const response = await apiClient.post(`/print/preview/${invoiceId}`, null, {
            params: { layoutId }
        });
        return response.data.image; // base64 string
    }
};

export default printService;
