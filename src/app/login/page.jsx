'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { login } from '@/services/api';
import { Globe, User, Lock, Shield } from 'lucide-react';

// Default pre-filled credentials from the existing saved config
const DEFAULT_SERVER = 'http://playprime.top';
const DEFAULT_USER = '717770178';
const DEFAULT_PASS = '778822612';

export default function LoginPage() {
    const { setUserData, setSettings, setFavorites } = useAppContext();
    const [server, setServer] = useState(DEFAULT_SERVER);
    const [username, setUsername] = useState(DEFAULT_USER);
    const [password, setPassword] = useState(DEFAULT_PASS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Auto-login via saved IP config on mount
    useEffect(() => {
        const checkAutoLogin = async () => {
            try {
                const response = await fetch('/api/config');
                if (response.ok) {
                    const config = await response.json();
                    if (config.username && config.password && config.serverUrl) {
                        setServer(config.serverUrl);
                        setUsername(config.username);
                        setPassword(config.password);
                        const data = await login(config.serverUrl, config.username, config.password);
                        if (config.settings) setSettings(config.settings);
                        if (config.favorites) setFavorites(config.favorites);
                        setUserData(data);
                        return;
                    }
                }
            } catch {
                // Backend unavailable or no saved config — show form
            }
            setLoading(false);
        };
        checkAutoLogin();
    }, [setUserData, setSettings, setFavorites]);

    const handleLogin = async () => {
        if (loading) return;
        setLoading(true);
        setError('');
        try {
            const serverUrl = server.trim().replace(/\/$/, '');
            const safeUser = username.trim();
            const safePass = password.trim();
            const data = await login(serverUrl, safeUser, safePass);
            // Persist config to backend for future auto-login
            fetch('/api/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serverUrl, username: safeUser, password: safePass }),
            }).catch(() => { });
            setUserData(data);
        } catch (e) {
            setError(e.message);
            setLoading(false);
        }
    };

    return (
        <div className="login-screen-fixed">
            <div className="login-backdrop" />
            <div className="login-container-new">
                <div className="login-header">
                    <div className="logo-glow">xTream Play</div>
                    <p className="login-subtitle">Premium Streaming Experience</p>
                </div>
                <div className="login-form">
                    <div className="premium-input-group">
                        <label><Globe size={14} /> Servidor</label>
                        <div className="input-wrapper">
                            <input type="text" value={server} onChange={e => setServer(e.target.value)} placeholder="http://..." disabled={loading} />
                        </div>
                    </div>
                    <div className="premium-input-row" style={{ display: 'flex', gap: '15px' }}>
                        <div className="premium-input-group" style={{ flex: 1 }}>
                            <label><User size={14} /> Usuário</label>
                            <div className="input-wrapper">
                                <input type="text" value={username} onChange={e => setUsername(e.target.value)} disabled={loading} />
                            </div>
                        </div>
                        <div className="premium-input-group" style={{ flex: 1 }}>
                            <label><Lock size={14} /> Senha</label>
                            <div className="input-wrapper">
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
                            </div>
                        </div>
                    </div>
                    {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginBottom: '0.5rem', textAlign: 'center' }}>{error}</p>}
                    <button className="premium-login-btn" onClick={handleLogin} disabled={loading}>
                        {loading ? 'Sincronizando...' : 'Acessar Plataforma'}
                    </button>
                    <div className="login-footer">
                        <Shield size={12} /> Autenticação Segura via API Xtream
                    </div>
                </div>
            </div>
        </div>
    );
}
