import { NextResponse } from 'next/server';
import { db } from '@/lib/json-db';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { serviceId, authorId, rating, comment } = body;

        // Validation
        if (!serviceId || !authorId || !rating || !comment) {
            return new NextResponse('Faltan datos', { status: 400 });
        }

        // Check verification: Does the user have a contract with this service?
        // Ideally we check status === 'completed' or 'accepted', but for MVP existence is enough.
        const contracts = await db.contract.findMany({
            where: {
                clientId: authorId,
                serviceId: serviceId
            }
        });

        if (contracts.length === 0) {
            return new NextResponse('Debes contratar el servicio antes de calificarlo', { status: 403 });
        }

        const review = await db.review.create({
            serviceId,
            authorId,
            rating,
            comment
        });

        return NextResponse.json(review);
    } catch (error) {
        return new NextResponse('Error al crear reseña', { status: 500 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const providerId = searchParams.get('providerId');

    try {
        if (serviceId) {
            const reviews = await db.review.findMany({
                where: { serviceId }
            });
            return NextResponse.json(reviews);
        }

        if (providerId) {
            // 1. Get all services for this provider
            const services = await db.service.findMany();
            const providerServiceIds = services
                .filter(s => s.providerId === providerId)
                .map(s => s.id);

            // 2. Get all reviews for those services
            const reviews = await db.review.findMany({
                where: { serviceIds: providerServiceIds }
            });
            return NextResponse.json(reviews);
        }

        return new NextResponse('serviceId o providerId requerido', { status: 400 });
    } catch (error) {
        return new NextResponse('Error fetching reviews', { status: 500 });
    }
}
