export type TableStatus = 
    | "available"
    | "occupied"
    | "reserved"
    | "dirty"
    | "out_of_service";

export type RestaurantTable = {
    id: string;
    table_number: number;
    capacity: number;
    current_status: TableStatus;
    created_at: string;
    updated_at: string;
};

export type TablesResponse = {
    tables: RestaurantTable[];
};