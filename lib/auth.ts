// Authentication helpers

// Store token in localStorage
export const setToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
    }
};

// Get token from localStorage
export const getToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
};

// Remove token from localStorage
export const removeToken = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
    }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
    const token = getToken();
    return !!token;
};

// API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Fetch with authentication
 * @param endpoint - API endpoint (without the base URL)
 * @param options - Fetch options
 * @returns Promise with the response data
 */
export const fetchWithAuth = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> => {
    const token = getToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };

    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });

        // Handle unauthorized errors
        if (response.status === 401) {
            removeToken();
            window.location.href = '/login';
            throw new Error('Unauthorized: Please log in again');
        }

        // Handle other error responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Request failed with status ${response.status}`);
        }

        // Check if response is empty
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        }

        return await response.text() as unknown as T;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
};

// Fetch current user data
export const fetchUser = async (): Promise<any> => {
    const token = getToken();

    if (!token) {
        return null;
    }

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            // If unauthorized, clear token
            if (response.status === 401) {
                removeToken();
            }
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user:', error);
        return null;
    }
};

// Logout function
export const logout = async (): Promise<void> => {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });
    } catch (error) {
        console.error('Error during logout:', error);
    } finally {
        removeToken();
        window.location.href = '/';
    }
};

// Google login redirect function
export const loginWithGoogle = () => {
    window.location.href = `${API_URL}/auth/google/login`;
};

// Extract token from URL
export const getTokenFromUrl = (): string | null => {
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');

        // Clear token from URL to prevent leaking in browser history
        if (token) {
            const url = new URL(window.location.href);
            url.searchParams.delete('token');
            window.history.replaceState({}, document.title, url.toString());
        }

        return token;
    }

    return null;
}; 