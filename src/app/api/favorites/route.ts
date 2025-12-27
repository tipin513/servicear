import { NextResponse } from 'next/server';
import { db } from '@/lib/json-db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return new NextResponse('UserId requerido', { status: 400 });
    }

    try {
        const user = await db.user.findById(userId);
        if (!user) {
            return new NextResponse('Usuario no encontrado', { status: 404 });
        }

        const favoriteIds = user.favorites || [];
        const allServices = await db.service.findMany();
        const favoriteServices = allServices.filter(s => favoriteIds.includes(s.id));

        return NextResponse.json(favoriteServices);
    } catch (error) {
        return new NextResponse('Error al obtener favoritos', { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, serviceId } = body;

        if (!userId || !serviceId) {
            return new NextResponse('Faltan datos', { status: 400 });
        }

        const updatedUser = await db.user.toggleFavorite(userId, serviceId);

        if (!updatedUser) {
            return new NextResponse('Usuario no encontrado', { status: 404 });
        }

        return NextResponse.json({ favorites: updatedUser.favorites });
    } catch (error) {
        return new NextResponse('Error al actualizar favoritos', { status: 500 });
    }
}
