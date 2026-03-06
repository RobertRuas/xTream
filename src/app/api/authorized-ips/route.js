import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getClientIp } from '@/lib/ip';

// GET /api/authorized-ips
export async function GET(request) {
    try {
        const ipAddress = getClientIp(request);
        const config = await prisma.deviceConfig.findUnique({ where: { ipAddress } });
        if (!config) return NextResponse.json([]);
        return NextResponse.json(config.authorizedIps || []);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/authorized-ips - Add an authorized IP
export async function POST(request) {
    try {
        const ipAddress = getClientIp(request);
        const { newIp } = await request.json();
        if (!newIp) return NextResponse.json({ error: 'IP is required' }, { status: 400 });

        const config = await prisma.deviceConfig.update({
            where: { ipAddress },
            data: { authorizedIps: { push: newIp } },
        });
        return NextResponse.json({ message: 'IP authorized successfully', authorizedIps: config.authorizedIps });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
