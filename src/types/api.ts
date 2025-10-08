export interface IApiError {
    status: number;
    code?: string;
    message: string;
    details?: unknown;
}
export interface IFoodicsResponse<T> {
    data: T;
}

// Backward-compatibility aliases
export type ApiError = IApiError;
export type FoodicsResponse<T> = IFoodicsResponse<T>;
