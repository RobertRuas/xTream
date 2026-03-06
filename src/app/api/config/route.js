import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getClientIp } from '@/lib/ip';

// GET /api/config - Get device configuration by IP or Authorized IP
export async function GET(request) {
    try {
        const ipAddress = getClientIp(request);
        const config = await prisma.deviceConfig.findFirst({
            where: {
                OR: [
                    { ipAddress },
                    { authorizedIps: { has: ipAddress } }
                ]
            }
        });
        if (!config) {
            return NextResponse.json({ error: 'Config not found for this IP' }, { status: 404 });
        }
        return NextResponse.json(config);
    } catch (error) {
        console.error('Error fetching config:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/config - Upsert device configuration
export async function POST(request) {
    try {
        const ipAddress = getClientIp(request);
        const body = await request.json();
        const { serverUrl, username, password, settings, favorites } = body;

        const config = await prisma.deviceConfig.upsert({
            where: { ipAddress },
            update: {
                ...(serverUrl !== undefined && { serverUrl }),
                ...(username !== undefined && { username }),
                ...(password !== undefined && { password }),
                ...(settings !== undefined && { settings }),
                ...(favorites !== undefined && { favorites }),
            },
            create: {
                ipAddress,
                serverUrl,
                username,
                password,
                settings,
                favorites,
            },
        });
        return NextResponse.json(config);
    } catch (error) {
        console.error('Error saving config:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
