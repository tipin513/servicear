'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '../../components/ui/Button';
import styles from './page.module.css';

export default function AdminPage() {
    const [services, setServices] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            await Promise.all([fetchServices(), fetchUsers()]);
            setLoading(false);
        };
        fetchData();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/services');
            if (res.ok) setServices(await res.json());
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) setUsers(await res.json());
        } catch (err) { console.error(err); }
    };

    const [editingUser, setEditingUser] = useState<any>(null); // For Edit Modal

    const handleUserDelete = async (id: string, name: string) => {
        if (!confirm(`¿Estás seguro de eliminar el usuario "${name}"? Esta acción es irreversible.`)) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Usuario eliminado');
                fetchUsers();
            } else {
                alert('Error al eliminar');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    const handleUserUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        if (!editingUser) return;

        try {
            const res = await fetch(`/api/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                alert('Usuario actualizado');
                setEditingUser(null);
                fetchUsers();
            } else {
                alert('Error al actualizar');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!confirm(`¿Estás seguro de eliminar el servicio "${title}"?`)) return;

        try {
            const res = await fetch(`/api/services/${id}`, { method: 'DELETE' });
            if (res.ok) {
                alert('Servicio eliminado');
                fetchServices(); // Refresh list
            }
        } catch (err) {
            alert('Error al eliminar');
        }
    };

    if (loading) return <div className="container" style={{ padding: '2rem' }}>Cargando panel...</div>;

    return (
        <div className={`container ${styles.container}`}>
            <div className={styles.header}>
                <h1 className={styles.title}>Panel de Administración</h1>
                <Link href="/">
                    <Button variant="outline" size="sm">Volver al sitio</Button>
                </Link>
            </div>

            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <h3>Total Servicios</h3>
                    <p className={styles.statValue}>{services.length}</p>
                </div>
                <div className={styles.statCard}>
                    <h3>Usuarios</h3>
                    <p className={styles.statValue}>{users.length}</p>
                </div>
            </div>

            <div className={styles.section}>
                <h2>Usuarios Registrados</h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Email</th>
                                <th>Teléfono</th>
                                <th>Ubicación</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id}>
                                    <td className={styles.colId}>{user.id.substring(0, 8)}...</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || '-'}</td>
                                    <td>{user.location || '-'}</td>
                                    <td>
                                        <span className={user.role === 'provider' ? styles.badgeProvider : styles.badgeClient}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className={styles.editBtn}
                                                onClick={() => setEditingUser(user)}
                                            >
                                                Editar
                                            </button>
                                            <button
                                                className={styles.deleteBtn}
                                                onClick={() => handleUserDelete(user.id, user.name)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className={styles.section}>
                <h2>Servicios Publicados</h2>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Servicio</th>
                                <th>Categoría</th>
                                <th>Proveedor</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.id}>
                                    <td className={styles.colId}>{service.id.substring(0, 8)}...</td>
                                    <td>
                                        <div className={styles.serviceInfo}>
                                            <span className={styles.serviceTitle}>{service.title}</span>
                                            <span className={styles.serviceLocation}>{service.location}</span>
                                        </div>
                                    </td>
                                    <td>{service.category}</td>
                                    <td>{service.provider?.name || 'Anon'}</td>
                                    <td>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => handleDelete(service.id, service.title)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {services.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Inexistente.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>Editar Usuario</h2>
                        <form onSubmit={handleUserUpdate} className={styles.modalForm}>
                            <div className={styles.modalField}>
                                <label>Nombre</label>
                                <input
                                    name="name"
                                    defaultValue={editingUser.name}
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label>Email</label>
                                <input
                                    name="email"
                                    defaultValue={editingUser.email}
                                    type="email"
                                />
                            </div>
                            <div className={styles.modalField}>
                                <label>Rol</label>
                                <select
                                    name="role"
                                    defaultValue={editingUser.role}
                                >
                                    <option value="client">Cliente</option>
                                    <option value="provider">Profesional</option>
                                </select>
                            </div>
                            <div className={styles.modalField}>
                                <label>Teléfono</label>
                                <input name="phone" defaultValue={editingUser.phone} />
                            </div>
                            <div className={styles.modalField}>
                                <label>Ubicación</label>
                                <input name="location" defaultValue={editingUser.location} />
                            </div>
                            <div className={styles.modalField}>
                                <label>Bio / Sobre mí</label>
                                <textarea
                                    name="about"
                                    defaultValue={editingUser.about}
                                    className={styles.textarea}
                                    style={{ width: '100%', minHeight: '80px', padding: '0.5rem', borderRadius: '8px', border: '1px solid #ddd' }}
                                />
                            </div>

                            <div className={styles.modalActions}>
                                <Button type="submit" fullWidth>Guardar</Button>
                                <Button type="button" variant="ghost" onClick={() => setEditingUser(null)} fullWidth>Cancelar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
