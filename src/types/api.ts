export interface IApiError {
    status: number;
    code?: string;
    message: string;
    details?: unknown;
}

export interface IFoodicsPaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface IFoodicsPaginationMeta {
    current_page: number;
    from: number | null;
    last_page?: number; // Optional: not always present in API responses
    per_page: number;
    to: number | null;
    total?: number; // Optional: not always present in API responses
    path?: string; // Optional: API base path
}

export interface IFoodicsResponse<T> {
    data: T;
}

export interface IFoodicsPaginatedResponse<T> {
    data: T;
    links: IFoodicsPaginationLinks;
    meta: IFoodicsPaginationMeta;
}

// Backward-compatibility aliases
export type ApiError = IApiError;
export type FoodicsResponse<T> = IFoodicsResponse<T>;
export type FoodicsPaginatedResponse<T> = IFoodicsPaginatedResponse<T>;
