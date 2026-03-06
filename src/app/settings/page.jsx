'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import { fetchXtreamData } from '@/services/api';
import { Settings as SettingsIcon, Eye, Layers, CheckCircle2, User, PlayCircle, Monitor, Network, LogOut } from 'lucide-react';

export default function SettingsPage() {
    const { settings, toggleVisibility, setCategoryVisibility, setViewMode, setBufferSeconds, togglePlayerStats, userData, setUserData } = useAppContext();
    const [activeType, setActiveType] = useState('live');
    const [categories, setCategories] = useState([]);
    const [savedNotice, setSavedNotice] = useState(false);
    const [accountForm, setAccountForm] = useState({ server: userData?.server || '', user: userData?.user || '', pass: userData?.pass || '' });
    const [authorizedIps, setAuthorizedIps] = useState([]);
    const [newIp, setNewIp] = useState('');

    useEffect(() => {
        if (!userData) return;
        const action = activeType === 'live' ? 'get_live_categories' : activeType === 'vod' ? 'get_vod_categories' : 'get_series_categories';
        fetchXtreamData(userData, action).then(setCategories).catch(console.error);
    }, [activeType, userData]);

    useEffect(() => {
        if (!userData) return;
        fetch('/api/authorized-ips').then(r => r.ok ? r.json() : []).then(setAuthorizedIps).catch(console.error);
    }, [userData]);

    const triggerSave = () => { setSavedNotice(true); setTimeout(() => setSavedNotice(false), 2000); };

    const handleUpdateAccount = (e) => {
        e.preventDefault();
        setUserData({ ...userData, server: accountForm.server, user: accountForm.user, pass: accountForm.pass });
        triggerSave();
    };

    const handleAddIp = async (e) => {
        e.preventDefault();
        const ip = newIp.trim();
        if (!ip) return;
        const res = await fetch('/api/authorized-ips', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ newIp: ip }) });
        if (res.ok) { const d = await res.json(); setAuthorizedIps(d.authorizedIps || []); setNewIp(''); triggerSave(); }
    };

    const handleRemoveIp = async (ip) => {
        const res = await fetch(`/api/authorize-ip/${encodeURIComponent(ip)}`, { method: 'DELETE' });
        if (res.ok) { const d = await res.json(); setAuthorizedIps(d.authorizedIps || []); triggerSave(); }
    };

    return (
        <div className="content-area">
            <div className="settings-modern-container">
                <div className="section-header">
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><SettingsIcon size={28} className="accent-color" /> Configurações</h2>
                </div>
                <div className="settings-grid">
                    {/* Conta */}
                    <div className="settings-card-dashed full-width" style={{ borderColor: 'var(--accent)' }}>
                        <h4 className="card-header"><User size={18} /> Detalhes da Conta</h4>
                        <form onSubmit={handleUpdateAccount} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto auto', gap: '15px', alignItems: 'end' }}>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '5px', display: 'block' }}>Servidor URL</label>
                                <input type="url" value={accountForm.server} onChange={e => setAccountForm({ ...accountForm, server: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '5px', display: 'block' }}>Usuário</label>
                                <input type="text" value={accountForm.user} onChange={e => setAccountForm({ ...accountForm, user: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '5px', display: 'block' }}>Senha</label>
                                <input type="password" value={accountForm.pass} onChange={e => setAccountForm({ ...accountForm, pass: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }} />
                            </div>
                            <button type="submit" className="action-btn" style={{ width: 'auto', padding: '10px 20px', borderRadius: '8px', background: 'var(--accent)', borderColor: 'var(--accent)' }}>Atualizar</button>
                            <button type="button" className="action-btn-danger" onClick={() => setUserData(null)} style={{ width: 'auto', padding: '10px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <LogOut size={16} /> Sair
                            </button>
                        </form>
                    </div>

                    {/* Modo de Visualização */}
                    <div className="settings-card-dashed">
                        <h4 className="card-header"><Monitor size={18} /> Modo de Visualização</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[{ id: 'cards', label: 'Cards (Grade)' }, { id: 'list', label: 'Lista Horizontal' }].map(mode => (
                                <label key={mode.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', background: settings.viewMode === mode.id ? 'rgba(0,122,255,0.1)' : 'rgba(0,0,0,0.1)', borderRadius: '8px', border: `1px solid ${settings.viewMode === mode.id ? 'var(--accent)' : 'transparent'}` }}>
                                    <input type="radio" name="viewMode" value={mode.id} checked={settings.viewMode === mode.id} onChange={e => { setViewMode(e.target.value); triggerSave(); }} style={{ accentColor: 'var(--accent)' }} />
                                    <span style={{ fontSize: '0.9rem' }}>{mode.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Player */}
                    <div className="settings-card-dashed">
                        <h4 className="card-header"><PlayCircle size={18} /> Reprodução</h4>
                        <div style={{ marginBottom: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '0.9rem' }}>Buffer (segundos)</span>
                                <span className="accent-color" style={{ fontWeight: 'bold' }}>{settings.bufferSeconds}s</span>
                            </div>
                            <input type="range" min="30" max="600" step="10" value={settings.bufferSeconds || 120} onChange={e => setBufferSeconds(Number(e.target.value))} onMouseUp={triggerSave} onTouchEnd={triggerSave} style={{ width: '100%', accentColor: 'var(--accent)' }} />
                        </div>
                        <div className="settings-item-row">
                            <div>
                                <p className="item-label">Estatísticas no Player</p>
                                <p className="item-desc">Mostrar informações técnicas durante reprodução</p>
                            </div>
                            <label className="switch">
                                <input type="checkbox" checked={settings.showPlayerStats || false} onChange={e => { togglePlayerStats(e.target.checked); triggerSave(); }} />
                                <span className="slider" />
                            </label>
                        </div>
                    </div>

                    {/* IPs Autorizados */}
                    <div className="settings-card-dashed full-width" style={{ borderColor: 'rgba(255,100,100,0.5)' }}>
                        <h4 className="card-header" style={{ color: '#ff7777' }}><Network size={18} /> IPs Autorizados (Auto-Login)</h4>
                        <p className="item-desc" style={{ marginBottom: '1.5rem', color: '#ffaaaa' }}>Autorize IPs externos para pular a tela de login automaticamente.</p>
                        <form onSubmit={handleAddIp} style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                            <input type="text" placeholder="Ex: 177.58.X.X" value={newIp} onChange={e => setNewIp(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)', color: 'white' }} />
                            <button type="submit" className="action-btn" style={{ width: 'auto', padding: '12px 25px', borderRadius: '8px', background: 'rgba(255,100,100,0.2)', border: '1px solid #ff7777', color: '#ff7777', fontWeight: 'bold' }}>Adicionar IP</button>
                        </form>
                        {authorizedIps.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px' }}>
                                {authorizedIps.map(ip => (
                                    <div key={ip} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontFamily: 'monospace', fontSize: '1.1rem' }}>{ip}</span>
                                        <button type="button" onClick={() => handleRemoveIp(ip)} className="action-btn-danger" style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem' }}>Remover</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(0,0,0,0.1)', borderRadius: '12px', color: 'var(--text-dim)' }}>Nenhum IP autorizado ainda.</div>
                        )}
                    </div>

                    {/* Módulos */}
                    <div className="settings-card-dashed full-width">
                        <h4 className="card-header"><Eye size={18} /> Módulos Principais</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            {[{ id: 'live', label: 'TV ao Vivo' }, { id: 'vod', label: 'Filmes (VOD)' }, { id: 'series', label: 'Séries' }].map(mod => (
                                <div key={mod.id} className="settings-item-row" style={{ background: 'rgba(0,0,0,0.2)', padding: '15px', borderRadius: '12px', border: 'none' }}>
                                    <p className="item-label">{mod.label}</p>
                                    <label className="switch">
                                        <input type="checkbox" checked={settings.vis[mod.id]} onChange={e => { toggleVisibility(mod.id, e.target.checked); triggerSave(); }} />
                                        <span className="slider" />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Subcategorias */}
                    <div className="settings-card-dashed full-width">
                        <h4 className="card-header"><Layers size={18} /> Filtragem de Subcategorias</h4>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
                            {[{ id: 'live', label: 'TV' }, { id: 'vod', label: 'Filmes' }, { id: 'series', label: 'Séries' }].map(t => (
                                <button key={t.id} onClick={() => setActiveType(t.id)} className={`action-btn${activeType === t.id ? ' active' : ''}`} style={{ width: 'auto', padding: '10px 20px', borderRadius: '12px' }}>
                                    {t.label}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px', maxHeight: '300px', overflowY: 'auto' }}>
                            {categories.map(cat => (
                                <div key={cat.category_id} className="settings-item-row" style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '10px 15px', borderRadius: '10px', background: 'rgba(0,0,0,0.2)' }}>
                                    <p className="item-label" style={{ fontSize: '0.85rem' }}>{cat.category_name}</p>
                                    <label className="switch">
                                        <input type="checkbox" checked={settings.cats[cat.category_id] !== false} onChange={e => { setCategoryVisibility(cat.category_id, e.target.checked); triggerSave(); }} />
                                        <span className="slider" />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {savedNotice && (
                <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: 'var(--accent)', color: 'white', padding: '12px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 5000 }}>
                    <CheckCircle2 size={18} /> Preferências atualizadas!
                </div>
            )}
        </div>
    );
}
