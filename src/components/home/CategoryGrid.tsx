import Link from 'next/link';
import { categories } from '../../data/categories';
import { Card } from '../ui/Card';
import {
    Home, Sparkles, Car, Laptop, User, PartyPopper,
    Wrench
} from 'lucide-react';
import styles from './CategoryGrid.module.css';

const iconMap: Record<string, any> = {
    'Home': Home,
    'Sparkles': Sparkles,
    'Car': Car,
    'Laptop': Laptop,
    'User': User,
    'PartyPopper': PartyPopper,
    'Wrench': Wrench
};

export const CategoryGrid = () => {
    return (
        <section className={styles.section}>
            <div className="container">
                <h2 className={styles.title}>Explorá por categorías</h2>
                <div className={styles.grid}>
                    {categories.map((category) => {
                        const Icon = iconMap[category.icon] || Home;
                        return (
                            <Link key={category.id} href={`/search?category=${category.id}`} className={styles.link}>
                                <Card hoverable className={styles.card}>
                                    <div className={styles.iconWrapper}>
                                        <Icon size={32} />
                                    </div>
                                    <h3 className={styles.categoryName}>{category.name}</h3>
                                    <p className={styles.serviceCount}>{category.services.length} servicios</p>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
