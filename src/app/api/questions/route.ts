import { NextResponse } from 'next/server';
import { db } from '@/lib/json-db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const providerId = searchParams.get('providerId');

    if (!serviceId && !providerId) return new NextResponse('ServiceId o ProviderId requerido', { status: 400 });

    try {
        let questions: any[] = [];

        if (serviceId) {
            questions = await db.question.findMany({
                where: { serviceId }
            });
        } else if (providerId) {
            // Find all services for this provider
            const services = await db.service.findMany(); // Assuming findMany returns all if no args, we need to filter
            // Actually json-db findMany implementation for service doesn't take args in my previous view, 
            // but let's check... wait, I can just filter manually if needed or use db.service.findMany() if I updated it.
            // Earlier view of json-db.ts showed db.service.findMany() returns ALL.
            // So:
            const providerServices = services.filter((s: any) => s.providerId === providerId);
            const providerServiceIds = providerServices.map((s: any) => s.id);

            // Now find questions for these services
            // Since db.question.findMany takes a single serviceId in 'where', we might need to iterate or fetch all.
            // Let's assume for prototype we fetch all questions (if we can) or specific implementation.
            // My json-db for questions only supports 'where: { serviceId }'.
            // I'll cheat for the prototype: Fetch ALL questions (requires updating json-db or just iterating)
            // Wait, I can't easily fetch all questions with current json-db interface unless I modify it.

            // Hack: I will modify json-db to export `questions` array via `readDb` or add `findAll`.
            // BETTER: Use Promise.all
            const allQuestionsArrays = await Promise.all(providerServiceIds.map((sid: string) =>
                db.question.findMany({ where: { serviceId: sid } })
            ));
            questions = allQuestionsArrays.flat();
        }

        // Enrich with user name AND service title (useful for dashboard)
        const enriched = await Promise.all(questions.map(async (q: any) => {
            const user = await db.user.findById(q.userId);
            const service = await db.service.findUnique({ where: { id: q.serviceId } });
            return {
                ...q,
                userName: user ? user.name : 'Usuario',
                serviceTitle: service ? service.title : 'Servicio'
            };
        }));

        // Sort by date desc
        enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json(enriched);
    } catch (error) {
        console.error(error);
        return new NextResponse('Error fetching questions', { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { serviceId, userId, question } = body;

        if (!serviceId || !userId || !question) {
            return new NextResponse('Faltan datos', { status: 400 });
        }

        const newQuestion = await db.question.create({
            serviceId,
            userId,
            question
        });

        // Notify provider
        try {
            const service = await db.service.findUnique({ where: { id: serviceId } });
            if (service) {
                const user = await db.user.findById(userId);
                const userName = user ? user.name : 'Alguien';
                await db.notification.create({
                    userId: service.providerId,
                    message: `Nueva pregunta de ${userName} en "${service.title}": ${question.substring(0, 30)}...`,
                    type: 'message',
                    link: '/dashboard' // or specific anchor
                });
            }
        } catch (e) {
            console.error('Failed to notify provider', e);
        }

        return NextResponse.json(newQuestion);
    } catch (error) {
        return new NextResponse('Error al crear pregunta', { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        const { id, answer } = body;

        if (!id || !answer) {
            return new NextResponse('Faltan datos', { status: 400 });
        }

        const updated = await db.question.update({
            where: { id },
            data: { answer }
        });

        if (!updated) return new NextResponse('Pregunta no encontrada', { status: 404 });

        // Notify user about answer
        try {
            // We need to know who asked... updated has userId
            await db.notification.create({
                userId: updated.userId,
                message: `El profesional respondió tu pregunta: "${answer.substring(0, 30)}..."`,
                type: 'message', // or system
                link: `/services/${updated.serviceId}`
            });
        } catch (e) {
            console.error('Failed to notify user', e);
        }

        return NextResponse.json(updated);
    } catch (error) {
        return new NextResponse('Error al responder', { status: 500 });
    }
}
