import { NextResponse } from 'next/server';
import { db } from '@/lib/json-db';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        if (!id) return new NextResponse('ID requerido', { status: 400 });

        const deleted = await db.user.delete({ where: { id } });

        if (!deleted) {
            return new NextResponse('Usuario no encontrado', { status: 404 });
        }

        return NextResponse.json(deleted);
    } catch (error) {
        return new NextResponse('Error al eliminar usuario', { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();

        // Allowed fields to update by admin
        const { name, email, role } = body;

        const updated = await db.user.update({
            where: { id },
            data: { name, email, role }
        });

        if (!updated) {
            return new NextResponse('Usuario no encontrado', { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (error) {
        return new NextResponse('Error al actualizar usuario', { status: 500 });
    }
}
