import { NextResponse } from 'next/server';
import { db } from '@/lib/json-db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return new NextResponse('UserId requerido', { status: 400 });
    }

    try {
        const notifications = await db.notification.findMany({
            where: { userId }
        });
        // Sort by date desc
        notifications.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return NextResponse.json(notifications);
    } catch (error) {
        return new NextResponse('Error al obtener notificaciones', { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, userId, action } = body;

        if (action === 'markAllRead' && userId) {
            await db.notification.markAllRead(userId);
            return new NextResponse('Ok', { status: 200 });
        }

        if (id) {
            await db.notification.markRead(id);
            return new NextResponse('Ok', { status: 200 });
        }

        return new NextResponse('Faltan datos', { status: 400 });
    } catch (error) {
        return new NextResponse('Error', { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    try {
        if (id) {
            await db.notification.delete(id);
            return new NextResponse('Ok', { status: 200 });
        }
        if (userId) {
            await db.notification.deleteAll(userId);
            return new NextResponse('Ok', { status: 200 });
        }
        return new NextResponse('Faltan datos', { status: 400 });
    } catch (error) {
        return new NextResponse('Error', { status: 500 });
    }
}
