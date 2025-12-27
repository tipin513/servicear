import { NextResponse } from 'next/server';
import { db } from '@/lib/json-db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return new NextResponse('Faltan credenciales', { status: 400 });
        }

        const user = await db.user.findUnique({
            where: { email: email }
        });

        // Simple password check (plaintext for prototype)
        if (!user || user.password !== password) {
            return new NextResponse('Email o contraseña incorrectos', { status: 401 });
        }

        // Return user info (excluding password)
        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        return new NextResponse('Error interno', { status: 500 });
    }
}
