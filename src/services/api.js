/**
 * Builds the final streaming URL for a media item.
 */
export const buildStreamURL = (item, type, ext, userData) => {
    if (item.stream_url) return item.stream_url;
    const id = item.stream_id || item.series_id;
    const info = userData.serverInfo;
    const protocol = info?.server_protocol || 'http';
    const host = info?.url || '';
    const port = (info?.port && ![80, 443].includes(Number(info.port))) ? `:${info.port}` : '';
    ext = ext || 'mp4';
    const path = type === 'live' ? 'live' : type === 'vod' ? 'movie' : 'series';
    return `${protocol}://${host}${port}/${path}/${userData.user}/${userData.pass}/${id}.${ext}`;
};

/**
 * Generic Xtream API data fetcher.
 */
export const fetchXtreamData = async (userData, action, params = '') => {
    const url = `${userData.server}/player_api.php?username=${userData.user}&password=${userData.pass}&action=${action}${params}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Falha na resposta da rede');
    return res.json();
};

/**
 * Performs login and returns user session data.
 */
export const login = async (server, username, password) => {
    const url = `${server}/player_api.php?username=${username}&password=${password}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.user_info && data.user_info.auth === 1) {
        return { server, user: username, pass: password, serverInfo: data.server_info };
    }
    throw new Error('Falha na autenticação. Verifique as credenciais.');
};
