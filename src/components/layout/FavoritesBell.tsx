'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import styles from './FavoritesBell.module.css';

export const FavoritesBell = () => {
    const { user } = useAuth();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [favorites, setFavorites] = useState<any[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchFavorites = async () => {
        if (!user) return;
        try {
            const res = await fetch(`/api/favorites?userId=${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setFavorites(data);
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
        }
    };

    useEffect(() => {
        fetchFavorites();
        // Custom event for internal updates if needed, or just poll
        const interval = setInterval(fetchFavorites, 30000);
        return () => clearInterval(interval);
    }, [user]);

    // Listener for storage changes or custom events to update favorites count in real-time
    useEffect(() => {
        const handleUpdate = () => fetchFavorites();
        window.addEventListener('favorites-updated', handleUpdate);
        return () => window.removeEventListener('favorites-updated', handleUpdate);
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

    if (!user) return null;

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.heartButton}
                onClick={() => setIsOpen(!isOpen)}
                title="Favoritos"
            >
                <Heart size={22} fill={favorites.length > 0 ? "#ef4444" : "none"} color={favorites.length > 0 ? "#ef4444" : "currentColor"} />
                {favorites.length > 0 && (
                    <span className={styles.badge}>{favorites.length}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>Mis Favoritos</h3>
                    </div>

                    <div className={styles.favoritesList}>
                        {favorites.length === 0 ? (
                            <div className={styles.empty}>
                                No tienes favoritos guardados
                            </div>
                        ) : (
                            favorites.slice(0, 5).map(service => (
                                <Link
                                    key={service.id}
                                    href={`/services/${service.id}`}
                                    className={styles.favoriteItem}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {service.image && (
                                        <img src={service.image} alt={service.title} className={styles.image} />
                                    )}
                                    <div className={styles.info}>
                                        <p className={styles.title}>{service.title}</p>
                                        <p className={styles.price}>${service.price}</p>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    <div className={styles.footer}>
                        <Link href="/dashboard?tab=favorites" className={styles.viewAll} onClick={() => setIsOpen(false)}>
                            Ver todos los favoritos
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};
