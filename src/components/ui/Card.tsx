import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
}

export const Card = ({ children, className, hoverable = false }: CardProps) => {
    return (
        <div className={`${styles.card} ${hoverable ? styles.hoverable : ''} ${className || ''}`}>
            {children}
        </div>
    );
};
