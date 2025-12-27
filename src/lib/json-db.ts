import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json');

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    password?: string;
    role: string;
    location?: string;
    about?: string;
    avatar?: string;
    category?: string; // For providers
    favorites?: string[]; // Array of service IDs
}

export interface Service {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    price: string;
    image?: string;
    socialInstagram?: string;
    socialWhatsapp?: string;
    providerId: string;
    createdAt: string;
}

export interface Contract {
    id: string;
    serviceId: string;
    clientId: string;
    providerId: string;
    status: 'pending' | 'accepted' | 'completed' | 'rejected';
    createdAt: string;
}

export interface Notification {
    id: string;
    userId: string; // Recipient
    message: string;
    read: boolean;
    createdAt: string;
    type?: 'contract' | 'system';
    link?: string;
}

export interface Review {
    id: string;
    serviceId: string;
    authorId: string;
    rating: number; // 1-5
    comment: string;
    createdAt: string;
}

export interface Question {
    id: string;
    serviceId: string;
    userId: string;
    question: string;
    answer?: string;
    createdAt: string;
}

interface Schema {
    users: User[];
    services: Service[];
    contracts: Contract[];
    notifications: Notification[];
    reviews: Review[];
    questions: Question[];
}

const initialData: Schema = {
    users: [],
    services: [],
    contracts: [],
    notifications: [],
    reviews: [],
    questions: []
};

