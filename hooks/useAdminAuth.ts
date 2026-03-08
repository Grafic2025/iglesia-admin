'use client';
import { useState, useEffect } from 'react';

export function useAdminAuth() {
    const [authorized, setAuthorized] = useState(false);
    const [password, setPassword] = useState('');
    const [loginAttempts, setLoginAttempts] = useState(0);
    const [loginLocked, setLoginLocked] = useState(false);
    const [lockTimer, setLockTimer] = useState(0);

    useEffect(() => {
        const isAuth = localStorage.getItem('admin_auth');
        if (isAuth === 'true') setAuthorized(true);

        if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' && window.location.protocol !== 'https:') {
            window.location.href = window.location.href.replace('http:', 'https:');
        }
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loginLocked) return;

        try {
            const res = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setAuthorized(true);
                localStorage.setItem('admin_auth', 'true');
                setLoginAttempts(0);
            } else {
                const newAttempts = loginAttempts + 1;
                setLoginAttempts(newAttempts);
                if (newAttempts >= 5) {
                    setLoginLocked(true);
                    let seconds = 30;
                    setLockTimer(seconds);
                    const interval = setInterval(() => {
                        seconds--;
                        setLockTimer(seconds);
                        if (seconds <= 0) {
                            clearInterval(interval);
                            setLoginLocked(false);
                            setLoginAttempts(0);
                        }
                    }, 1000);
                    return;
                }
                alert(`Contraseña incorrecta (${newAttempts}/5 intentos)`);
            }
        } catch (e) {
            alert('Error conectando al servidor.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_auth');
        setAuthorized(false);
        setPassword('');
    };

    return {
        authorized,
        password,
        setPassword,
        loginLocked,
        lockTimer,
        handleLogin,
        handleLogout
    };
}
