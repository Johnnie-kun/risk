// Define API endpoints for the application
export const API_ENDPOINTS = {
    GET_USERS: '/api/users',
    GET_USER_BY_ID: (id: string) => `/api/users/${id}`,
    CREATE_USER: '/api/users/create',
    UPDATE_USER: (id: string) => `/api/users/update/${id}`,
    DELETE_USER: (id: string) => `/api/users/delete/${id}`,
    // ... add more endpoints as needed
};
