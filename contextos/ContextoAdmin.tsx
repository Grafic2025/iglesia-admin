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
                usuario={administrador.usuario}
                setUsuario={administrador.establecerUsuario}
                password={administrador.contrasena}
                setPassword={administrador.establecerContrasena}
                handleLogin={administrador.manejarInicioSesion}
                loginLocked={administrador.inicioSesionBloqueado}
                lockTimer={administrador.temporizadorBloqueo}
                modoRecuperacion={administrador.modoRecuperacion}
                setModoRecuperacion={administrador.establecerModoRecuperacion}
                pasoRecuperacion={administrador.pasoRecuperacion}
                emailRecuperacion={administrador.emailRecuperacion}
                setEmailRecuperacion={administrador.establecerEmailRecuperacion}
                codigoRecuperacion={administrador.codigoRecuperacion}
                setCodigoRecuperacion={administrador.establecerCodigoRecuperacion}
                nuevaContrasena={administrador.nuevaContrasena}
                setNuevaContrasena={administrador.establecerNuevaContrasena}
                solicitarCodigo={administrador.solicitarCodigo}
                resetearPassword={administrador.resetearPassword}
                cargandoRecuperacion={administrador.cargandoRecuperacion}
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

