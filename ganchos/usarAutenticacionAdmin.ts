'use client';
import { useState, useEffect } from 'react';

export function usarAdminAuth() {
    const [autorizado, establecerAutorizado] = useState(false);
    const [usuario, establecerUsuario] = useState('');
    const [contrasena, establecerContrasena] = useState('');
    const [intentosInicioSesion, establecerIntentosInicioSesion] = useState(0);
    const [inicioSesionBloqueado, establecerInicioSesionBloqueado] = useState(false);
    const [temporizadorBloqueo, establecerTemporizadorBloqueo] = useState(0);
    const [modoRecuperacion, establecerModoRecuperacion] = useState(false);
    const [pasoRecuperacion, establecerPasoRecuperacion] = useState(1); // 1: Email, 2: Código/Nueva Clave
    const [emailRecuperacion, establecerEmailRecuperacion] = useState('');
    const [codigoRecuperacion, establecerCodigoRecuperacion] = useState('');
    const [nuevaContrasena, establecerNuevaContrasena] = useState('');
    const [cargandoRecuperacion, establecerCargandoRecuperacion] = useState(false);

    useEffect(() => {
        const estaAutenticado = localStorage.getItem('administrador_autenticacion');
        if (estaAutenticado === 'true') establecerAutorizado(true);

        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && window.location.protocol !== 'https:') {
            window.location.href = window.location.href.replace('http:', 'https:');
        }
    }, []);

    // Sistema de bloqueo por inactividad (15 min)
    useEffect(() => {
        if (!autorizado) return;

        let temporizadorInactividad: NodeJS.Timeout;
        const reiniciarTemporizador = () => {
            clearTimeout(temporizadorInactividad);
            temporizadorInactividad = setTimeout(() => {
                // Bloqueo por inactividad
                manejarCerrarSesion();
                alert('Sesión bloqueada por inactividad de 15 minutos.');
            }, 15 * 60 * 1000); // 15 minutos
        };

        const eventos = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        eventos.forEach(e => window.addEventListener(e, reiniciarTemporizador));

        reiniciarTemporizador();

        return () => {
            clearTimeout(temporizadorInactividad);
            eventos.forEach(e => window.removeEventListener(e, reiniciarTemporizador));
        };
         
    }, [autorizado]);

    const manejarInicioSesion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inicioSesionBloqueado) return;

        try {
            const respuesta = await fetch('/api/autenticacion', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, password: contrasena }),
            });

            const datos = await respuesta.json();

            if (respuesta.ok && datos.success) {
                establecerAutorizado(true);
                localStorage.setItem('administrador_autenticacion', 'true');
                if (datos.usuario) localStorage.setItem('admin_user_info', JSON.stringify(datos.usuario));
                establecerIntentosInicioSesion(0);
            } else {
                const nuevosIntentos = intentosInicioSesion + 1;
                establecerIntentosInicioSesion(nuevosIntentos);
                if (nuevosIntentos >= 5) {
                    establecerInicioSesionBloqueado(true);
                    let segundos = 30;
                    establecerTemporizadorBloqueo(segundos);
                    const intervalo = setInterval(() => {
                        segundos--;
                        establecerTemporizadorBloqueo(segundos);
                        if (segundos <= 0) {
                            clearInterval(intervalo);
                            establecerInicioSesionBloqueado(false);
                            establecerIntentosInicioSesion(0);
                        }
                    }, 1000);
                    return;
                }
                alert(`Contraseña incorrecta (${nuevosIntentos}/5 intentos)`);
            }
        } catch (error) {
            alert('Error conectando al servidor.');
        }
    };

    const manejarCerrarSesion = async () => {
        try {
            await fetch('/api/autenticacion/logout', { method: 'POST' });
        } catch (error) { }
        localStorage.removeItem('administrador_autenticacion');
        establecerAutorizado(false);
        establecerContrasena('');
    };

    const solicitarCodigo = async (e: React.FormEvent) => {
        e.preventDefault();
        establecerCargandoRecuperacion(true);
        try {
            const res = await fetch('/api/autenticacion/recuperar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailRecuperacion })
            });
            const data = await res.json();
            if (data.success) {
                establecerPasoRecuperacion(2);
                alert('Código de seguridad enviado a tu email (Si lo registraste)');
            } else throw new Error(data.error);
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            establecerCargandoRecuperacion(false);
        }
    };

    const resetearPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        establecerCargandoRecuperacion(true);
        try {
            const res = await fetch('/api/autenticacion/recuperar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailRecuperacion, codigo: codigoRecuperacion, nuevaPassword: nuevaContrasena })
            });
            const data = await res.json();
            if (data.success) {
                alert('¡Contraseña actualizada con éxito! Ya puedes entrar.');
                establecerModoRecuperacion(false);
                establecerPasoRecuperacion(1);
            } else throw new Error(data.error);
        } catch (error: any) {
            alert('Error: ' + error.message);
        } finally {
            establecerCargandoRecuperacion(false);
        }
    };

    return {
        autorizado,
        usuario,
        establecerUsuario,
        contrasena,
        establecerContrasena,
        inicioSesionBloqueado,
        temporizadorBloqueo,
        manejarInicioSesion,
        manejarCerrarSesion,
        // Recuperación
        modoRecuperacion, establecerModoRecuperacion,
        pasoRecuperacion, establecerPasoRecuperacion,
        emailRecuperacion, establecerEmailRecuperacion,
        codigoRecuperacion, establecerCodigoRecuperacion,
        nuevaContrasena, establecerNuevaContrasena,
        solicitarCodigo, resetearPassword, cargandoRecuperacion
    };
}

