import React from 'react';
import Link from 'next/link';
import { Service } from '../../data/services';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Star, MapPin } from 'lucide-react';
import styles from './ServiceCard.module.css';

interface ServiceCardProps {
    service: Service;
}

export const ServiceCard = ({ service }: ServiceCardProps) => {
    return (
        <Link href={`/services/${service.id}`} style={{ display: 'block', textDecoration: 'none' }}>
            <Card className={styles.card} hoverable>
                <div className={styles.imageWrapper}>
                    <img src={service.image} alt={service.title} className={styles.image} />
                    <div className={styles.priceTag}>{service.price}</div>
                </div>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <span className={styles.category}>{service.category}</span>
                        <div className={styles.rating}>
                            <Star size={14} fill="#F59E0B" color="#F59E0B" />
                            <span>{service.provider?.rating || 'N/A'}</span>
                            <span className={styles.reviews}>({service.provider?.reviews || 0})</span>
                        </div>
                    </div>

                    <h3 className={styles.title}>{service.title}</h3>

                    <div className={styles.provider}>
                        <div className={styles.providerInfo}>
                            <span className={styles.providerName}>{service.provider?.name || 'Proveedor'}</span>
                            {service.provider?.verified && (
                                <Badge variant="success">Verificado</Badge>
                            )}
                        </div>
                    </div>

                    <div className={styles.footer}>
                        <div className={styles.location}>
                            <MapPin size={14} />
                            <span>{service.location}</span>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
};
