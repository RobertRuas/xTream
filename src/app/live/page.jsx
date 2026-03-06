'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { usePlay } from '@/components/ClientLayout';
import { fetchXtreamData } from '@/services/api';
import MediaCard from '@/components/MediaCard';

export default function LivePage() {
    const { userData, settings } = useAppContext();
    const handlePlay = usePlay();
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userData) return;
        fetchXtreamData(userData, 'get_live_categories').then(setCategories).catch(console.error);
    }, [userData]);

    useEffect(() => {
        if (!userData) return;
        setLoading(true);
        fetchXtreamData(userData, 'get_live_streams', activeCategory ? `&category_id=${activeCategory}` : '')
            .then(data => setItems(data.slice(0, 100)))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [userData, activeCategory]);

    return (
        <div className="content-area">
            <div className="section-header">
                <h2>TV ao Vivo</h2>
                <select value={activeCategory} onChange={e => setActiveCategory(e.target.value)} style={{ background: 'var(--bg-card)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                    <option value="">Todas as Categorias</option>
                    {categories.map(c => settings?.cats?.[c.category_id] !== false && (
                        <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                    ))}
                </select>
            </div>
            {loading ? (
                <div className="content-grid">{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ aspectRatio: '2/3' }} />)}</div>
            ) : (
                <div className="content-grid">
                    {items.map(item => <MediaCard key={item.stream_id} item={item} type="live" onPlay={handlePlay} />)}
                </div>
            )}
        </div>
    );
}
