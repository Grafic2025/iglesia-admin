'use client';
import React, { createContext, useContext } from 'react';
import { usarAdminMaster } from '../ganchos/usarMaestroAdmin';
import PantallaLogin from '../componentes/diseno/PantallaLogin';

const ContextoAdmin = createContext<ReturnType<typeof usarAdminMaster> | null>(null);

export function AdminProvider({ children }: { children: React.ReactNode }) {
    const administrador = usarAdminMaster();

    if (!administrador.autorizado) {
        return (
            <PantallaLogin
                password={administrador.contrasena}
                setPassword={administrador.establecerContrasena}
                handleLogin={administrador.manejarInicioSesion}
                loginLocked={administrador.inicioSesionBloqueado}
                lockTimer={administrador.temporizadorBloqueo}
            />
        );
    }

    return (
        <ContextoAdmin.Provider value={administrador}>
            {children}
        </ContextoAdmin.Provider>
    );
}

export const useContextoAdmin = () => {
    const contexto = useContext(ContextoAdmin);
    if (!contexto) throw new Error("useContextoAdmin debe usarse dentro de AdminProvider");
    return contexto;
};

