import React from 'react';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
    icon?: React.ReactNode;
}

export const Input = ({ label, error, fullWidth, icon, className, ...props }: InputProps) => {
    return (
        <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${className || ''}`}>
            {label && <label className={styles.label}>{label}</label>}
            <div className={styles.inputWrapper}>
                {icon && <span className={styles.icon}>{icon}</span>}
                <input
                    className={`${styles.input} ${error ? styles.errorInput : ''} ${icon ? styles.withIcon : ''}`}
                    {...props}
                />
            </div>
            {error && <span className={styles.errorText}>{error}</span>}
        </div>
    );
};
