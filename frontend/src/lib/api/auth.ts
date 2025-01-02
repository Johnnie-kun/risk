import axios from 'axios';

const API_URL = 'https://yourapi.com/auth';

export const login = async (username: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
};

export const logout = async () => {
    const response = await axios.post(`${API_URL}/logout`);
    return response.data;
};
