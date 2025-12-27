'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './page.module.css';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                alert('Email o contraseña incorrectos');
                setLoading(false);
                return;
            }

            const userData = await res.json();

            // Login success
            login(userData);
            router.push('/dashboard');

        } catch (err) {
            alert('Hubo un error al intentar ingresar');
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>¡Hola de nuevo!</h1>
                <p className={styles.subtitle}>Ingresá a tu cuenta para gestionar tus servicios</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        name="email"
                        type="email"
                        label="Email"
                        placeholder="juan@ejemplo.com"
                        required
                    />
                    <Input
                        name="password"
                        type="password"
                        label="Contraseña"
                        placeholder="******"
                        required
                    />

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </Button>
                </form>

                <p className={styles.footer}>
                    ¿No tenés cuenta? <Link href="/register" className={styles.link}>Registrate acá</Link>
                </p>

                <div className={styles.admin}>
                    <Link href="/admin" className={styles.adminLink}>Acceso Administrador</Link>
                </div>
            </div>
        </div>
    );
}
