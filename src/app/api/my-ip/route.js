import { NextResponse } from 'next/server';
import { getClientIp } from '@/lib/ip';

export async function GET(request) {
    const ip = getClientIp(request);
    return NextResponse.json({ ip });
}
