// Define application routes
export const ROUTES = {
    HOME: '/',
    ABOUT: '/about',
    USERS: '/users',
    USER_PROFILE: (id: string) => `/users/${id}`,
    LOGIN: '/login',
    REGISTER: '/register',
    // ... add more routes as needed
};
