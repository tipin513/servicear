'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './page.module.css';
import {
    User as UserIcon,
    Briefcase,
    Mail,
    Lock,
    Phone,
    MapPin,
    FileText,
    Camera
} from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [role, setRole] = useState('client');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || 'Error al registrarse');
            }

            const newUser = await res.json();

            // Auto-login
            login(newUser);

            alert('¡Registro exitoso! Bienvenido a ServiceAR.');
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Unite a ServiceAR</h1>
                <p className={styles.subtitle}>Completá tus datos para empezar</p>

                {error && <div className={styles.error}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    {/* Role Selection */}
                    <div className={styles.roleSelector}>
                        <div
                            className={`${styles.roleCard} ${role === 'client' ? styles.roleCardActive : ''}`}
                            onClick={() => setRole('client')}
                        >
                            <input type="radio" name="role" value="client" checked={role === 'client'} readOnly />
                            <UserIcon className={styles.roleIcon} />
                            <span className={styles.roleName}>Cliente</span>
                            <span className={styles.roleDesc}>Busco servicios</span>
                        </div>
                        <div
                            className={`${styles.roleCard} ${role === 'provider' ? styles.roleCardActive : ''}`}
                            onClick={() => setRole('provider')}
                        >
                            <input type="radio" name="role" value="provider" checked={role === 'provider'} readOnly />
                            <Briefcase className={styles.roleIcon} />
                            <span className={styles.roleName}>Profesional</span>
                            <span className={styles.roleDesc}>Ofrezco servicios</span>
                        </div>
                    </div>

                    {/* Section 1: Account Info */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}><Mail size={16} /> Información de Cuenta</h3>
                        <Input
                            name="name"
                            label="Nombre Completo"
                            placeholder="Ej: Juan Pérez"
                            required
                        />
                        <div className={styles.fieldGroup}>
                            <Input
                                name="email"
                                type="email"
                                label="Email"
                                placeholder="tu@email.com"
                                required
                            />
                            <Input
                                name="password"
                                type="password"
                                label="Contraseña"
                                placeholder="******"
                                required
                            />
                        </div>
                    </div>

                    {/* Section 2: Contact/Location */}
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}><Phone size={16} /> Contacto y Ubicación</h3>
                        <div className={styles.fieldGroup}>
                            <Input
                                name="phone"
                                label="Teléfono / WhatsApp"
                                placeholder="+54 9 11 ..."
                                required
                            />
                            <Input
                                name="location"
                                label="Ubicación (Barrio/Ciudad)"
                                placeholder="Ej: Palermo, CABA"
                                required
                            />
                        </div>
                    </div>

                    {/* Section 3: Profile (Provider Only) */}
                    {role === 'provider' && (
                        <div className={styles.section}>
                            <h3 className={styles.sectionTitle}><FileText size={16} /> Perfil Profesional</h3>
                            <div className={styles.fieldGroup}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Especialidad / Categoría</label>
                                    <select
                                        name="category"
                                        className={styles.textarea}
                                        style={{ minHeight: 'auto' }}
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="hogar-mantenimiento">Hogar y Mantenimiento</option>
                                        <option value="tecnicos-digitales">Técnicos y Digitales</option>
                                        <option value="belleza-bienestar">Belleza y Bienestar</option>
                                        <option value="clases-cursos">Clases y Cursos</option>
                                        <option value="eventos">Eventos</option>
                                    </select>
                                </div>
                                <Input
                                    name="avatar"
                                    label="URL de Foto de Perfil"
                                    placeholder="https://..."
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', fontWeight: 500 }}>Sobre mí / Descripción</label>
                                <textarea
                                    name="about"
                                    className={styles.textarea}
                                    placeholder="Contanos sobre tu experiencia y servicios..."
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <Button type="submit" fullWidth disabled={loading}>
                        {loading ? 'Creando cuenta...' : 'Registrarse Ahora'}
                    </Button>

                    <p className={styles.loginPrompt}>
                        ¿Ya tenés cuenta? <Link href="/login" className={styles.loginLink}>Iniciá sesión</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
