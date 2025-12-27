'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ServiceList } from '../../components/services/ServiceList';
import { Filters } from '../../components/services/Filters';
import styles from './page.module.css';

// Componente interno para manejar la lógica de búsqueda
function SearchContent() {
    const searchParams = useSearchParams();
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const categoryParam = searchParams.get('category');
    const locationParam = searchParams.get('location');
    const qParam = searchParams.get('q');

    useEffect(() => {
        // Fetch real data from API
        fetch('/api/services')
            .then(res => res.json())
            .then(data => {
                setServices(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching services", err);
                setLoading(false);
            });
    }, []);

    // Filter services logic
    const filteredServices = services.filter((service) => {
        // 1. Filter by Category
        if (categoryParam && service.categoryId !== categoryParam && service.category !== categoryParam) {
            return false;
        }

        // 2. Filter by Location
        if (locationParam) {
            const locId = locationParam.toLowerCase();
            // Safe check for location existence
            const serviceLocId = (service.locationId || '').toLowerCase();
            const serviceLocName = (service.location || '').toLowerCase();

            if (!serviceLocId.includes(locId) && !serviceLocName.includes(locId)) {
                return false;
            }
        }

        // 3. Filter by Search Query (Title or Description)
        if (qParam) {
            const query = qParam.toLowerCase();
            const matchTitle = (service.title || '').toLowerCase().includes(query);
            const matchDesc = (service.description || '').toLowerCase().includes(query);
            const matchTags = service.tags ? service.tags.some((tag: string) => tag.includes(query)) : false;

            if (!matchTitle && !matchDesc && !matchTags) {
                return false;
            }
        }

        return true;
    });

    if (loading) {
        return (
            <div className={`container ${styles.container}`}>
                <p className={styles.loading}>Cargando servicios...</p>
            </div>
        );
    }

    return (
        <div className={`container ${styles.container}`}>
            <div className={styles.header}>
                <h1 className={styles.title}>Resultados de búsqueda</h1>
                <p className={styles.count}>
                    {filteredServices.length} profesionales encontrados
                    {categoryParam && ` en categoría seleccionada`}
                    {locationParam && ` en tu zona`}
                </p>
            </div>

            <div className={styles.content}>
                <div className={styles.filtersWrapper}>
                    <Filters
                        currentCategory={categoryParam || undefined}
                        currentLocation={locationParam || undefined}
                    />
                </div>

                <div className={styles.resultsWrapper}>
                    {filteredServices.length > 0 ? (
                        <ServiceList services={filteredServices} />
                    ) : (
                        <div className={styles.noResults}>
                            <p>No encontramos profesionales con esos filtros.</p>
                            <p>Probá ampliando tu búsqueda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Componente principal que envuelve en Suspense
export default function SearchPage() {
    return (
        <Suspense fallback={<div className="container">Cargando buscador...</div>}>
            <SearchContent />
        </Suspense>
    );
}
