'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Share2, Instagram, Phone, Heart, Star, MessageCircle, Lock, Unlock, Send, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import styles from './page.module.css';

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
    const { user } = useAuth();
    const router = useRouter();
    const [service, setService] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);

    // Contract Status
    // 'none' | 'pending' | 'accepted' | 'completed' | 'rejected'
    const [contractStatus, setContractStatus] = useState<string>('none');

    // Reviews
    const [reviews, setReviews] = useState<any[]>([]);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Questions
    const [questions, setQuestions] = useState<any[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [replyText, setReplyText] = useState<{ [key: string]: string }>({}); // map questionId -> text
    const [submittingQuestion, setSubmittingQuestion] = useState(false);

    // Related Services
    const [relatedServices, setRelatedServices] = useState<any[]>([]);

    useEffect(() => {
        const fetchService = async () => {
            try {
                // 1. Fetch Service Details
                const res = await fetch(`/api/services/${params.id}`);
                if (!res.ok) throw new Error('Service not found');
                const data = await res.json();
                setService(data);

                // 2. Fetch Reviews
                fetchReviews(data.id);

                // 3. Fetch Questions
                fetchQuestions(data.id);

                // 4. Fetch Related Services (Client-side filter for prototype)
                fetch('/api/services')
                    .then(r => r.json())
                    .then(all => {
                        const related = all.filter((s: any) => s.providerId === data.providerId && s.id !== data.id).slice(0, 3);
                        setRelatedServices(related);
                    });

                // 5. Check Contract Status (if logged in)
                if (user) {
                    // Check contract
                    const contractRes = await fetch(`/api/contracts?clientId=${user.id}&serviceId=${params.id}`);
                    if (contractRes.ok) {
                        const contracts = await contractRes.json();
                        // Get the most relevant contract (e.g. latest)
                        if (contracts.length > 0) {
                            // prioritizing accepted/active over others? or just taking the last one
                            const active = contracts.find((c: any) => c.status === 'accepted') ||
                                contracts.find((c: any) => c.status === 'pending') ||
                                contracts[0];
                            setContractStatus(active.status);
                        }
                    }

                    // Check favorite
                    if (user && user.favorites?.includes(params.id)) {
                        setIsFavorite(true);
                    }
                }

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [params.id, user]);

    const fetchReviews = async (serviceId: string) => {
        try {
            const res = await fetch(`/api/reviews?serviceId=${serviceId}`);
            if (res.ok) setReviews(await res.json());
        } catch (e) { console.error(e); }
    };

    const fetchQuestions = async (serviceId: string) => {
        try {
            const res = await fetch(`/api/questions?serviceId=${serviceId}`);
            if (res.ok) setQuestions(await res.json());
        } catch (e) { console.error(e); }
    };

    const handleToggleFavorite = async () => {
        if (!user) return router.push('/login');
        const nextState = !isFavorite;
        setIsFavorite(nextState);
        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, serviceId: service.id })
            });
            if (res.ok) {
                // Trigger header update
                window.dispatchEvent(new CustomEvent('favorites-updated'));
            } else {
                // Revert on error
                setIsFavorite(!nextState);
            }
        } catch (e) {
            console.error(e);
            setIsFavorite(!nextState);
        }
    };

    const handleHire = async () => {
        if (!user) return router.push('/login');
        if (!confirm('¿Estás seguro que deseas solicitar este servicio? El profesional recibirá una notificación.')) return;

        try {
            const res = await fetch('/api/contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: service.id,
                    clientId: user.id,
                    providerId: service.providerId
                })
            });

            if (res.ok) {
                alert('¡Solicitud enviada con éxito!');
                setContractStatus('pending');
            } else {
                alert('Error al enviar solicitud');
            }
        } catch (e) {
            alert('Error de conexión');
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: service.id,
                    authorId: user?.id,
                    rating: newRating,
                    comment: newComment
                })
            });

            if (res.ok) {
                const newReview = await res.json();
                setReviews([...reviews, newReview]);
                setNewComment('');
                alert('¡Gracias por tu calificación!');
            } else {
                alert('Error: ' + await res.text());
            }
        } catch (e) { console.error(e); }
        finally { setSubmittingReview(false); }
    };

    const handleSubmitQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return router.push('/login');
        setSubmittingQuestion(true);
        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: service.id,
                    userId: user.id,
                    question: newQuestion
                })
            });
            if (res.ok) {
                const q = await res.json();
                // We need to fetch user name or just mock it for optimistic UI
                setQuestions([...questions, { ...q, userName: user.name }]);
                setNewQuestion('');
            }
        } catch (e) { alert('Error al enviar pregunta'); }
        finally { setSubmittingQuestion(false); }
    };

    const handleAnswerQuestion = async (qId: string) => {
        const answer = replyText[qId];
        if (!answer) return;
        try {
            const res = await fetch('/api/questions', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: qId, answer })
            });

            if (res.ok) {
                // Update local list
                const updated = questions.map(q => q.id === qId ? { ...q, answer } : q);
                setQuestions(updated);
                setReplyText({ ...replyText, [qId]: '' });
            }
        } catch (e) { alert('Error al responder'); }
    };

    if (loading) return <div className={styles.container}>Cargando información...</div>;
    if (!service) return <div className={styles.container}>Servicio no encontrado</div>;

    const isOwner = user && user.id === service.providerId;

    return (
        <div className={styles.container}>
            <Link href="/" className={styles.backLink}>
                <ArrowLeft size={16} /> Volver
            </Link>

            <div className={styles.card}>
                {/* Hero / Image */}
                <div className={styles.imagePlaceholder} style={{ position: 'relative' }}>
                    <button
                        onClick={handleToggleFavorite}
                        className={styles.favoriteButton}
                        title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
                    >
                        <Heart size={28} fill={isFavorite ? "red" : "none"} color={isFavorite ? "red" : "white"} />
                    </button>

                    {service.image ? (
                        <img
                            src={service.image}
                            alt={service.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (<span>📷</span>)}
                </div>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <div className="flex justify-between items-start">
                            <div>
                                <span className={styles.categoryBadge}>{service.category}</span>
                                <h1 className={styles.title}>{service.title}</h1>
                            </div>
                            <div className={styles.ratingBadge}>
                                <Star fill="#fbbf24" color="#fbbf24" size={20} />
                                <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{
                                    reviews.length > 0
                                        ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1)
                                        : 'N/A'
                                }</span>
                                <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>({reviews.length})</span>
                            </div>
                        </div>

                        <div className={styles.location}>
                            <MapPin size={16} />
                            <span>{service.location}</span>
                        </div>
                    </div>

                    <div className={styles.mainGrid}>
                        <div className={styles.leftColumn}>
                            <div className={styles.description}>
                                <h3>Acerca del servicio</h3>
                                <p>{service.description}</p>
                            </div>

                            {/* Q&A Section */}
                            <div className={styles.reviewsSection} style={{ borderTop: '1px solid #e5e7eb', marginTop: '2rem', paddingTop: '2rem' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <MessageCircle size={20} /> Preguntas y Respuestas
                                </h3>

                                {/* Question Form */}
                                {!isOwner && (
                                    <form onSubmit={handleSubmitQuestion} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            className={styles.input}
                                            style={{ flex: 1 }}
                                            placeholder="Pregúntale algo al profesional..."
                                            value={newQuestion}
                                            onChange={e => setNewQuestion(e.target.value)}
                                            required
                                        />
                                        <Button type="submit" disabled={submittingQuestion}>
                                            <Send size={16} />
                                        </Button>
                                    </form>
                                )}

                                <div className={styles.reviewList}>
                                    {questions.length === 0 ? (
                                        <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Nadie ha preguntado nada aún. ¡Sé el primero!</p>
                                    ) : (
                                        questions.map((q) => (
                                            <div key={q.id} style={{ marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                    <MessageCircle size={14} color="#6b7280" />
                                                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{q.userName || 'Usuario'}</span>
                                                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{new Date(q.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p style={{ margin: '0 0 0.5rem 0', color: '#374151' }}>{q.question}</p>

                                                {/* Answer */}
                                                {q.answer ? (
                                                    <div style={{ marginLeft: '1rem', padding: '0.5rem', background: '#f9fafb', borderLeft: '3px solid #10b981', borderRadius: '4px' }}>
                                                        <span style={{ display: 'block', fontSize: '0.8rem', color: '#047857', marginBottom: '0.25rem' }}>{service.provider?.name || 'Profesional'}:</span>
                                                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563' }}>{q.answer}</p>
                                                    </div>
                                                ) : (
                                                    // Owner Answer Input
                                                    isOwner && (
                                                        <div style={{ marginLeft: '1rem', display: 'flex', gap: '0.5rem' }}>
                                                            <input
                                                                placeholder="Escribe tu respuesta..."
                                                                style={{
                                                                    flex: 1, padding: '0.4rem', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '0.9rem'
                                                                }}
                                                                value={replyText[q.id] || ''}
                                                                onChange={e => setReplyText({ ...replyText, [q.id]: e.target.value })}
                                                            />
                                                            <Button size="sm" onClick={() => handleAnswerQuestion(q.id)}>Responder</Button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className={styles.reviewsSection}>
                                <h3>Opiniones de clientes</h3>
                                {reviews.length === 0 ? (
                                    <p style={{ fontStyle: 'italic', color: '#6b7280' }}>Aún no hay opiniones.</p>
                                ) : (
                                    <div className={styles.reviewList}>
                                        {reviews.map((r: any) => (
                                            <div key={r.id} className={styles.reviewItem}>
                                                <div className={styles.reviewHeader}>
                                                    <div style={{ display: 'flex', gap: '2px' }}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={14} fill={i < r.rating ? "#fbbf24" : "#e5e7eb"} color="none" />
                                                        ))}
                                                    </div>
                                                    <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                                                        {new Date(r.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className={styles.reviewComment}>{r.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* Review Form (Hidden if not contracted logic could go here, for now logic is in API) */}
                                {user && !isOwner && contractStatus === 'accepted' && ( // Only allow review if accepted
                                    <div className={styles.reviewForm}>
                                        <h4>Calificar servicio</h4>
                                        <form onSubmit={handleSubmitReview}>
                                            <div style={{ marginBottom: '1rem' }}>
                                                <label>Puntuación: </label>
                                                <select
                                                    value={newRating}
                                                    onChange={e => setNewRating(Number(e.target.value))}
                                                    style={{ marginLeft: '0.5rem', padding: '0.25rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                                                >
                                                    <option value="5">5 - Excelente</option>
                                                    <option value="4">4 - Muy bueno</option>
                                                    <option value="3">3 - Bueno</option>
                                                    <option value="2">2 - Regular</option>
                                                    <option value="1">1 - Malo</option>
                                                </select>
                                            </div>
                                            <textarea className={styles.textarea} placeholder="Escribe tu opinión..." value={newComment} onChange={e => setNewComment(e.target.value)} required></textarea>
                                            <Button type="submit" size="sm" disabled={submittingReview} style={{ marginTop: '0.5rem' }}>Enviar Reseña</Button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.sidebar}>
                            <div className={styles.priceBlock}>
                                <div className={styles.priceLabel}>Precio estimado</div>
                                <div className={styles.priceValue}>${service.price}</div>
                            </div>

                            {/* Hiring Action */}
                            {!isOwner && (
                                <div style={{ marginBottom: '2rem' }}>
                                    <Button
                                        fullWidth
                                        size="lg"
                                        onClick={handleHire}
                                        disabled={contractStatus !== 'none' && contractStatus !== 'rejected'}
                                        style={{
                                            backgroundColor: (contractStatus !== 'none' && contractStatus !== 'rejected') ? '#10b981' : undefined,
                                            border: (contractStatus !== 'none' && contractStatus !== 'rejected') ? 'none' : undefined
                                        }}
                                    >
                                        {contractStatus === 'pending' ? 'Solicitud Enviada' :
                                            (contractStatus === 'accepted' ? '¡Servicio Contratado!' :
                                                (contractStatus === 'completed' ? 'Trabajo Finalizado' : 'Contratar Servicio'))}
                                    </Button>
                                </div>
                            )}

                            <div className={styles.providerSection}>
                                <div className={styles.providerTitle}>Ofrecido por</div>
                                <div className={styles.providerInfo}>
                                    <div className={styles.avatar}>
                                        {service.provider?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className={styles.providerName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {service.provider?.name || 'Usuario'}
                                        {isOwner && (
                                            <Link href="/dashboard" style={{ position: 'relative', display: 'flex' }}>
                                                <Bell size={16} color="#6b7280" />
                                                {/* Local notifications state isn't available here, but we can just show the icon or fetch it. 
                                                    Actually, it's better to show it if we are already fetching things or use a global state.
                                                    Since we don't have global notifications here, I'll just show the icon as a link.
                                                */}
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                {/* Restricted Contact Logic */}
                                <div className={styles.contactButtons}>
                                    {isOwner || contractStatus === 'accepted' || contractStatus === 'completed' ? (
                                        <>
                                            {/* Success visual if just accepted */}
                                            {contractStatus === 'accepted' && (
                                                <div style={{
                                                    background: '#ecfdf5', color: '#047857', padding: '0.5rem',
                                                    borderRadius: '6px', fontSize: '0.8rem', textAlign: 'center', marginBottom: '0.5rem',
                                                    border: '1px solid #a7f3d0'
                                                }}>
                                                    <Unlock size={14} style={{ display: 'inline', marginRight: '4px' }} />
                                                    Datos de contacto desbloqueados
                                                </div>
                                            )}

                                            {service.socialWhatsapp && (
                                                <a href={`https://wa.me/${service.socialWhatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ width: '100%' }}>
                                                    <Button fullWidth className="bg-green-600 hover:bg-green-700">
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Phone size={18} /> WhatsApp
                                                        </div>
                                                    </Button>
                                                </a>
                                            )}

                                            {service.socialInstagram && (
                                                <a href={`https://instagram.com/${service.socialInstagram}`} target="_blank" rel="noopener noreferrer" style={{ width: '100%' }}>
                                                    <Button variant="outline" fullWidth>
                                                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Instagram size={18} /> Instagram
                                                        </div>
                                                    </Button>
                                                </a>
                                            )}
                                        </>
                                    ) : (
                                        // Locked State
                                        <div style={{ textAlign: 'center', padding: '1rem', background: '#f3f4f6', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                                            <Lock size={20} style={{ color: '#9ca3af', marginBottom: '0.5rem' }} />
                                            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>
                                                Contrata el servicio para ver los datos de contacto.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Related Services */}
                    {relatedServices.length > 0 && (
                        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Más de este profesional</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                                {relatedServices.map(s => (
                                    <Link key={s.id} href={`/services/${s.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div className={styles.card} style={{ padding: '0', overflow: 'hidden', height: '100%' }}>
                                            <div style={{ height: '150px', background: '#e5e7eb' }}>
                                                {s.image && <img src={s.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                            </div>
                                            <div style={{ padding: '1rem' }}>
                                                <h4 style={{ margin: '0 0 0.5rem 0' }}>{s.title}</h4>
                                                <span style={{ fontWeight: 'bold' }}>${s.price}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
