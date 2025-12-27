import { ComponentType } from 'react';
import {
    Home, Sparkles, Car, Laptop, User, PartyPopper,
    Wrench, Hammer, Paintbrush, Zap, Droplet, Key, Camera, Music, Dumbbell, Scissors
} from 'lucide-react';

export interface Category {
    id: string;
    name: string;
    icon: string;
    iconName?: string; // For dynamic lookup if needed, though direct import is better
    services: string[];
}

export const categories: Category[] = [
    {
        id: 'hogar-mantenimiento',
        name: 'Hogar y Mantenimiento',
        icon: 'Wrench',
        services: [
            'Aire acondicionado', 'Electricidad', 'Plomería', 'Gasista', 'TV y Soportes',
            'Electrodomésticos', 'Albañilería', 'Pintura', 'Durlock', 'Impermeabilización',
            'Cerrajería', 'Termotanques', 'Bombas de agua', 'Porteros', 'Cámaras'
        ]
    },
    {
        id: 'servicios-hogar',
        name: 'Servicios del Hogar',
        icon: 'Sparkles',
        services: [
            'Limpieza', 'Limpieza post obra', 'Jardinería', 'Corte de pasto',
            'Fumigación', 'Mudanzas', 'Armado de muebles', 'Vidriería'
        ]
    },
    {
        id: 'vehiculos',
        name: 'Vehículos',
        icon: 'Car',
        services: [
            'Mecánica', 'Electricidad automotor', 'Alarmas', 'Polarizado',
            'Lavado', 'Auxilio mecánico', 'Gomería móvil'
        ]
    },
    {
        id: 'tecnicos-digitales',
        name: 'Técnicos y Digitales',
        icon: 'Laptop',
        services: [
            'PC y Notebooks', 'Redes y WiFi', 'Cámaras IP', 'Smart Home',
            'Soporte IT', 'Diseño web', 'Marketing digital', 'Community manager',
            'Edición de video', 'Fotografía'
        ]
    },
    {
        id: 'servicios-personales',
        name: 'Servicios Personales',
        icon: 'User',
        services: [
            'Profesores particulares', 'Apoyo escolar', 'Clases música',
            'Personal Trainer', 'Masajistas', 'Estética', 'Barbería/Peluquería'
        ]
    },
    {
        id: 'eventos',
        name: 'Eventos',
        icon: 'PartyPopper',
        services: [
            'DJ', 'Sonido e iluminación', 'Foto y video', 'Animación',
            'Catering', 'Decoración'
        ]
    }
];
