'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './NotificationBell.module.css';

export const NotificationBell = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/notifications?userId=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNotificationClick = async (notif: any) => {
        setIsOpen(false);
        if (!notif.read) {
            try {
                await fetch('/api/notifications', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: notif.id })
                });
                // Update local state
                setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
            } catch (err) {
                console.error('Error marking as read:', err);
            }
        }
        router.push(notif.link);
    };

    if (!user) return null;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.bellButton}
                onClick={() => setIsOpen(!isOpen)}
                title="Notificaciones"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>Notificaciones</h3>
                    </div>

                    <div className={styles.notificationList}>
                        {notifications.length === 0 ? (
                            <div className={styles.empty}>
                                No tienes notificaciones nuevas
                            </div>
                        ) : (
                            notifications.slice(0, 5).map(notif => (
                                <div
                                    key={notif.id}
                                    className={`${styles.notificationItem} ${!notif.read ? styles.unread : ''}`}
                                    onClick={() => handleNotificationClick(notif)}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <p className={styles.message}>{notif.message}</p>
                                    <span className={styles.date}>
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className={styles.footer}>
                        <Link href="/dashboard" className={styles.viewAll} onClick={() => setIsOpen(false)}>
                            Ver todas
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};
