import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getClientIp } from '@/lib/ip';

// DELETE /api/authorize-ip/[ip]
export async function DELETE(request, { params }) {
    try {
        const ipAddress = getClientIp(request);
        const ipToRemove = decodeURIComponent(params.ip);
        const config = await prisma.deviceConfig.findUnique({ where: { ipAddress } });
        if (!config) return NextResponse.json({ error: 'Config not found' }, { status: 404 });

        const updatedIps = (config.authorizedIps || []).filter(ip => ip !== ipToRemove);
        const updatedConfig = await prisma.deviceConfig.update({
            where: { ipAddress },
            data: { authorizedIps: updatedIps },
        });
        return NextResponse.json({ message: 'IP removed successfully', authorizedIps: updatedConfig.authorizedIps });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
