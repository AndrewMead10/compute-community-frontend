'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchUser, getToken, setToken, removeToken, getTokenFromUrl } from '@/lib/auth';

interface User {
    id: number;
    email: string;
    name: string;
    picture?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAuthenticated: false,
    login: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if there's a token in the URL (from OAuth redirect)
        const urlToken = getTokenFromUrl();
        if (urlToken) {
            setToken(urlToken);
        }

        // Try to get the user with the token
        const loadUser = async () => {
            setLoading(true);
            const userData = await fetchUser();
            setUser(userData);
            setLoading(false);
        };

        loadUser();
    }, []);

    const login = (token: string) => {
        setToken(token);
        fetchUser().then(userData => {
            setUser(userData);
        });
    };

    const logout = () => {
        removeToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                isAuthenticated: !!user,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 