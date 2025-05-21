import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

export async function POST(request: NextRequest) {
    try {
        // Verifica e extrai o token do header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Token não fornecido ou malformado' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        // const token = jwt.sign({ id: 1 }, 'supersecret', { expiresIn: '1h' });
        let decoded;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch {
            return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 401 });
        }

        const userId = typeof decoded === 'object' && 'id' in decoded ? decoded.id : null;
        if (!userId) {
            return NextResponse.json({ error: 'Usuário inválido no token' }, { status: 401 });
        }

        // Extrai dados da requisição
        const { amount } = await request.json();

        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: 'Valor da aposta inválido' }, { status: 400 });
        }

        // Busca usuário
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        if (user.saldo < amount) {
            return NextResponse.json({ error: 'Saldo insuficiente' }, { status: 400 });
        }

        // Simula resultado (50% de chance de vitória)
        const won = Math.random() < 0.5;
        const result = won ? 'win' : 'lose';

        const novoSaldo = won
            ? user.saldo + amount // ganhou o dobro
            : user.saldo - amount;

        // Atualiza saldo e registra o jogo
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id: userId },
                data: { saldo: novoSaldo },
            });

            await tx.game.create({
                data: {
                    userId,
                    amount,
                    result,
                },
            });
        });

        return NextResponse.json({
            won,
            saldo: parseFloat(novoSaldo.toFixed(2)),
            message: `Você ${result === 'win' ? 'ganhou' : 'perdeu'}!`,
        });

    } catch (error) {
        console.error('Erro ao processar jogada:', error);
        return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
    }
}
