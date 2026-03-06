'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';

export default function Navbar() {
    const pathname = usePathname();
    const { settings } = useAppContext();
    const [search, setSearch] = useState('');

    const links = [
        { href: '/', label: 'Principal', always: true },
        { href: '/live', label: 'TV ao Vivo', vis: 'live' },
        { href: '/movies', label: 'Filmes', vis: 'vod' },
        { href: '/series', label: 'Séries', vis: 'series' },
        { href: '/settings', label: 'Configurações', always: true },
    ];

    return (
        <nav className="navbar">
            <Link href="/" className="logo-text">xTream</Link>
            <div className="nav-links">
                {links.map(link => {
                    if (!link.always && !settings?.vis?.[link.vis]) return null;
                    const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                    return (
                        <Link key={link.href} href={link.href} className={`nav-link${isActive ? ' active' : ''}`}>
                            {link.label}
                        </Link>
                    );
                })}
            </div>
            <div style={{ marginLeft: 'auto' }}>
                <div id="search-container" style={{ display: 'flex', alignItems: 'center' }}>
                    <Search size={18} color="var(--text-dim)" style={{ marginRight: '8px' }} />
                    <input
                        type="text"
                        id="global-search"
                        placeholder="Pesquisar..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '0.9rem', width: '200px' }}
                    />
                </div>
            </div>
        </nav>
    );
}
