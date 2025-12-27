'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';
import styles from './page.module.css';
import {
    LayoutDashboard,
    Inbox,
    MessageSquare,
    Briefcase,
    User,
    Bell,
    LogOut,
    Menu,
    X,
    Settings,
    Heart,
    Star
} from 'lucide-react';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');

    // Data States
    const [myServices, setMyServices] = useState<any[]>([]);
    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [providerQuestions, setProviderQuestions] = useState<any[]>([]);
    const [providerReviews, setProviderReviews] = useState<any[]>([]);
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

    // UI States
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [loading, setLoading] = useState(false);
    const [requestTab, setRequestTab] = useState('pending'); // pending, accepted, rejected, completed, all

    // Stats
    const [stats, setStats] = useState({
        pendingJobs: 0,
        acceptedJobs: 0,
        activeServices: 0,
        unansweredQuestions: 0,
        rating: 0,
        favoritesCount: 0
    });

    // --- Data Fetching ---
    useEffect(() => {
        if (!user) return;

        // 1. Notifications (All users)
        fetch(`/api/notifications?userId=${user.id}`)
            .then(res => res.json())
            .then(data => setNotifications(data))
            .catch(console.error);

        // 2. Provider Logic
        if (user.role === 'provider') {
            // My Services
            fetch('/api/services')
                .then(res => res.json())
                .then(data => {
                    const userServices = data.filter((s: any) => s.providerId === user.id);
                    setMyServices(userServices);
                    setStats(prev => ({ ...prev, activeServices: userServices.length }));
                });

            // Incoming Requests
            fetch(`/api/contracts?providerId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setIncomingRequests(data);
                    const pending = data.filter((c: any) => c.status === 'pending').length;
                    const accepted = data.filter((c: any) => c.status === 'accepted').length;
                    setStats(prev => ({ ...prev, pendingJobs: pending, acceptedJobs: accepted }));
                });

            // Questions
            fetch(`/api/questions?providerId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setProviderQuestions(data);
                    const unanswered = data.filter((q: any) => !q.answer).length;
                    setStats(prev => ({ ...prev, unansweredQuestions: unanswered }));
                });

        } else {
            // Client Logic: Contracted Services
            fetch(`/api/contracts?clientId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    const hiredServices = data.map((c: any) => ({
                        ...c.service,
                        contractStatus: c.status,
                        contractId: c.id
                    }));
                    setMyServices(hiredServices);
                });
        }

        // 3. Favorites (All users)
        fetch(`/api/favorites?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
                setFavorites(data);
                setStats(prev => ({ ...prev, favoritesCount: data.length }));
            })
            .catch(console.error);

        // 4. Provider Reviews (Only for providers)
        if (user.role === 'provider') {
            fetch(`/api/reviews?providerId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    setProviderReviews(data);
                    if (data.length > 0) {
                        const sum = data.reduce((acc: number, r: any) => acc + r.rating, 0);
                        const avg = (sum / data.length).toFixed(1);
                        setStats(prev => ({ ...prev, rating: Number(avg) }));
                    }
                })
                .catch(console.error);
        }
    }, [user]);


    // --- Handlers ---
    const handleContractAction = async (contractId: string, status: string) => {
        try {
            await fetch('/api/contracts', {
                method: 'PUT',
                body: JSON.stringify({ id: contractId, status })
            });
            // Optimistic update
            setIncomingRequests(prev => prev.map(r => r.id === contractId ? { ...r, status } : r));
            if (status === 'accepted') alert('Solicitud aceptada');
            if (status === 'rejected') alert('Solicitud rechazada');
            if (status === 'completed') alert('Servicio finalizado');
        } catch (e) { alert('Error al actualizar'); }
    };

    const handleDeleteContract = async (id: string) => {
        try {
            await fetch(`/api/contracts?id=${id}`, { method: 'DELETE' });
            setIncomingRequests(prev => prev.filter(r => r.id !== id));
        } catch (e) { alert('Error al eliminar'); }
    };

    const handleClearContracts = async () => {
        if (!user || !confirm('¿Eliminar todo el historial mostrado?')) return;
        try {
            const providerId = user.role === 'provider' ? user.id : '';
            const clientId = user.role === 'client' ? user.id : '';
            await fetch(`/api/contracts?providerId=${providerId}&clientId=${clientId}`, { method: 'DELETE' });
            setIncomingRequests([]);
        } catch (e) { alert('Error al limpiar historial'); }
    };

    const handleDeleteService = async (id: string) => {
        if (!confirm('¿Eliminar servicio?')) return;
        await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
        setMyServices(prev => prev.filter(s => s.id !== id));
    };

    const handleAnswerQuestion = async (qId: string) => {
        if (!replyText[qId]) return;
        try {
            const res = await fetch('/api/questions', {
                method: 'PUT',
                body: JSON.stringify({ id: qId, answer: replyText[qId] })
            });
            if (res.ok) {
                setProviderQuestions(prev => prev.map(q => q.id === qId ? { ...q, answer: replyText[qId] } : q));
                setStats(prev => ({ ...prev, unansweredQuestions: Math.max(0, prev.unansweredQuestions - 1) }));
            }
        } catch (e) { alert('Error'); }
    };

    const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        if (!user) return;
        const data = Object.fromEntries(new FormData(e.currentTarget));
        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                body: JSON.stringify({ ...data, email: user.email })
            });
            if (res.ok) {
                alert('Perfil actualizado. Inicia sesión de nuevo.');
                logout();
            }
        } catch (e) { alert('Error'); }
        finally { setLoading(false); }
    };

    const handleMarkAllNotificationsRead = async () => {
        if (!user || notifications.filter(n => !n.read).length === 0) return;
        try {
            await fetch('/api/notifications', {
                method: 'PUT',
                body: JSON.stringify({ userId: user.id, action: 'markAllRead' })
            });
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { console.error(e); }
    };

    const handleDeleteNotification = async (id: string) => {
        try {
            await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (e) { console.error(e); }
    };

    const handleClearAllNotifications = async () => {
        if (!user || !confirm('¿Eliminar todas las notificaciones?')) return;
        try {
            await fetch(`/api/notifications?userId=${user.id}`, { method: 'DELETE' });
            setNotifications([]);
        } catch (e) { console.error(e); }
    };

    // Auto mark as read when entering tabs
    useEffect(() => {
        if (!user) return;
        if (activeTab === 'notifications') {
            handleMarkAllNotificationsRead();
        }
        if (activeTab === 'requests') {
            // Mark only contract notifications as read
            const contractNotifs = notifications.filter(n => n.type === 'contract' && !n.read);
            if (contractNotifs.length > 0) {
                // For simplicity we use markAllRead but we could have a more specific API
                // But markAllRead is fine for now as per plan
                handleMarkAllNotificationsRead();
            }
        }
    }, [activeTab]);


    // --- Render Helpers ---

    const renderSidebar = () => {
        const menuItems = [
            { id: 'overview', label: 'Resumen', icon: <LayoutDashboard size={20} /> },
            ...(user?.role === 'provider' ? [
                { id: 'requests', label: 'Solicitudes', icon: <Inbox size={20} />, badge: stats.pendingJobs },
                { id: 'questions', label: 'Preguntas', icon: <MessageSquare size={20} />, badge: stats.unansweredQuestions },
                { id: 'services', label: 'Mis Publicaciones', icon: <Briefcase size={20} /> },
                { id: 'reviews', label: 'Calificaciones', icon: <Star size={20} /> },
            ] : [
                { id: 'services', label: 'Servicios Contratados', icon: <Briefcase size={20} /> },
            ]),
            { id: 'profile', label: 'Mi Perfil', icon: <User size={20} /> },
            { id: 'favorites', label: 'Favoritos', icon: <Heart size={20} />, badge: stats.favoritesCount },
            { id: 'notifications', label: 'Notificaciones', icon: <Bell size={20} />, badge: notifications.filter(n => !n.read).length },
        ];

        return (
            <div className={styles.sidebar}>
                <div className={styles.profileSummary}>
                    <div className={styles.avatarLarge}>{user?.name?.[0]?.toUpperCase() || '?'}</div>
                    <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {user?.name}
                        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setActiveTab('notifications')}>
                            <Bell size={18} color="#6b7280" />
                            {notifications.filter(n => !n.read).length > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-5px', right: '-5px',
                                    backgroundColor: '#ef4444', color: 'white',
                                    fontSize: '0.6rem', padding: '1px 4px',
                                    borderRadius: '999px', fontWeight: 'bold',
                                    border: '1px solid white'
                                }}>
                                    {notifications.filter(n => !n.read).length}
                                </span>
                            )}
                        </div>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{user?.role === 'provider' ? 'Profesional' : 'Cliente'}</div>
                </div>
                <div className={styles.menu}>
                    {menuItems.map(item => (
                        <div
                            key={item.id}
                            className={`${styles.menuItem} ${activeTab === item.id ? styles.menuItemActive : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                            {item.badge ? <span className={styles.menuBadge}>{item.badge}</span> : null}
                        </div>
                    ))}
                    <div className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={logout}>
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </div>
                </div>
            </div>
        );
    };

    const renderData = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div>
                        <h2 className={styles.sectionTitle}>Resumen de Actividad</h2>
                        {user?.role === 'provider' && (
                            <div className={styles.statsGrid}>
                                <div
                                    className={`${styles.statCard} ${styles.statCardClickable}`}
                                    onClick={() => { setActiveTab('requests'); setRequestTab('pending'); }}
                                >
                                    <span className={styles.statValue}>{stats.pendingJobs}</span>
                                    <span className={styles.statLabel}>Trabajos Pendientes</span>
                                </div>
                                <div
                                    className={`${styles.statCard} ${styles.statCardClickable}`}
                                    onClick={() => { setActiveTab('requests'); setRequestTab('accepted'); }}
                                >
                                    <span className={styles.statValue}>{stats.acceptedJobs}</span>
                                    <span className={styles.statLabel}>Trabajos Aceptados</span>
                                </div>
                                <div
                                    className={`${styles.statCard} ${styles.statCardClickable}`}
                                    onClick={() => setActiveTab('questions')}
                                >
                                    <span className={styles.statValue}>{stats.unansweredQuestions}</span>
                                    <span className={styles.statLabel}>Preguntas sin responder</span>
                                </div>
                                <div
                                    className={`${styles.statCard} ${styles.statCardClickable}`}
                                    onClick={() => setActiveTab('services')}
                                >
                                    <span className={styles.statValue}>{stats.activeServices}</span>
                                    <span className={styles.statLabel}>Publicaciones Activas</span>
                                </div>
                                <div
                                    className={`${styles.statCard} ${styles.statCardClickable}`}
                                    onClick={() => setActiveTab('reviews')}
                                >
                                    <span className={styles.statValue}>{stats.rating.toFixed(1)}</span>
                                    <span className={styles.statLabel}>Mi Reputación</span>
                                </div>
                            </div>
                        )}
                        <div className={styles.card}>
                            <h3>Bienvenido a tu panel de control, {user?.name}</h3>
                            <p>Selecciona una opción del menú lateral para gestionar tu cuenta.</p>
                        </div>
                        {/* Show limited recent notifications here? */}
                        <div className={styles.card}>
                            <h3>Últimas Notificaciones</h3>
                            {notifications.slice(0, 3).map(n => (
                                <div key={n.id} style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>
                                    {n.message} <span style={{ fontSize: '0.8rem', color: '#999' }}>({new Date(n.createdAt).toLocaleDateString()})</span>
                                </div>
                            ))}
                            {notifications.length === 0 && <p style={{ color: '#999' }}>No hay notificaciones recientes.</p>}
                        </div>
                    </div>
                );

            case 'requests':
                const filteredRequests = incomingRequests.filter(r => requestTab === 'all' ? true : r.status === requestTab);
                return (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 className={styles.sectionTitle}>Solicitudes de Trabajo</h2>
                            {incomingRequests.length > 0 && (
                                <Button variant="outline" size="sm" onClick={handleClearContracts} style={{ color: 'red' }}>
                                    Borrar Historial
                                </Button>
                            )}
                        </div>

                        {/* Sub-sections Filters */}
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                            {[
                                { id: 'pending', label: 'Pendientes' },
                                { id: 'accepted', label: 'Aceptadas' },
                                { id: 'rejected', label: 'Rechazadas' },
                                { id: 'completed', label: 'Finalizadas' },
                                { id: 'all', label: 'Todo' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setRequestTab(tab.id)}
                                    className={`${styles.filterBtn} ${requestTab === tab.id ? styles.filterBtnActive : ''}`}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '20px',
                                        border: '1px solid #ddd',
                                        background: requestTab === tab.id ? '#2563eb' : 'white',
                                        color: requestTab === tab.id ? 'white' : '#4b5563',
                                        fontSize: '0.85rem',
                                        fontWeight: '500',
                                        cursor: 'pointer',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className={styles.grid}>
                            {filteredRequests.length === 0 && <p style={{ color: '#999', textAlign: 'center', marginTop: '2rem' }}>No hay solicitudes en esta sección.</p>}
                            {filteredRequests.map(req => (
                                <div key={req.id} className={styles.serviceItem} style={{
                                    borderLeft: req.status === 'pending' ? '4px solid #f59e0b' :
                                        (req.status === 'accepted' ? '4px solid #10b981' :
                                            req.status === 'rejected' ? '4px solid #ef4444' : '4px solid #999')
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <h4 style={{ margin: 0, fontWeight: 'bold' }}>{req.service?.title}</h4>
                                            <button
                                                onClick={() => handleDeleteContract(req.id)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px' }}
                                                title="Eliminar"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                        <p style={{ margin: '0.5rem 0' }}>Cliente: {req.client?.name}</p>
                                        <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                            Status: <span style={{
                                                fontWeight: 'bold',
                                                color: req.status === 'pending' ? '#f59e0b' : (req.status === 'accepted' ? '#10b981' : (req.status === 'rejected' ? '#ef4444' : '#6b7280'))
                                            }}>
                                                {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                                            </span>
                                        </p>
                                        {req.status === 'accepted' && req.client?.phone && (
                                            <a href={`https://wa.me/${req.client.phone.replace(/[^0-9]/g, '')}`} target="_blank" style={{ color: '#059669', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem' }}>
                                                Contactar WhatsApp: {req.client.phone}
                                            </a>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center' }}>
                                        {req.status === 'pending' && (
                                            <>
                                                <Button size="sm" onClick={() => handleContractAction(req.id, 'accepted')}>Aceptar</Button>
                                                <Button size="sm" variant="ghost" style={{ color: 'red' }} onClick={() => handleContractAction(req.id, 'rejected')}>Rechazar</Button>
                                            </>
                                        )}
                                        {req.status === 'accepted' && (
                                            <Button size="sm" variant="outline" onClick={() => handleContractAction(req.id, 'completed')}>Finalizar</Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'questions':
                return (
                    <div>
                        <h2 className={styles.sectionTitle}>Preguntas y Respuestas</h2>
                        {providerQuestions.length === 0 && <p>No tienes preguntas.</p>}
                        {providerQuestions.map(q => (
                            <div key={q.id} className={styles.card}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <strong>{q.serviceTitle}</strong>
                                    <span style={{ fontSize: '0.8rem', color: '#999' }}>{new Date(q.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={{ background: '#f9fafb', padding: '0.5rem', borderRadius: '4px' }}>
                                    {q.userName}: "{q.question}"
                                </p>
                                {q.answer ? (
                                    <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '3px solid #10b981' }}>
                                        <strong>Tú:</strong> {q.answer}
                                    </div>
                                ) : (
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            placeholder="Escribe tu respuesta..."
                                            style={{ flex: 1, padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                            value={replyText[q.id] || ''}
                                            onChange={e => setReplyText({ ...replyText, [q.id]: e.target.value })}
                                        />
                                        <Button size="sm" onClick={() => handleAnswerQuestion(q.id)}>Responder</Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );

            case 'services':
                return (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 className={styles.sectionTitle}>{user?.role === 'provider' ? 'Mis Publicaciones' : 'Servicios Contratados'}</h2>
                            {user?.role === 'provider' && (
                                <Link href="/publish"><Button>Nueva Publicación</Button></Link>
                            )}
                        </div>
                        <div className={styles.grid}>
                            {myServices.map(s => (
                                <div key={s.id || s.contractId} className={styles.card} style={{ padding: '1rem' }}>
                                    <h4 style={{ fontWeight: 'bold' }}>{s.title}</h4>
                                    <p style={{ color: '#10b981', fontWeight: 'bold' }}>${s.price}</p>
                                    {user?.role !== 'provider' && <p>Estado: {s.contractStatus}</p>}
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <Link href={`/services/${s.id}`}><Button size="sm" variant="outline">Ver</Button></Link>
                                        {user?.role === 'provider' && (
                                            <Button size="sm" variant="ghost" style={{ color: 'red' }} onClick={() => handleDeleteService(s.id)}>Eliminar</Button>
                                        )}
                                        {user?.role !== 'provider' && s.socialWhatsapp && s.contractStatus === 'accepted' && (
                                            <a href={`https://wa.me/${s.socialWhatsapp}`} target="_blank"><Button size="sm" className="bg-green-600">WhatsApp</Button></a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div>
                        <h2 className={styles.sectionTitle}>Mi Perfil</h2>
                        <div className={styles.card} style={{ maxWidth: '600px' }}>
                            <div className={styles.profileField}>
                                <div className={styles.avatarLarge}>{user?.name?.[0]?.toUpperCase()}</div>
                                <div className={styles.fieldValue}>{user?.name}</div>
                            </div>
                            <div className={styles.profileField}>
                                <div className={styles.fieldLabel}>Email</div>
                                <div className={styles.fieldValue}>{user?.email}</div>
                            </div>
                            <div className={styles.profileField}>
                                <div className={styles.fieldLabel}>Rol</div>
                                <div className={styles.fieldValue}>{user?.role === 'provider' ? 'Profesional' : 'Cliente'}</div>
                            </div>
                            {user?.role === 'provider' && (
                                <>
                                    <div className={styles.profileField}>
                                        <div className={styles.fieldLabel}>Categoría</div>
                                        <div className={styles.fieldValue}>{user.category || 'No especificada'}</div>
                                    </div>
                                    <div className={styles.profileField}>
                                        <div className={styles.fieldLabel}>Ubicación</div>
                                        <div className={styles.fieldValue}>{user.location || 'No especificada'}</div>
                                    </div>
                                </>
                            )}
                            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                                <div className={styles.modalField}>
                                    <label>Nombre</label>
                                    <input name="name" defaultValue={user?.name} />
                                </div>
                                <div className={styles.modalField}>
                                    <label>Teléfono</label>
                                    <input name="phone" defaultValue={user?.phone} placeholder="+54..." />
                                </div>
                                <div className={styles.modalField}>
                                    <label>Nueva Contraseña</label>
                                    <input name="newPassword" type="password" />
                                </div>
                                <div className={styles.modalField}>
                                    <label>Contraseña Actual (para confirmar)</label>
                                    <input name="password" type="password" required />
                                </div>
                                <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Button>
                            </form>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 className={styles.sectionTitle}>Notificaciones</h2>
                            {notifications.length > 0 && (
                                <Button variant="outline" size="sm" onClick={handleClearAllNotifications} style={{ color: 'red' }}>
                                    Borrar Todas
                                </Button>
                            )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {notifications.map(n => (
                                <div key={n.id} className={styles.card} style={{
                                    background: n.read ? 'white' : '#f0f9ff',
                                    borderLeft: n.read ? '1px solid #eee' : '4px solid #2563eb',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '1rem'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0 }}>{n.message}</p>
                                        <small style={{ color: '#999' }}>{new Date(n.createdAt).toLocaleString()}</small>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteNotification(n.id)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#9ca3af',
                                            cursor: 'pointer',
                                            padding: '0.5rem',
                                            borderRadius: '50%',
                                            transition: 'color 0.2s'
                                        }}
                                        title="Eliminar"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                            {notifications.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af', marginTop: '2rem' }}>No tienes notificaciones.</p>}
                        </div>
                    </div>
                );

            case 'favorites':
                return (
                    <div>
                        <h2 className={styles.sectionTitle}>Mis Favoritos</h2>
                        {favorites.length === 0 ? (
                            <div className={styles.card}>
                                <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
                                    No tienes servicios guardados como favoritos aún.
                                </p>
                                <div style={{ textAlign: 'center' }}>
                                    <Link href="/">
                                        <Button>Explorar Servicios</Button>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.favoritesList}>
                                {favorites.map(service => (
                                    <div key={service.id} className={styles.favoriteRow}>
                                        <div className={styles.favoriteImage}>
                                            {service.image ? (
                                                <img src={service.image} alt={service.title} />
                                            ) : (
                                                <span style={{ fontSize: '2rem', color: '#ccc' }}>📷</span>
                                            )}
                                        </div>
                                        <div className={styles.favoriteInfo}>
                                            <div>
                                                <h3 className={styles.favoriteTitle}>{service.title}</h3>
                                                <div className={styles.favoritePrice}>${service.price}</div>
                                            </div>

                                            <div className={styles.favoriteActions}>
                                                <Link href={`/services/${service.id}`} className={styles.textLink}>
                                                    Ver Detalle
                                                </Link>
                                                <button
                                                    className={styles.textLink}
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        const res = await fetch('/api/favorites', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({ userId: user?.id, serviceId: service.id })
                                                        });
                                                        if (res.ok) {
                                                            setFavorites(prev => prev.filter(f => f.id !== service.id));
                                                            setStats(prev => ({ ...prev, favoritesCount: Math.max(0, prev.favoritesCount - 1) }));
                                                            window.dispatchEvent(new CustomEvent('favorites-updated'));
                                                        }
                                                    }}
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );


            case 'reviews':
                return (
                    <div>
                        <h2 className={styles.sectionTitle}>Calificaciones y Comentarios</h2>
                        <div className={styles.card} style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#2563eb' }}>{stats.rating.toFixed(1)}</div>
                                <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            size={20}
                                            fill={star <= Math.round(stats.rating) ? "#fbbf24" : "none"}
                                            color={star <= Math.round(stats.rating) ? "#fbbf24" : "#d1d5db"}
                                        />
                                    ))}
                                </div>
                                <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>{providerReviews.length} calificaciones</p>
                            </div>
                            <div style={{ flex: 1, borderLeft: '1px solid #e5e7eb', paddingLeft: '2rem' }}>
                                <p>Esta es tu reputación general basada en los servicios que has prestado. Los comentarios positivos ayudan a que más clientes confíen en tu trabajo.</p>
                            </div>
                        </div>

                        <div className={styles.favoritesList}>
                            {providerReviews.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>Aún no has recibido calificaciones.</p>
                            ) : (
                                providerReviews.map((review, idx) => (
                                    <div key={review.id || idx} className={styles.favoriteRow} style={{ alignItems: 'flex-start' }}>
                                        <div className={styles.favoriteInfo}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', gap: '2px' }}>
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <Star
                                                            key={star}
                                                            size={16}
                                                            fill={star <= review.rating ? "#fbbf24" : "none"}
                                                            color={star <= review.rating ? "#fbbf24" : "#d1d5db"}
                                                        />
                                                    ))}
                                                </div>
                                                <small style={{ color: '#9ca3af' }}>{new Date(review.createdAt).toLocaleDateString()}</small>
                                            </div>
                                            <p style={{ fontStyle: 'italic', color: '#374151', marginBottom: '0.5rem' }}>"{review.comment}"</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Briefcase size={14} color="#6b7280" />
                                                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                                    {myServices.find(s => s.id === review.serviceId)?.title || 'Servicio prestado'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );

            default: return null;
        }
    };


    if (!user) return <div className={styles.layout}><p style={{ padding: '2rem' }}>Inicia sesión...</p></div>;

    return (
        <div className={styles.layout}>
            {renderSidebar()}
            <main className={styles.main}>
                {renderData()}
            </main>
        </div>
    );
}
