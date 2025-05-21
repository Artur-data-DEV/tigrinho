// app/api/login/route.ts (App Router)
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma"; // ajuste para seu caminho
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function POST(req: Request) {
    const { pixCode } = await req.json();

    if (!pixCode) {
        return NextResponse.json({ error: "Código Pix obrigatório" }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { pixCode } });

    if (!user) {
        user = await prisma.user.create({ data: { pixCode, saldo: 100 } });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1h" });

    return NextResponse.json({
        token,
        saldo: user.saldo,
    });
}
