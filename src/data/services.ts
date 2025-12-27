import { Category } from './categories';

export interface Service {
    id: string;
    title: string;
    category: string; // Should match category.id
    categoryId: string; // Explicit ID for filtering
    provider: {
        name: string;
        avatar?: string;
        verified: boolean;
        rating: number;
        reviews: number;
    };
    location: string;
    locationId: string; // Should match location.id
    price: string;
    image: string;
    description: string;
    tags: string[];
}

export const services: Service[] = [
    // HOGAR Y MANTENIMIENTO
    {
        id: '1',
        title: 'Instalación de Aire Acondicionado',
        category: 'Hogar y Mantenimiento',
        categoryId: 'hogar-mantenimiento',
        provider: { name: 'Juan Pérez', verified: true, rating: 4.8, reviews: 124 },
        location: 'Palermo, CABA',
        locationId: 'palermo',
        price: '$45.000',
        image: 'https://images.unsplash.com/photo-1581094794329-cd1361d0e51f?q=80&w=2070',
        description: 'Técnico matriculado. Instalación y service.',
        tags: ['aire', 'climatizacion', 'instalacion']
    },
    {
        id: '2',
        title: 'Electricista Matriculado 24hs Urgencias',
        category: 'Hogar y Mantenimiento',
        categoryId: 'hogar-mantenimiento',
        provider: { name: 'ElectroFast', verified: true, rating: 4.9, reviews: 89 },
        location: 'Belgrano, CABA',
        locationId: 'belgrano',
        price: 'A convenir',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069',
        description: 'Urgencias eléctricas 24hs. Tableros, cableado.',
        tags: ['electricista', '24hs', 'urgencia']
    },
    {
        id: '3',
        title: 'Plomero Gasista Matriculado',
        category: 'Hogar y Mantenimiento',
        categoryId: 'hogar-mantenimiento',
        provider: { name: 'Gas y Agua SRL', verified: true, rating: 4.5, reviews: 42 },
        location: 'Caballito, CABA',
        locationId: 'caballito',
        price: 'Presupuesto s/cargo',
        image: 'https://images.unsplash.com/photo-1505798577917-a651a5d40320?q=80&w=2073',
        description: 'Destapaciones, reparación de cañerías, instalaciones de gas.',
        tags: ['plomero', 'gasista', 'destapaciones']
    },
    {
        id: '4',
        title: 'Pintura de Dptos y Casas',
        category: 'Hogar y Mantenimiento',
        categoryId: 'hogar-mantenimiento',
        provider: { name: 'Colores Vivos', verified: false, rating: 4.2, reviews: 15 },
        location: 'Olivos, GBA Norte',
        locationId: 'olivos',
        price: 'Consultar',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=2070',
        description: 'Trabajos de pintura en general, enduido, impermeabilización.',
        tags: ['pintor', 'pintura']
    },

    // SERVICIOS DEL HOGAR
    {
        id: '5',
        title: 'Limpieza Profunda y Final de Obra',
        category: 'Servicios del Hogar',
        categoryId: 'servicios-hogar',
        provider: { name: 'CleanTech', verified: true, rating: 4.7, reviews: 203 },
        location: 'San Isidro, GBA Norte',
        locationId: 'san-isidro',
        price: '$5.500 / hr',
        image: 'https://images.unsplash.com/photo-1581578731117-104f8a746950?q=80&w=2070',
        description: 'Especialistas en limpieza post obra y mudanzas.',
        tags: ['limpieza', 'hogar']
    },
    {
        id: '6',
        title: 'Jardinero y Paisajista',
        category: 'Servicios del Hogar',
        categoryId: 'servicios-hogar',
        provider: { name: 'Verde Vida', verified: true, rating: 4.9, reviews: 56 },
        location: 'Pilar, GBA Norte',
        locationId: 'pilar',
        price: 'A convenir',
        image: 'https://images.unsplash.com/photo-1599321356942-005a764d6db8?q=80&w=2069',
        description: 'Mantenimiento de parques, poda, diseño de jardines.',
        tags: ['jardinero', 'parque', 'poda']
    },
    {
        id: '7',
        title: 'Fletes y Mudanzas Económicas',
        category: 'Servicios del Hogar',
        categoryId: 'servicios-hogar',
        provider: { name: 'Transportes Rápidos', verified: false, rating: 4.0, reviews: 30 },
        location: 'Morón, GBA Oeste',
        locationId: 'moron',
        price: 'Desde $20.000',
        image: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?q=80&w=2187',
        description: 'Mudanzas a todo el país. Peones incluidos.',
        tags: ['flete', 'mudanza']
    },

    // VEHICULOS
    {
        id: '8',
        title: 'Mecánica Ligera a Domicilio',
        category: 'Vehículos',
        categoryId: 'vehiculos',
        provider: { name: 'Taller Móvil', verified: true, rating: 4.6, reviews: 78 },
        location: 'Lanús, GBA Sur',
        locationId: 'lanus',
        price: 'Presupuesto s/cargo',
        image: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=2070',
        description: 'Arranque, frenos, cambio de aceite en tu domicilio.',
        tags: ['mecanico', 'auto', 'domicilio']
    },
    {
        id: '9',
        title: 'Lavado de autos Premium y Detallado',
        category: 'Vehículos',
        categoryId: 'vehiculos',
        provider: { name: 'Car Spa', verified: true, rating: 4.9, reviews: 110 },
        location: 'Ramos Mejía, GBA Oeste',
        locationId: 'ramos-mejia',
        price: '$12.000',
        image: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?q=80&w=2070',
        description: 'Lavado artesanal, encerado, limpieza de tapizados.',
        tags: ['lavado', 'detailing']
    },

    // TECNICOS
    {
        id: '10',
        title: 'Servicio Técnico PC y Notebooks',
        category: 'Técnicos y Digitales',
        categoryId: 'tecnicos-digitales',
        provider: { name: 'Compufast', verified: true, rating: 4.7, reviews: 156 },
        location: 'Microcentro, CABA',
        locationId: 'microcentro',
        price: 'Consultar',
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?q=80&w=2070',
        description: 'Reparación de hardware y software. Todas las marcas.',
        tags: ['pc', 'notebook', 'reparacion']
    },
    {
        id: '11',
        title: 'Community Manager y Redes Sociales',
        category: 'Técnicos y Digitales',
        categoryId: 'tecnicos-digitales',
        provider: { name: 'Social Boom', verified: true, rating: 4.8, reviews: 45 },
        location: 'Villa Urquiza, CABA',
        locationId: 'villa-urquiza',
        price: 'Planes mensuales',
        image: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974',
        description: 'Gestión de Instagram, Facebook y TikTok para empresas.',
        tags: ['marketing', 'redes', 'instagram']
    },

    // PERSONALES
    {
        id: '12',
        title: 'Clases Particulares Matemáticas / Física',
        category: 'Servicios Personales',
        categoryId: 'servicios-personales',
        provider: { name: 'Prof. Carlos Ruiz', verified: true, rating: 5.0, reviews: 32 },
        location: 'Caballito, CABA',
        locationId: 'caballito',
        price: '$6.000 / hr',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80',
        description: 'Universitario (UBA, UTN) y Secundario. Presencial u Online.',
        tags: ['clases', 'matematica', 'profesor']
    },
    {
        id: '13',
        title: 'Entrenador Personal / Personal Trainer',
        category: 'Servicios Personales',
        categoryId: 'servicios-personales',
        provider: { name: 'FitLife', verified: true, rating: 4.9, reviews: 67 },
        location: 'Palermo, CABA',
        locationId: 'palermo',
        price: '$5.000 / clase',
        image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070',
        description: 'Planes personalizados, descenso de peso, musculación.',
        tags: ['gym', 'fitness', 'entrenador']
    },
    {
        id: '14',
        title: 'Peluquería Canina a Domicilio',
        category: 'Servicios Personales',
        categoryId: 'servicios-personales',
        provider: { name: 'Puppy Love', verified: false, rating: 4.6, reviews: 22 },
        location: 'Recoleta, CABA',
        locationId: 'recoleta',
        price: '$10.000',
        image: 'https://plus.unsplash.com/premium_photo-1664299949987-9942e47c1f83?q=80&w=2070',
        description: 'Baño y corte para perros chicos y medianos.',
        tags: ['perros', 'peluqueria', 'mascotas']
    },

    // EVENTOS
    {
        id: '15',
        title: 'DJ y Sonido para Fiestas',
        category: 'Eventos',
        categoryId: 'eventos',
        provider: { name: 'Party Sound', verified: true, rating: 4.9, reviews: 180 },
        location: 'San Isidro, GBA Norte',
        locationId: 'san-isidro',
        price: 'Consultar fecha',
        image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2070',
        description: 'Equipamiento de última generación. Casamientos, 15 años.',
        tags: ['dj', 'musica', 'fiesta']
    },
    {
        id: '16',
        title: 'Fotografía para Eventos Sociales',
        category: 'Eventos',
        categoryId: 'eventos',
        provider: { name: 'Laura Photo', verified: true, rating: 5.0, reviews: 40 },
        location: 'Vicente López, GBA Norte',
        locationId: 'vicente-lopez',
        price: 'Packs desde $100k',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=2000',
        description: 'Cobertura completa de tu evento. Entrega digital.',
        tags: ['foto', 'fotografo', 'evento']
    },
    {
        id: '17',
        title: 'Catering Pizza Party',
        category: 'Eventos',
        categoryId: 'eventos',
        provider: { name: 'Pizza & Co', verified: true, rating: 4.7, reviews: 95 },
        location: 'Quilmes, GBA Sur',
        locationId: 'quilmes',
        price: '$8.000 p/persona',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070',
        description: 'Pizza libre, gran variedad de gustos. Servicio de camareros.',
        tags: ['catering', 'comida', 'pizza']
    }
];
