import apiClient from './apiClient';

export interface PrintField {
    x: number; // mm
    y: number; // mm
    enabled: boolean;
    fontName?: string;
    fontSize?: number;
}

export interface ColumnSettings {
    cantidadX: number;     // Desplazamiento relativo en mm desde el inicio de la fila
    descripcionX: number;
    precioX: number;
    subtotalX: number;
}

export interface LayoutFields {
    cliente?: PrintField;
    direccion?: PrintField;
    ruc?: PrintField;
    fecha?: PrintField;
    fechaVencimiento?: PrintField;
    tipo?: PrintField;
    numero?: PrintField;
    proveedor?: PrintField;
    total?: PrintField;
    estado?: PrintField;
    descripcion?: PrintField;

    servicios?: PrintField;     // El X e Y indican dónde empieza la primera fila
    rowHeight?: number;        // Espacio entre filas en mm (ej. 8)
    columnas?: ColumnSettings; // Configuración de anchos de columna
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
        // Si fieldsJson es un objeto en tu estado de React, asegúrate de hacer stringify
        const payload = {
            ...layout,
            fieldsJson: typeof layout.fieldsJson === 'string'
                ? layout.fieldsJson
                : JSON.stringify(layout.fieldsJson)
        };

        const response = await apiClient.post('/print/layouts', payload);
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

    async getPreview(invoiceId: number, layout: PrintLayout): Promise<string> {
        // El objeto layout es el segundo argumento (el BODY)
        const response = await apiClient.post(`/print/preview/${invoiceId}`, layout);
        return response.data.image;
    }
};

export default printService;
