'use client';

import { useAppContext } from '@/context/AppContext';
import { usePlay } from '@/components/ClientLayout';
import MediaCard from '@/components/MediaCard';
import { Star } from 'lucide-react';

export default function HomePage() {
    const { favorites, settings } = useAppContext();
    const handlePlay = usePlay();

    const sections = [
        { id: 'live', label: 'Canais TV', icon: '📺' },
        { id: 'vod', label: 'Filmes', icon: '🎬' },
        { id: 'series', label: 'Séries', icon: '🍿' },
    ];

    const totalFavs = Object.values(favorites).flat().length;

    return (
        <div className="content-area">
            <div className="section-header">
                <h2>Principal</h2>
            </div>
            {totalFavs === 0 ? (
                <div style={{ textAlign: 'center', padding: '5rem 2rem', background: 'var(--bg-card)', borderRadius: '20px' }}>
                    <Star size={60} color="var(--text-dim)" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
                    <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>Sua lista está vazia. Comece a favoritar seus conteúdos!</p>
                </div>
            ) : (
                sections.map(sec => {
                    const items = favorites[sec.id];
                    if (!items?.length || !settings?.vis?.[sec.id]) return null;
                    return (
                        <div key={sec.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '20px', marginBottom: '3rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <span>{sec.icon}</span> {sec.label}
                            </h3>
                            <div className="content-grid">
                                {items.map(item => (
                                    <MediaCard key={item.stream_id || item.series_id} item={item} type={sec.id} onPlay={handlePlay} />
                                ))}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
}
