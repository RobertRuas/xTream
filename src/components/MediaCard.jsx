'use client';

import { Star, Download } from 'lucide-react';
import { useAppContext } from '@/context/AppContext';
import { buildStreamURL } from '@/services/api';

export default function MediaCard({ item, type, onPlay }) {
    const { favorites, toggleFavorite, userData } = useAppContext();
    const idKey = item.stream_id ? 'stream_id' : 'series_id';
    const id = item[idKey];
    const title = item.name || item.title;
    const cover = item.stream_icon || item.cover || 'https://placehold.co/300x450?text=Sem+Capa';
    const isFav = favorites?.[type]?.some(f => f[idKey] === id);

    const handleDownload = (e) => {
        e.stopPropagation();
        const ext = type === 'vod' ? 'mp4' : 'mkv';
        const url = buildStreamURL(item, type, ext, userData);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title}.${ext}`;
        a.click();
    };

    return (
        <div className="card" tabIndex={0} onClick={() => onPlay(item, type)} onKeyDown={e => e.key === 'Enter' && onPlay(item, type)}>
            <img src={cover} alt={title} loading="lazy" />
            <div className="card-actions">
                {(type === 'vod' || type === 'series') && (
                    <button className="action-btn" title="Baixar" onClick={handleDownload}>
                        <Download size={18} />
                    </button>
                )}
                <button className={`action-btn${isFav ? ' active' : ''}`} title="Favorito" onClick={e => { e.stopPropagation(); toggleFavorite(item, type); }}>
                    <Star size={18} fill={isFav ? 'currentColor' : 'none'} />
                </button>
            </div>
            <div className="card-info">
                <div className="card-title">{title}</div>
            </div>
        </div>
    );
}
