import { NextResponse } from 'next/server';
import { db } from '@/lib/json-db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            name,
            email,
            password,
            role,
            phone,
            location,
            about,
            avatar,
            category
        } = body;

        if (!name || !email || !password) {
            return new NextResponse('Faltan datos requeridos', { status: 400 });
        }

        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return new NextResponse('El email ya está registrado', { status: 400 });
        }

        // Create user with all profile fields
        const user = await db.user.create({
            data: {
                name,
                email,
                password,
                role: role || 'client',
                phone,
                location,
                about,
                avatar,
                category
            },
        });

        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            location: user.location,
            about: user.about,
            avatar: user.avatar,
            category: user.category
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        return new NextResponse(error.message || 'Error interno', { status: 500 });
    }
}
