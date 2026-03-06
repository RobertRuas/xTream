'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [userData, setUserDataState] = useState(null);
    const [favorites, setFavoritesState] = useState({ live: [], vod: [], series: [] });
    const [settings, setSettings] = useState({
        vis: { live: true, vod: true, series: true },
        cats: {},
        viewMode: 'cards',
        bufferSeconds: 120,
        showPlayerStats: false,
    });

    // Load from localStorage on mount
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('xtream_user'));
        const favs = JSON.parse(localStorage.getItem('xtream_favs'));
        const sett = JSON.parse(localStorage.getItem('xtream_settings'));
        if (user) setUserDataState(user);
        if (favs) setFavoritesState(favs);
        if (sett) setSettings(sett);
    }, []);

    const setUserData = (data) => {
        setUserDataState(data);
        localStorage.setItem('xtream_user', JSON.stringify(data));
        if (data?.user && data?.pass && data?.server) {
            fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serverUrl: data.server, username: data.user, password: data.pass }),
            }).catch(console.error);
        }
    };

    const setFavorites = (favs) => {
        setFavoritesState(favs);
        localStorage.setItem('xtream_favs', JSON.stringify(favs));
    };

    useEffect(() => {
        localStorage.setItem('xtream_settings', JSON.stringify(settings));
    }, [settings]);

    const toggleFavorite = (item, type) => {
        const idKey = item.stream_id ? 'stream_id' : 'series_id';
        const id = item[idKey];
        const list = [...(favorites[type] || [])];
        const idx = list.findIndex(f => f[idKey] === id);
        if (idx > -1) list.splice(idx, 1);
        else list.push(item);
        setFavorites({ ...favorites, [type]: list });
    };

    const toggleVisibility = (type, val) => setSettings(p => ({ ...p, vis: { ...p.vis, [type]: val } }));
    const setCategoryVisibility = (catId, val) => setSettings(p => ({ ...p, cats: { ...p.cats, [catId]: val } }));
    const setViewMode = (mode) => setSettings(p => ({ ...p, viewMode: mode }));
    const setBufferSeconds = (s) => setSettings(p => ({ ...p, bufferSeconds: s }));
    const togglePlayerStats = (val) => setSettings(p => ({ ...p, showPlayerStats: val }));

    return (
        <AppContext.Provider value={{
            userData, setUserData,
            favorites, toggleFavorite, setFavorites,
            settings, setSettings,
            toggleVisibility, setCategoryVisibility, setViewMode, setBufferSeconds, togglePlayerStats,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);
