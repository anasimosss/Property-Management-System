import apiClient from './client';

export type UserRole =
    | 'PropertyManager'
    | 'MaintenanceStaff'
    | 'Tenant';

export interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string | null;
    role: UserRole;
    isActive: boolean;
    createdAtUtc: string;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: UserRole;
}

export interface CreateUserResponse {
    message: string;
    user: User;
}

export const getUsers = async (): Promise<User[]> => {
    const response = await apiClient.get<User[]>('/api/Users');

    return response.data;
};

export const getUser = async (id: number): Promise<User> => {
    const response = await apiClient.get<User>(`/api/Users/${id}`);

    return response.data;
};

export const createUser = async (
    request: CreateUserRequest
): Promise<CreateUserResponse> => {
    const response = await apiClient.post<CreateUserResponse>(
        '/api/Users',
        request
    );

    return response.data;
};

export interface UpdateUserStatusResponse {
    message: string;
    user: User;
}

export const updateUserStatus = async (
    id: number
): Promise<UpdateUserStatusResponse> => {
    const response = await apiClient.patch<UpdateUserStatusResponse>(
        `/api/Users/${id}/status`
    );

    return response.data;
};


export const deleteUser = async (id: number): Promise<void> => {
    await apiClient.delete(`/api/Users/${id}`);
};
