import React, {createContext, useState, useContext, useEffect} from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {    
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            const userData = localStorage.getItem('user');

            if(token && userData){
                try{
                    const response = await authAPI.getProfile(token);
                    setUser(response.user);
                }
                catch(error){
                    logout();
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = (userData, token) =>{
        setUser(userData);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    const value = {
        user, login, logout, loading
    };

    return (<AuthContext.Provider value = {value}>
        {children}
    </AuthContext.Provider>
    );
};