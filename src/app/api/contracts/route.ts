import { NextResponse } from 'next/server';
import { db } from '@/lib/json-db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { serviceId, clientId, providerId } = body;

        if (!serviceId || !clientId || !providerId) {
            return new NextResponse('Faltan datos requeridos', { status: 400 });
        }

        // 1. Create Contract
        const contract = await db.contract.create({
            serviceId,
            clientId,
            providerId
        });

        // 2. Create Notification for Provider
        // Get client name for the message
        const client = await db.user.findById(clientId);
        const clientName = client ? client.name : 'Un usuario';

        await db.notification.create({
            userId: providerId,
            message: `¡Nueva solicitud! ${clientName} quiere contratar tu servicio.`,
            type: 'contract',
            link: '/dashboard'
        });

        return NextResponse.json(contract);
    } catch (error) {
        console.error(error);
        return new NextResponse('Error al crear contrato', { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) return new NextResponse('ID y status son requeridos', { status: 400 });

        const updated = await db.contract.update({
            where: { id },
            data: { status }
        });

        if (!updated) return new NextResponse('Contrato no encontrado', { status: 404 });

        // Notify Client about the status change
        // For brevity we assume client exists if contract exists
        let notifMessage = '';
        if (status === 'accepted') notifMessage = 'Aceptada';
        else if (status === 'completed') notifMessage = 'Finalizada';
        else if (status === 'rejected') notifMessage = 'Rechazada';

        await db.notification.create({
            userId: updated.clientId,
            message: `Tu solicitud para el servicio ha sido actualizada a: ${notifMessage}`,
            type: 'system',
            link: '/dashboard'
        });

        return NextResponse.json(updated);
    } catch (error) {
        return new NextResponse('Error al actualizar contrato', { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const serviceId = searchParams.get('serviceId');
    const providerId = searchParams.get('providerId');

    const where: any = {};
    if (clientId) where.clientId = clientId;
    if (serviceId) where.serviceId = serviceId;
    if (providerId) where.providerId = providerId;

    try {
        const contracts = await db.contract.findMany({ where });

        // Enrich with service details manually since we don't have JOINs
        const enrichedContracts = await Promise.all(contracts.map(async (c: any) => {
            const service = await db.service.findUnique({ where: { id: c.serviceId }, include: { provider: true } });
            const client = await db.user.findById(c.clientId);
            return {
                ...c,
                service,
                client: client ? { name: client.name, email: client.email, phone: client.phone } : null
            };
        }));

        return NextResponse.json(enrichedContracts);
    } catch (error) {
        return new NextResponse('Error fetching contracts', { status: 500 });
    }
}
export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const providerId = searchParams.get('providerId');
    const clientId = searchParams.get('clientId');

    try {
        if (id) {
            await db.contract.delete(id);
        } else if (providerId || clientId) {
            await db.contract.deleteAll({ providerId: providerId || undefined, clientId: clientId || undefined });
        } else {
            return new NextResponse('ID or owner identification required', { status: 400 });
        }
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return new NextResponse('Error deleting contracts', { status: 500 });
    }
}
