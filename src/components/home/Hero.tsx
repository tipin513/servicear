import React from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Search, MapPin } from 'lucide-react';
import styles from './Hero.module.css';

export const Hero = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.overlay}></div>
            <div className={`container ${styles.content}`}>
                <h1 className={styles.title}>
                    Encontrá al profesional ideal para tu proyecto
                </h1>
                <p className={styles.subtitle}>
                    Plomeros, electricistas, profesores y más. Todo en un solo lugar.
                </p>

                <div className={styles.searchBox}>
                    <div className={styles.inputGroup}>
                        <Search className={styles.icon} size={20} />
                        <input
                            type="text"
                            placeholder="¿Qué servicio buscás?"
                            className={styles.input}
                        />
                    </div>
                    <div className={styles.divider}></div>
                    <div className={styles.inputGroup}>
                        <MapPin className={styles.icon} size={20} />
                        <input
                            type="text"
                            placeholder="Barrio o Ciudad"
                            className={styles.input}
                        />
                    </div>
                    <Button size="lg" className={styles.button}>
                        Buscar
                    </Button>
                </div>

                <div className={styles.tags}>
                    <span>Populares:</span>
                    <button className={styles.tag}>Aire Acondicionado</button>
                    <button className={styles.tag}>Plomería</button>
                    <button className={styles.tag}>Mudanzas</button>
                </div>
            </div>
        </section>
    );
};
