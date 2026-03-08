'use client';
import React, { createContext, useContext } from 'react';
import { useAdminMaster } from '../hooks/useAdminMaster';
import LoginScreen from '../components/layout/LoginScreen';

const AdminContext = createContext<ReturnType<typeof useAdminMaster> | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const admin = useAdminMaster();

    if (!admin.authorized) {
        return (
            <LoginScreen
                password={admin.password}
                setPassword={admin.setPassword}
                handleLogin={admin.handleLogin}
                loginLocked={admin.loginLocked}
                lockTimer={admin.lockTimer}
            />
        );
    }

    return (
        <AdminContext.Provider value={admin}>
            {children}
        </AdminContext.Provider>
    );
}

export const useAdminContext = () => {
    const context = useContext(AdminContext);
    if (!context) throw new Error("useAdminContext must be used within AdminProvider");
    return context;
};
