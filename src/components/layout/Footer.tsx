import React from 'react';
import styles from './Footer.module.css';

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`container ${styles.container}`}>
                <div className={styles.grid}>
                    <div>
                        <h3 className={styles.title}>ServiceAR</h3>
                        <p className={styles.text}>
                            La plataforma líder para encontrar servicios profesionales en Argentina.
                        </p>
                    </div>

                    <div>
                        <h4 className={styles.subtitle}>Categorías</h4>
                        <ul className={styles.list}>
                            <li><a href="#">Hogar y Mantenimiento</a></li>
                            <li><a href="#">Servicios Técnicos</a></li>
                            <li><a href="#">Eventos</a></li>
                            <li><a href="#">Vehículos</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className={styles.subtitle}>Soporte</h4>
                        <ul className={styles.list}>
                            <li><a href="#">Ayuda</a></li>
                            <li><a href="#">Seguridad</a></li>
                            <li><a href="#">Términos y Condiciones</a></li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottom}>
                    <p>&copy; {new Date().getFullYear()} ServiceAR. Todos los derechos reservados.</p>
                </div>
            </div>
        </footer>
    );
};
