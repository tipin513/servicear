import React from 'react';
import { Service } from '../../data/services';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Star, MapPin, Clock, ShieldCheck, MessageCircle } from 'lucide-react';
import styles from './ProviderProfile.module.css';

interface ProviderProfileProps {
    service: Service;
}

export const ProviderProfile = ({ service }: ProviderProfileProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.mainInfo}>
                    <h1 className={styles.title}>{service.title}</h1>
                    <div className={styles.meta}>
                        <span className={styles.category}>{service.category}</span>
                        <div className={styles.location}>
                            <MapPin size={16} />
                            {service.location}
                        </div>
                    </div>
                </div>
                <div className={styles.actions}>
                    <div className={styles.price}>{service.price}</div>
                    <div className={styles.buttons}>
                        <Button size="lg">Contactar</Button>
                        <Button size="lg" variant="outline">Pedir Presupuesto</Button>
                    </div>
                </div>
            </div>

            <div className={styles.grid}>
                <div className={styles.mainContent}>
                    <div className={styles.imageWrapper}>
                        <img src={service.image} alt={service.title} className={styles.image} />
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Descripción del servicio</h2>
                        <p className={styles.description}>{service.description}</p>
                        <p className={styles.description}>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                            Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        </p>
                    </div>

                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Opiniones</h2>
                        <div className={styles.reviewsSummary}>
                            <div className={styles.ratingBig}>
                                <Star size={32} fill="#F59E0B" color="#F59E0B" />
                                <span>{service.provider.rating}</span>
                            </div>
                            <p>{service.provider.reviews} reseñas verificadas</p>
                        </div>
                    </div>
                </div>

                <aside className={styles.sidebar}>
                    <div className={styles.providerCard}>
                        <h3 className={styles.providerTitle}>Sobre el prestador</h3>
                        <div className={styles.providerHeader}>
                            <div className={styles.avatarPlaceholder}>{service.provider.name[0]}</div>
                            <div>
                                <div className={styles.providerName}>{service.provider.name}</div>
                                {service.provider.verified && (
                                    <Badge variant="success">Identidad Verificada</Badge>
                                )}
                            </div>
                        </div>

                        <ul className={styles.stats}>
                            <li className={styles.statItem}>
                                <ShieldCheck size={20} className={styles.icon} />
                                <span>Matriculado</span>
                            </li>
                            <li className={styles.statItem}>
                                <Clock size={20} className={styles.icon} />
                                <span>Responde en 1h</span>
                            </li>
                            <li className={styles.statItem}>
                                <MessageCircle size={20} className={styles.icon} />
                                <span>{service.provider.reviews} trabajos realizados</span>
                            </li>
                        </ul>

                        <Button fullWidth variant="outline" className={styles.profileBtn}>Ver perfil completo</Button>
                    </div>
                </aside>
            </div>
        </div>
    );
};
