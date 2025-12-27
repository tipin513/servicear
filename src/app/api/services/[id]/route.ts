import { NextResponse } from 'next/server';
import { db } from '@/lib/json-db';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        if (!id) return new NextResponse('ID requerido', { status: 400 });

        const service = await db.service.findUnique({
            where: { id },
            include: { provider: true } // Always include provider info for details page
        });

        if (!service) {
            return new NextResponse('Servicio no encontrado', { status: 404 });
        }

        // Sanitize provider password if it exists (it shouldn't be returned by findUnique technically but safety first)
        if (service.provider && service.provider.password) {
            const { password, ...safeProvider } = service.provider;
            service.provider = safeProvider;
        }

        return NextResponse.json(service);

    } catch (error) {
        return new NextResponse('Error al obtener servicio', { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        if (!id) return new NextResponse('ID requerido', { status: 400 });

        const deleted = await db.service.delete({ where: { id } });

        if (!deleted) {
            return new NextResponse('Servicio no encontrado', { status: 404 });
        }

        return NextResponse.json(deleted);
    } catch (error) {
        return new NextResponse('Error al eliminar servicio', { status: 500 });
    }
}
