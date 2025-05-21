import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { pix_code } = body;

    if (!pix_code) {
        return NextResponse.json({ error: 'Pix code obrigatório' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { pixCode: pix_code } });

    if (!user) {
        user = await prisma.user.create({
            data: { pixCode: pix_code, saldo: 20 },
        });
    }

    const token = jwt.sign({ id: user.id, pixCode: user.pixCode }, JWT_SECRET, {
        expiresIn: '7d',
    });

    return NextResponse.json({ token, saldo: user.saldo });
}
