'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import styles from './UserMenu.module.css';
import { User, LogOut, LayoutDashboard } from 'lucide-react';

export const UserMenu = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    if (!user) return null;

    return (
        <div className={styles.container} ref={menuRef}>
            <button className={styles.trigger} onClick={() => setIsOpen(!isOpen)}>
                <div className={styles.avatar}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <span className={styles.name}>{user.name.split(' ')[0]}</span>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.userInfo}>
                        <p className={styles.userEmail}>{user.email}</p>
                        <p className={styles.userRole}>{user.role === 'provider' ? 'Profesional' : 'Cliente'}</p>
                    </div>
                    <div className={styles.divider}></div>
                    <Link href="/dashboard" className={styles.item} onClick={() => setIsOpen(false)}>
                        <LayoutDashboard size={16} />
                        Panel de Control
                    </Link>
                    <Link href="/admin" className={styles.item} onClick={() => setIsOpen(false)}>
                        <User size={16} />
                        Admin Demo
                    </Link>
                    <div className={styles.divider}></div>
                    <button className={`${styles.item} ${styles.danger}`} onClick={logout}>
                        <LogOut size={16} />
                        Cerrar Sesión
                    </button>
                </div>
            )}
        </div>
    );
};
