// lib/types/event.ts

export interface FormField {
    id: string;
    event_id: string;
    field_name: string;
    field_type: 'text' | 'email' | 'number' | 'select' | 'checkbox' | 'payment';
    is_required: boolean;
    options: {
        values: string[];
    } | null;
    order: number; // Used for sorting form fields
}


export type DynamicFormData = Record<string, string | string[] | number>;

export interface DynamicPreRegResult {
    ticketUid: string | null;
    isRegistered: boolean;
    
    // FIX HERE: Add the generic 'string' to the union type.
    // This allows the returned value to be a generic string, which resolves the error.
    existingStatus?: 'paid' | 'pending' | 'free' | string | null | undefined; 
    
    // This is the added property needed to resume payment
    existingOrderId?: string | null; 
}