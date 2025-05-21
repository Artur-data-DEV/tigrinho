import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { amount } = await req.json();

  // Simula aleatoriamente vitória ou derrota
  const won = Math.random() < 0.5;

  // Pega token e saldo antigo do header
  const authHeader = req.headers.get("authorization") || "";
  const validToken = authHeader.startsWith("Bearer ");

  if (!validToken) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  // Simula saldo (em app real, você pegaria do banco)
  let saldo = 100;

  saldo -= amount;
  if (won) saldo += amount * 2;

  return NextResponse.json({
    won,
    saldo: parseFloat(saldo.toFixed(2)),
  });
}
