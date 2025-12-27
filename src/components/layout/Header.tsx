'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserMenu } from '../profile/UserMenu';
import { NotificationBell } from './NotificationBell';
import { FavoritesBell } from './FavoritesBell';
import styles from './Header.module.css';

export const Header = () => {
    const { user } = useAuth();
    return (
        <header className={styles.header}>
            <div className={`container ${styles.container}`}>
                <Link href="/" className={styles.logo}>
                    Service<span className={styles.logoHighlight}>AR</span>
                </Link>

                <div className={styles.searchBar}>
                    <Input
                        placeholder="¿Qué servicio buscás?"
                        icon={<Search size={18} />}
                    />
                </div>

                <nav className={styles.nav}>
                    <Link href="/search" className={styles.link}>Explorar</Link>

                    {user ? (
                        <>
                            {user.role === 'provider' && (
                                <Link href="/publish">
                                    <Button variant="outline" size="sm">Publicar</Button>
                                </Link>
                            )}
                            <FavoritesBell />
                            <NotificationBell />
                            <UserMenu />
                        </>
                    ) : (
                        <div className={styles.authButtons}>
                            {/* Publish button removed for guests */}
                            <div className={styles.divider}></div>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Ingresar</Button>
                            </Link>
                            <Link href="/register">
                                <Button variant="primary" size="sm">Registrate</Button>
                            </Link>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
};
