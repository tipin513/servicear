'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { categories } from '../../data/categories';
import { flattenedLocations } from '../../data/locations';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import styles from './page.module.css';

export default function PublishPage() {
    const router = useRouter();
    const { user } = useAuth(); // Get user from context
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user) {
            alert('Debes iniciar sesión para publicar');
            router.push('/login');
            return;
        }

        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        const payload = {
            ...data,
            providerId: user.id // Use real user ID
        };

        try {
            const res = await fetch('/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText);
            }

            alert('Servicio publicado con éxito!');
            router.push('/dashboard'); // Redirect to dashboard to see the new service
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Publicá tu Servicio</h1>
                <p className={styles.subtitle}>Completá la información para que los clientes te encuentren</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.section}>
                        <h3>Información Principal</h3>
                        <Input name="title" label="Título del aviso" placeholder="Ej: Electricista Matriculado 24hs" required />

                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>Categoría</label>
                                <select name="category" className={styles.select} required>
                                    <option value="">Seleccionar...</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.field}>
                                <label className={styles.label}>Ubicación</label>
                                <select name="location" className={styles.select} required>
                                    <option value="">Seleccionar...</option>
                                    {flattenedLocations.map(l => (
                                        <option key={l.id} value={l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <Input name="price" label="Precio / Presupuesto" placeholder="Ej: A convenir / $5000 hora" required />
                    </div>

                    <div className={styles.section}>
                        <h3>Detalles</h3>
                        <div className={styles.field}>
                            <label className={styles.label}>Descripción del servicio</label>
                            <textarea
                                name="description"
                                className={styles.textarea}
                                rows={5}
                                placeholder="Describí tu experiencia, horarios y qué incluye tu servicio..."
                                required
                            ></textarea>
                        </div>

                        <Input name="image" label="URL de Foto (Opcional)" placeholder="https://..." />
                    </div>

                    <div className={styles.section}>
                        <h3>Redes Sociales y Contacto</h3>
                        <Input name="socialInstagram" label="Instagram (Link)" placeholder="https://instagram.com/tu_perfil" />
                        <Input name="socialWhatsapp" label="WhatsApp (Número)" placeholder="+54 9 11..." />
                    </div>

                    <Button type="submit" size="lg" disabled={loading}>
                        {loading ? 'Publicando...' : 'Publicar Servicio'}
                    </Button>
                </form>
            </div>
        </div>
    );
}
