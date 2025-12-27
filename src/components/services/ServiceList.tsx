import React from 'react';
import { Service } from '../../data/services';
import { ServiceCard } from './ServiceCard';
import styles from './ServiceList.module.css';

interface ServiceListProps {
    services: Service[];
}

export const ServiceList = ({ services }: ServiceListProps) => {
    return (
        <div className={styles.grid}>
            {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
            ))}
        </div>
    );
};
