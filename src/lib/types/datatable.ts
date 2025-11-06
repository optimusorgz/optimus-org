// /src/types/datatable.ts
import { UUID } from './supabase'; // Assuming UUID is defined here

/**
 * DataRowWithId: Defines the base shape for any row passed to the DataTable.
 * It requires either a 'uuid' or an 'id' field, which must be a UUID string or a number.
 * The index signature {[key: string]: any} allows the row to have any other properties.
 */
export type DataRowWithId = { 
    // Index signature for maximum flexibility in column access
    [key: string]: any 
} & (
    // Option 1: Requires 'id' (e.g., for 'organizations' table)
    | { id: UUID | number; uuid?: never }
    // Option 2: Requires 'uuid' (e.g., for 'profiles' table)
    | { uuid: UUID | number; id?: never }
);

/**
 * Column: Defines the shape of a column object for the DataTable.
 */
export interface Column<T extends DataRowWithId> {
    /** The display name for the column header. */
    header: string;
    
    /** * The key to access the value in the row object. 
     * We use 'keyof T | string' to allow access to any dynamic property 
     * defined by the index signature.
     */
    accessorKey: keyof T | string; 
    
    /** * Optional custom render function for cell content.
     * Takes the cell value and the whole row object.
     */
    render?: (value: any, row: T) => React.ReactNode; 
}

/**
 * DataTableProps: Defines the overall props for the reusable DataTable component.
 */
export interface DataTableProps<T extends DataRowWithId> {
    /** The array of data rows to display. */
    data: T[];
    
    /** The configuration for the columns. */
    columns: Column<T>[];
    
    /** The name of the table (used for context in operations). */
    tableName: string;
    
    /** Handler for delete operations. */
    onDelete: (id: UUID | number) => void;
    
    /** Handler for edit operations. */
    onEdit: (row: T) => void;
    
    /** * Optional handler for viewing linked registrations (e.g., for 'events' table).
     * This makes the prop optional, as not all data tables will need this action. 
     */
    onViewRegistrations?: (row: T) => void; 
}