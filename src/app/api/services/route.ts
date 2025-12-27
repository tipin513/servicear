import { NextResponse } from 'next/server';
import { db } from '@/lib/json-db';
import { services as mockServices } from '@/data/services'; // Fallback / hybrid

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            title, description, category, location, price,
            image, socialInstagram, socialWhatsapp, providerId
        } = body;

        // Validate required fields
        if (!title || !description || !category || !location || !price) {
            return new NextResponse('Faltan datos requeridos', { status: 400 });
        }

        // Create in JSON DB
        const newService = await db.service.create({
            data: {
                title,
                description,
                category,
                location,
                price,
                image: image || 'https://via.placeholder.com/400',
                socialInstagram,
                socialWhatsapp,
                providerId: providerId || 'demo_user',
            }
        });

        return NextResponse.json(newService);
    } catch (error: any) {
        console.error('Service creation error:', error);
        return new NextResponse(error.message || 'Error interno de base de datos', { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) return new NextResponse('ID requerido', { status: 400 });

        // Update in DB (Need to implement update in json-db first, or direct here?
        // Wait, json-db doesn't have update for service yet. I should add that first or access raw array if lazy.
        // I should stick to the pattern. But wait, I can edit json-db.ts too or just implement a new method.
        // Let's rely on standard "db.service.update" which I will add to json-db.ts
        // Actually, to be fast and atomic, I'll assume I'll update json-db.ts right after this step.
        const updated = await db.service.update({
            where: { id },
            data
        });

        if (!updated) return new NextResponse('Servicio no encontrado', { status: 404 });

        return NextResponse.json(updated);
    } catch (error) {
        return new NextResponse('Error al actualizar servicio', { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return new NextResponse('ID requerido', { status: 400 });

        const deleted = await db.service.delete({
            where: { id }
        });

        if (!deleted) return new NextResponse('Servicio no encontrado', { status: 404 });

        return NextResponse.json(deleted);
    } catch (error) {
        return new NextResponse('Error al eliminar servicio', { status: 500 });
    }
}

export async function GET() {
    try {
        const dbServices = await db.service.findMany();

        // Map DB services to our frontend interface matches
        const mappedServices = dbServices.map((s: any) => ({
            id: s.id,
            title: s.title,
            category: s.category,
            categoryId: s.category,
            providerId: s.providerId, // Added this field
            provider: {
                name: s.provider ? s.provider.name : 'Usuario',
                verified: false,
                rating: s.provider ? s.provider.rating : 0,
                reviews: s.provider ? s.provider.reviews : 0
            },
            location: s.location,
            locationId: s.location,
            price: s.price,
            image: s.image,
            description: s.description,
            tags: [],
            socialWhatsapp: s.socialWhatsapp,
            socialInstagram: s.socialInstagram
        }));

        // Merge with mocks for prototype (Optional: maybe remove mocks to avoid confusion? kept for now)
        return NextResponse.json([...mappedServices, ...mockServices]);
    } catch (error) {
        // Fallback to mocks only
        return NextResponse.json(mockServices);
    }
}