function readDb(): Schema {
    try {
        if (!fs.existsSync(DB_PATH)) {
            fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        const file = fs.readFileSync(DB_PATH, 'utf-8');
        const data = JSON.parse(file);
        // Defensive check for new arrays
        if (!data.contracts) data.contracts = [];
        if (!data.notifications) data.notifications = [];
        if (!data.reviews) data.reviews = [];
        if (!data.questions) data.questions = [];
        return data;
    } catch (error) {
        return initialData;
    }
}

function writeDb(data: Schema) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Helper methods mimicking Prisma
export const db = {
    user: {
        findUnique: async ({ where }: { where: { email: string } }) => {
            const data = readDb();
            return data.users.find(u => u.email === where.email) || null;
        },
        findById: async (id: string) => {
            const data = readDb();
            return data.users.find(u => u.id === id) || null;
        },
        create: async ({ data }: { data: Omit<User, 'id'> }) => {
            const dbData = readDb();
            const newUser = { ...data, id: Date.now().toString(), favorites: [] };
            dbData.users.push(newUser);
            writeDb(dbData);
            return newUser;
        },
        update: async ({ where, data }: { where: { email?: string; id?: string }, data: Partial<User> }) => {
            const dbData = readDb();
            const index = dbData.users.findIndex(u => {
                if (where.id) return u.id === where.id;
                if (where.email) return u.email === where.email;
                return false;
            });
            if (index === -1) return null;

            const updatedUser = { ...dbData.users[index], ...data };
            dbData.users[index] = updatedUser;
            writeDb(dbData);
            return updatedUser;
        },
        findMany: async () => {
            const data = readDb();
            return data.users;
        },
        delete: async ({ where }: { where: { id: string } }) => {
            const dbData = readDb();
            const index = dbData.users.findIndex(u => u.id === where.id);
            if (index === -1) return null;

            const deleted = dbData.users[index];
            dbData.users.splice(index, 1);
            writeDb(dbData);
            return deleted;
        },
        toggleFavorite: async (userId: string, serviceId: string) => {
            const dbData = readDb();
            const userIndex = dbData.users.findIndex(u => u.id === userId);
            if (userIndex === -1) return null;

            const user = dbData.users[userIndex];
            const favorites = user.favorites || [];
            if (favorites.includes(serviceId)) {
                user.favorites = favorites.filter(id => id !== serviceId);
            } else {
                user.favorites = [...favorites, serviceId];
            }
            dbData.users[userIndex] = user;
            writeDb(dbData);
            return user;
        }
    },
    service: {
        findUnique: async ({ where, include }: { where: { id: string }, include?: any }) => {
            const data = readDb();
            const service = data.services.find(s => s.id === where.id);
            if (!service) return null;

            const result: any = { ...service };

            if (include?.provider) {
                result.provider = data.users.find(u => u.id === service.providerId);
            }
            if (include?.reviews) {
                result.reviews = data.reviews.filter(r => r.serviceId === service.id);
            }

            return result;
        },
        create: async ({ data }: { data: any }) => {
            const dbData = readDb();
            const newService: Service = {
                id: Date.now().toString(),
                title: data.title,
                description: data.description,
                category: data.category,
                location: data.location,
                price: data.price,
                image: data.image,
                socialInstagram: data.socialInstagram,
                socialWhatsapp: data.socialWhatsapp,
                providerId: data.providerId,
                createdAt: new Date().toISOString()
            };

            dbData.services.push(newService);
            writeDb(dbData);
            return newService;
        },
        update: async ({ where, data }: { where: { id: string }, data: Partial<Service> }) => {
            const dbData = readDb();
            const index = dbData.services.findIndex(s => s.id === where.id);
            if (index === -1) return null;

            const updated = { ...dbData.services[index], ...data };
            dbData.services[index] = updated;
            writeDb(dbData);
            return updated;
        },
        delete: async ({ where }: { where: { id: string } }) => {
            const dbData = readDb();
            const index = dbData.services.findIndex(s => s.id === where.id);
            if (index === -1) return null;

            const deleted = dbData.services[index];
            dbData.services.splice(index, 1);
            writeDb(dbData);
            return deleted;
        },
        findMany: async () => {
            const data = readDb();
            return data.services.map(s => {
                const provider = data.users.find(u => u.id === s.providerId) || { name: 'Usuario', role: 'provider' };
                // Calculate rating
                const serviceReviews = data.reviews?.filter(r => r.serviceId === s.id) || [];
                const rating = serviceReviews.length > 0
                    ? serviceReviews.reduce((acc, r) => acc + r.rating, 0) / serviceReviews.length
                    : 0;

                return {
                    ...s,
                    provider: { ...provider, rating, reviews: serviceReviews.length }
                };
            });
        }
    },
    contract: {
        create: async (data: Omit<Contract, 'id' | 'createdAt' | 'status'>) => {
            const dbData = readDb();
            const newContract: Contract = {
                id: Date.now().toString(),
                ...data,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            dbData.contracts.push(newContract);
            writeDb(dbData);
            return newContract;
        },
        update: async ({ where, data }: { where: { id: string }, data: Partial<Contract> }) => {
            const dbData = readDb();
            const index = dbData.contracts.findIndex(c => c.id === where.id);
            if (index === -1) return null;

            const updated = { ...dbData.contracts[index], ...data };
            dbData.contracts[index] = updated;
            writeDb(dbData);
            return updated;
        },
        findMany: async ({ where }: { where: { clientId?: string, providerId?: string, serviceId?: string } }) => {
            const data = readDb();
            return data.contracts.filter(c => {
                if (where.clientId && c.clientId !== where.clientId) return false;
                if (where.providerId && c.providerId !== where.providerId) return false;
                if (where.serviceId && c.serviceId !== where.serviceId) return false;
                return true;
            });
        },
        delete: async (id: string) => {
            const dbData = readDb();
            const index = dbData.contracts.findIndex(c => c.id === id);
            if (index !== -1) {
                dbData.contracts.splice(index, 1);
                writeDb(dbData);
            }
        },
        deleteAll: async (where: { providerId?: string, clientId?: string }) => {
            const dbData = readDb();
            dbData.contracts = dbData.contracts.filter(c => {
                if (where.providerId && c.providerId === where.providerId) return false;
                if (where.clientId && c.clientId === where.clientId) return false;
                return true;
            });
            writeDb(dbData);
        }
    },
    notification: {
        create: async (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
            const dbData = readDb();
            const newNotif: Notification = {
                id: Date.now().toString(),
                ...data,
                read: false,
                createdAt: new Date().toISOString()
            };
            dbData.notifications.push(newNotif);
            writeDb(dbData);
            return newNotif;
        },
        findMany: async ({ where }: { where: { userId: string } }) => {
            const data = readDb();
            return data.notifications.filter(n => n.userId === where.userId);
        },
        markRead: async (id: string) => {
            const dbData = readDb();
            const notif = dbData.notifications.find(n => n.id === id);
            if (notif) {
                notif.read = true;
                writeDb(dbData);
            }
        },
        markAllRead: async (userId: string) => {
            const dbData = readDb();
            dbData.notifications.forEach(n => {
                if (n.userId === userId) n.read = true;
            });
            writeDb(dbData);
        },
        delete: async (id: string) => {
            const dbData = readDb();
            const index = dbData.notifications.findIndex(n => n.id === id);
            if (index !== -1) {
                dbData.notifications.splice(index, 1);
                writeDb(dbData);
            }
        },
        deleteAll: async (userId: string) => {
            const dbData = readDb();
            dbData.notifications = dbData.notifications.filter(n => n.userId !== userId);
            writeDb(dbData);
        }
    },
    review: {
        create: async (data: Omit<Review, 'id' | 'createdAt'>) => {
            const dbData = readDb();
            const newReview: Review = {
                id: Date.now().toString(),
                ...data,
                createdAt: new Date().toISOString()
            };
            dbData.reviews.push(newReview);
            writeDb(dbData);
            return newReview;
        },
        findMany: async ({ where }: { where: { serviceId?: string, serviceIds?: string[] } }) => {
            const data = readDb();
            return data.reviews.filter(r => {
                if (where.serviceId && r.serviceId !== where.serviceId) return false;
                if (where.serviceIds && !where.serviceIds.includes(r.serviceId)) return false;
                return true;
            });
        }
    },
    question: {
        create: async (data: Omit<Question, 'id' | 'createdAt'>) => {
            const dbData = readDb();
            const newQuestion: Question = {
                id: Date.now().toString(),
                ...data,
                createdAt: new Date().toISOString()
            };
            dbData.questions.push(newQuestion);
            writeDb(dbData);
            return newQuestion;
        },
        findMany: async ({ where }: { where: { serviceId: string } }) => {
            const data = readDb();
            return data.questions.filter(q => q.serviceId === where.serviceId);
        },
        update: async ({ where, data }: { where: { id: string }, data: Partial<Question> }) => {
            const dbData = readDb();
            const index = dbData.questions.findIndex(q => q.id === where.id);
            if (index === -1) return null;

            const updated = { ...dbData.questions[index], ...data };
            dbData.questions[index] = updated;
            writeDb(dbData);
            return updated;
        }
    }
};
