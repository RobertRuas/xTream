'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AppProvider, useAppContext } from '@/context/AppContext';
import { buildStreamURL } from '@/services/api';
import { initSpatialNavigation } from '@/utils/spatialNavigation';
import Navbar from './Navbar';
import VideoPlayer from './VideoPlayer';

function InnerLayout({ children }) {
    const { userData } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();
    const [playingUrl, setPlayingUrl] = useState(null);

    // Initialize TV spatial navigation once on mount
    useEffect(() => {
        initSpatialNavigation();
    }, []);

    // Redirect to login if no user, or away from login if user exists
    useEffect(() => {
        if (!userData && pathname !== '/login') {
            router.replace('/login');
        } else if (userData && pathname === '/login') {
            router.replace('/');
        }
    }, [userData, pathname, router]);

    const handlePlay = (item, type) => {
        const ext = type === 'live' ? 'm3u8' : 'mp4';
        setPlayingUrl(buildStreamURL(item, type, ext, userData));
    };

    const isLoginPage = pathname === '/login';

    return (
        <>
            {!isLoginPage && <Navbar />}
            <main>
                {/* Pass handlePlay as a prop via context-friendly pattern */}
                {typeof children === 'function' ? children({ handlePlay }) : children}
            </main>
            <VideoPlayer url={playingUrl} onClose={() => setPlayingUrl(null)} />
        </>
    );
}

export default function ClientLayout({ children }) {
    return (
        <AppProvider>
            {/* We use a shared play state via a Provider-level hack */}
            <PlayProvider>
                {children}
            </PlayProvider>
        </AppProvider>
    );
}

// Simple context to share handlePlay across pages without prop drilling
import { createContext, useContext } from 'react';
const PlayContext = createContext(null);
export const usePlay = () => useContext(PlayContext);

function PlayProvider({ children }) {
    const [playingUrl, setPlayingUrl] = useState(null);
    const { userData } = useAppContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => { initSpatialNavigation(); }, []);

    useEffect(() => {
        if (!userData && pathname !== '/login') router.replace('/login');
        else if (userData && pathname === '/login') router.replace('/');
    }, [userData, pathname, router]);

    const handlePlay = (item, type) => {
        if (!userData) return;
        const ext = type === 'live' ? 'm3u8' : 'mp4';
        setPlayingUrl(buildStreamURL(item, type, ext, userData));
    };

    const isLoginPage = pathname === '/login';

    return (
        <PlayContext.Provider value={handlePlay}>
            {!isLoginPage && <Navbar />}
            {children}
            <VideoPlayer url={playingUrl} onClose={() => setPlayingUrl(null)} />
        </PlayContext.Provider>
    );
}
