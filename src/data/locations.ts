export interface Location {
    id: string;
    name: string;
    type: 'zone' | 'city' | 'neighborhood';
    parentId?: string;
    children?: Location[];
}

export const locations: Location[] = [
    {
        id: 'caba',
        name: 'Capital Federal',
        type: 'zone',
        children: [
            { id: 'palermo', name: 'Palermo', type: 'neighborhood', parentId: 'caba' },
            { id: 'recoleta', name: 'Recoleta', type: 'neighborhood', parentId: 'caba' },
            { id: 'belgrano', name: 'Belgrano', type: 'neighborhood', parentId: 'caba' },
            { id: 'caballito', name: 'Caballito', type: 'neighborhood', parentId: 'caba' },
            { id: 'almagro', name: 'Almagro', type: 'neighborhood', parentId: 'caba' },
            { id: 'villa-urquiza', name: 'Villa Urquiza', type: 'neighborhood', parentId: 'caba' },
            { id: 'devoto', name: 'Villa Devoto', type: 'neighborhood', parentId: 'caba' },
            { id: 'san-telmo', name: 'San Telmo', type: 'neighborhood', parentId: 'caba' },
            { id: 'microcentro', name: 'Microcentro', type: 'neighborhood', parentId: 'caba' },
        ]
    },
    {
        id: 'gba-norte',
        name: 'GBA Norte',
        type: 'zone',
        children: [
            { id: 'vicente-lopez', name: 'Vicente López', type: 'city', parentId: 'gba-norte' },
            { id: 'san-isidro', name: 'San Isidro', type: 'city', parentId: 'gba-norte' },
            { id: 'olivos', name: 'Olivos', type: 'city', parentId: 'gba-norte' },
            { id: 'martinez', name: 'Martínez', type: 'city', parentId: 'gba-norte' },
            { id: 'tigre', name: 'Tigre', type: 'city', parentId: 'gba-norte' },
            { id: 'pilar', name: 'Pilar', type: 'city', parentId: 'gba-norte' },
        ]
    },
    {
        id: 'gba-sur',
        name: 'GBA Sur',
        type: 'zone',
        children: [
            { id: 'avellaneda', name: 'Avellaneda', type: 'city', parentId: 'gba-sur' },
            { id: 'lanus', name: 'Lanús', type: 'city', parentId: 'gba-sur' },
            { id: 'quilmes', name: 'Quilmes', type: 'city', parentId: 'gba-sur' },
            { id: 'lomas', name: 'Lomas de Zamora', type: 'city', parentId: 'gba-sur' },
            { id: 'adrogue', name: 'Adrogué', type: 'city', parentId: 'gba-sur' }
        ]
    },
    {
        id: 'gba-oeste',
        name: 'GBA Oeste',
        type: 'zone',
        children: [
            { id: 'ramos-mejia', name: 'Ramos Mejía', type: 'city', parentId: 'gba-oeste' },
            { id: 'moron', name: 'Morón', type: 'city', parentId: 'gba-oeste' },
            { id: 'castelar', name: 'Castelar', type: 'city', parentId: 'gba-oeste' },
            { id: 'haedo', name: 'Haedo', type: 'city', parentId: 'gba-oeste' },
            { id: 'san-justo', name: 'San Justo', type: 'city', parentId: 'gba-oeste' }
        ]
    }
];

// Helper to flatten locations for easy searching
export const flattenedLocations = locations.flatMap(zone => [
    zone,
    ...(zone.children || [])
]);
