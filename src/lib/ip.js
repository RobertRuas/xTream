// Helper to get client IP in Next.js App Router
export function getClientIp(req) {
    let ip = req.headers.get('x-forwarded-for') || req.ip || '127.0.0.1';

    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }

    // Strip IPv6 notation prefix for IPv4 addresses
    if (ip && ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }

    return ip;
}
