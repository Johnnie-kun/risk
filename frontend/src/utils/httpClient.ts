import { authService } from '../services/authService';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async fetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requiresAuth = true, headers: customHeaders, ...rest } = options;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(customHeaders || {}),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...rest,
      credentials: 'include',
      headers,
    });

    if (response.status === 401) {
      window.location.href = '/login';
      throw new Error('Unauthorized - Session expired. Please log in again.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      console.error(`HTTP Error ${response.status}: ${errorMessage}`);
      throw new Error(errorMessage);
    }

    return response.json();
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this.fetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.fetch<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

