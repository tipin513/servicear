import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import fs from 'fs'
import path from 'path'

// Driver adapter setup for Prisma 7
const connectionString = process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'db.json')

async function main() {
    if (!fs.existsSync(DB_PATH)) {
        console.log('No db.json found. Skipping migration.')
        return
    }

    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))

    console.log('Starting migration...')

    // Helper to check if a user exists
    const userExists = async (id: string) => {
        const user = await prisma.user.findUnique({ where: { id } })
        return !!user
    }

    // Helper to check if a service exists
    const serviceExists = async (id: string) => {
        const service = await prisma.service.findUnique({ where: { id } })
        return !!service
    }

    // 1. Migrate Users
    for (const u of data.users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                id: u.id,
                name: u.name,
                email: u.email,
                password: u.password,
                role: u.role,
                phone: u.phone,
                location: u.location,
                about: u.about,
                avatar: u.avatar,
                category: u.category,
                favorites: u.favorites || []
            }
        })
    }
    console.log('Users migrated.')

    // 2. Migrate Services
    for (const s of data.services) {
        // Only migrate if provider exists
        if (await userExists(s.providerId)) {
            await prisma.service.upsert({
                where: { id: s.id },
                update: {},
                create: {
                    id: s.id,
                    title: s.title,
                    description: s.description,
                    category: s.category,
                    location: s.location,
                    price: s.price,
                    image: s.image,
                    socialInstagram: s.socialInstagram,
                    socialWhatsapp: s.socialWhatsapp,
                    providerId: s.providerId,
                    createdAt: new Date(s.createdAt)
                }
            })
        } else {
            console.warn(`Skipping service ${s.id}: Provider ${s.providerId} not found.`)
        }
    }
    console.log('Services migrated.')

    // 3. Migrate Contracts
    for (const c of data.contracts) {
        if (await serviceExists(c.serviceId) && await userExists(c.clientId) && await userExists(c.providerId)) {
            await prisma.contract.upsert({
                where: { id: c.id },
                update: {},
                create: {
                    id: c.id,
                    serviceId: c.serviceId,
                    clientId: c.clientId,
                    providerId: c.providerId,
                    status: c.status,
                    createdAt: new Date(c.createdAt)
                }
            })
        } else {
            console.warn(`Skipping contract ${c.id}: One or more related entities (service/client/provider) not found.`)
        }
    }
    console.log('Contracts migrated.')

    // 4. Migrate Notifications
    for (const n of data.notifications) {
        if (await userExists(n.userId)) {
            await prisma.notification.upsert({
                where: { id: n.id },
                update: {},
                create: {
                    id: n.id,
                    userId: n.userId,
                    message: n.message,
                    read: n.read,
                    type: n.type,
                    link: n.link,
                    createdAt: new Date(n.createdAt)
                }
            })
        } else {
            console.warn(`Skipping notification ${n.id}: User ${n.userId} not found.`)
        }
    }
    console.log('Notifications migrated.')

    // 5. Migrate Reviews
    for (const r of data.reviews) {
        if (await serviceExists(r.serviceId) && await userExists(r.authorId)) {
            await prisma.review.upsert({
                where: { id: r.id },
                update: {},
                create: {
                    id: r.id,
                    serviceId: r.serviceId,
                    authorId: r.authorId,
                    rating: r.rating,
                    comment: r.comment,
                    createdAt: new Date(r.createdAt)
                }
            })
        } else {
            console.warn(`Skipping review ${r.id}: Related service or author not found.`)
        }
    }
    console.log('Reviews migrated.')

    // 6. Migrate Questions
    for (const q of data.questions) {
        if (await serviceExists(q.serviceId) && await userExists(q.userId)) {
            await prisma.question.upsert({
                where: { id: q.id },
                update: {},
                create: {
                    id: q.id,
                    serviceId: q.serviceId,
                    userId: q.userId,
                    question: q.question,
                    answer: q.answer,
                    createdAt: new Date(q.createdAt)
                }
            })
        } else {
            console.warn(`Skipping question ${q.id}: Related service or user not found.`)
        }
    }
    console.log('Questions migrated.')

    console.log('Migration completed successfully! 🚀')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
