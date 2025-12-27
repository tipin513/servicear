'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { categories } from '../../data/categories';
import { locations } from '../../data/locations';
import { Button } from '../ui/Button';
import styles from './Filters.module.css';

interface FiltersProps {
    currentCategory?: string;
    currentLocation?: string;
}

export const Filters = ({ currentCategory, currentLocation }: FiltersProps) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Helper to update URL params
    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`/search?${params.toString()}`);
    };

    return (
        <aside className={styles.filters}>
            <div className={styles.section}>
                <h3 className={styles.title}>Categorías</h3>
                <ul className={styles.list}>
                    <li className={styles.item}>
                        <label className={`${styles.label} ${!currentCategory ? styles.active : ''}`}>
                            <input
                                type="radio"
                                name="category"
                                checked={!currentCategory}
                                onChange={() => updateFilter('category', null)}
                                className={styles.radio}
                            />
                            Todas
                        </label>
                    </li>
                    {categories.map((category) => (
                        <li key={category.id} className={styles.item}>
                            <label className={`${styles.label} ${currentCategory === category.id ? styles.active : ''}`}>
                                <input
                                    type="radio"
                                    name="category"
                                    checked={currentCategory === category.id}
                                    onChange={() => updateFilter('category', category.id)}
                                    className={styles.radio}
                                />
                                {category.name}
                            </label>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={styles.section}>
                <h3 className={styles.title}>Ubicación</h3>
                <select
                    className={styles.select}
                    value={currentLocation || ''}
                    onChange={(e) => updateFilter('location', e.target.value)}
                >
                    <option value="">Todas las zonas</option>
                    {locations.map((zone) => (
                        <optgroup key={zone.id} label={zone.name}>
                            <option value={zone.id}>{zone.name} (Todo)</option>
                            {zone.children?.map((child) => (
                                <option key={child.id} value={child.id}>
                                    {child.name}
                                </option>
                            ))}
                        </optgroup>
                    ))}
                </select>
            </div>

            <div className={styles.section}>
                <h3 className={styles.title}>Precio</h3>
                <div className={styles.priceRange}>
                    <input type="number" placeholder="Mín" className={styles.priceInput} />
                    <span className={styles.separator}>-</span>
                    <input type="number" placeholder="Máx" className={styles.priceInput} />
                </div>
            </div>

            <Button fullWidth onClick={() => router.push('/search')}>
                Limpiar Filtros
            </Button>
        </aside>
    );
};
