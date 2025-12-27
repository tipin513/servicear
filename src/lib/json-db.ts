import prisma from './prisma';
import { User, Service, Contract, Notification, Review, Question } from '@prisma/client';

export type { User, Service, Contract, Notification, Review, Question };

// Helper methods mimicking Prisma
export const db = {
    user: {
        findUnique: async ({ where }: { where: { email?: string; id?: string } }) => {
            return await prisma.user.findUnique({ where: where as any });
        },
        findById: async (id: string) => {
            return await prisma.user.findUnique({ where: { id } });
        },
        create: async ({ data }: { data: any }) => {
            return await prisma.user.create({ data });
        },
        update: async ({ where, data }: { where: { email?: string; id?: string }, data: any }) => {
            return await prisma.user.update({ where: where as any, data });
        },
        findMany: async () => {
            return await prisma.user.findMany();
        },
        delete: async ({ where }: { where: { id: string } }) => {
            return await prisma.user.delete({ where });
        },
        toggleFavorite: async (userId: string, serviceId: string) => {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) return null;

            const favorites = user.favorites || [];
            const newFavorites = favorites.includes(serviceId)
                ? favorites.filter(id => id !== serviceId)
                : [...favorites, serviceId];

            return await prisma.user.update({
                where: { id: userId },
                data: { favorites: newFavorites }
            });
        }
    },
    service: {
        findUnique: async ({ where, include }: { where: { id: string }, include?: any }) => {
            return await prisma.service.findUnique({
                where,
                include: {
                    provider: include?.provider,
                    reviews: include?.reviews
                }
            });
        },
        create: async ({ data }: { data: any }) => {
            return await prisma.service.create({ data });
        },
        update: async ({ where, data }: { where: { id: string }, data: any }) => {
            return await prisma.service.update({ where, data });
        },
        delete: async ({ where }: { where: { id: string } }) => {
            return await prisma.service.delete({ where });
        },
        findMany: async () => {
            const services = await prisma.service.findMany({
                include: {
                    provider: true,
                    reviews: true
                }
            });

            return services.map(s => {
                const rating = s.reviews.length > 0
                    ? s.reviews.reduce((acc, r) => acc + r.rating, 0) / s.reviews.length
                    : 0;

                return {
                    ...s,
                    provider: {
                        ...s.provider,
                        rating,
                        reviews: s.reviews.length
                    }
                };
            });
        }
    },
    contract: {
        create: async (data: any) => {
            return await prisma.contract.create({ data });
        },
        update: async ({ where, data }: { where: { id: string }, data: any }) => {
            return await prisma.contract.update({ where, data });
        },
        findMany: async ({ where }: { where: { clientId?: string, providerId?: string, serviceId?: string } }) => {
            return await prisma.contract.findMany({ where: where as any });
        },
        delete: async (id: string) => {
            return await prisma.contract.delete({ where: { id } });
        },
        deleteAll: async (where: { providerId?: string, clientId?: string }) => {
            return await prisma.contract.deleteMany({ where: where as any });
        }
    },
    notification: {
        create: async (data: any) => {
            return await prisma.notification.create({ data });
        },
        findMany: async ({ where }: { where: { userId: string } }) => {
            return await prisma.notification.findMany({
                where,
                orderBy: { createdAt: 'desc' }
            });
        },
        markRead: async (id: string) => {
            return await prisma.notification.update({
                where: { id },
                data: { read: true }
            });
        },
        markAllRead: async (userId: string) => {
            return await prisma.notification.updateMany({
                where: { userId },
                data: { read: true }
            });
        },
        delete: async (id: string) => {
            return await prisma.notification.delete({ where: { id } });
        },
        deleteAll: async (userId: string) => {
            return await prisma.notification.deleteMany({ where: { userId } });
        }
    },
    review: {
        create: async (data: any) => {
            return await prisma.review.create({ data });
        },
        findMany: async ({ where }: { where: { serviceId?: string; serviceIds?: string[] } }) => {
            return await prisma.review.findMany({
                where: {
                    OR: [
                        where.serviceId ? { serviceId: where.serviceId } : {},
                        where.serviceIds ? { serviceId: { in: where.serviceIds } } : {}
                    ]
                }
            });
        }
    },
    question: {
        create: async (data: any) => {
            return await prisma.question.create({ data });
        },
        findMany: async ({ where }: { where: { serviceId: string } }) => {
            return await prisma.question.findMany({ where });
        },
        update: async ({ where, data }: { where: { id: string }, data: any }) => {
            return await prisma.question.update({ where, data });
        }
    }
};
