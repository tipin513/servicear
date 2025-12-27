import { NextResponse } from 'next/server';
import { db } from '@/lib/json-db';

export async function GET() {
    try {
        const users = await db.user.findMany();
        // Return sensitive data? For admin prototype yes, but maybe sanitize passwords
        const safeUsers = users.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role
        }));
        return NextResponse.json(safeUsers);
    } catch (error) {
        return new NextResponse('Error al obtener usuarios', { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { email, name, password, newPassword } = body;

        if (!email) {
            return new NextResponse('Email requerido', { status: 400 });
        }

        const user = await db.user.findUnique({ where: { email } });
        if (!user) {
            return new NextResponse('Usuario no encontrado', { status: 404 });
        }

        // Verify old password if changing password
        if (newPassword) {
            if (user.password !== password) {
                return new NextResponse('Contraseña actual incorrecta', { status: 401 });
            }
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (newPassword) updateData.password = newPassword;

        const updatedUser = await db.user.update({
            where: { email },
            data: updateData
        });

        return NextResponse.json({
            id: updatedUser?.id,
            name: updatedUser?.name,
            email: updatedUser?.email,
            role: updatedUser?.role
        });

    } catch (error) {
        return new NextResponse('Error al actualizar perfil', { status: 500 });
    }
}
