"use client";

import { useEffect, useState } from "react";

type Jogada = {
  id: number;
  won: boolean;
  amount: number;
  timestamp: string;
};

export default function Home() {
  const [pixCode, setPixCode] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [saldo, setSaldo] = useState<number>(100);
  const [amountToBet, setAmountToBet] = useState<number>(10);
  const [mensagem, setMensagem] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<Jogada[]>([]);

  // Só no cliente, lê localStorage e atualiza estados
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    }
    const savedSaldo = localStorage.getItem("saldo");
    if (savedSaldo) {
      setSaldo(Number(savedSaldo));
    }
  }, []);

  useEffect(() => {
    if (token !== null) localStorage.setItem("token", token);
    localStorage.setItem("saldo", saldo.toString());
  }, [token, saldo]);

  // trecho dentro da função jogar()
  const jogar = async () => {
    if (!token) {
      setMensagem("Faça login primeiro.");
      return;
    }

    if (amountToBet <= 0) {
      setMensagem("Valor inválido.");
      return;
    }
    if (amountToBet > saldo) {
      setMensagem("Saldo insuficiente.");
      return;
    }

    setLoading(true);
    setMensagem("Jogando...");

    const res = await fetch("/api/play", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: amountToBet }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setMensagem(data.error || "Erro ao jogar.");
      return;
    }

    const novoSaldo = data.won ? saldo + amountToBet : saldo - amountToBet;

    setSaldo(novoSaldo);
    localStorage.setItem("saldo", novoSaldo.toString());

    setMensagem(data.won ? "Você GANHOU!" : "Você PERDEU!");

    setHistory((h) => [
      {
        id: h.length + 1,
        won: data.won,
        amount: amountToBet,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...h,
    ]);
  };

  const login = async () => {
    if (!pixCode.trim()) {
      setMensagem("Informe um código Pix.");
      return;
    }

    setMensagem("Fazendo login...");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pixCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensagem(data.error || "Erro ao fazer login.");
        return;
      }

      setToken(data.token);
      setSaldo(data.saldo);
      setMensagem("Login feito com sucesso!");
    } catch {
      setMensagem("Erro na requisição de login.");
    }
  };

  const logout = () => {
    setToken(null);
    setSaldo(100);
    setHistory([]);
    setMensagem("Saiu da conta.");
  };

  return (
    <main className="max-w-md mx-auto p-6 text-center">
      {!token ? (
        <>
          <h1 className="text-xl font-bold mb-4">Login</h1>
          <input
            type="text"
            value={pixCode}
            onChange={(e) => setPixCode(e.target.value)}
            placeholder="Seu código Pix"
            className="border p-2 w-full mb-2"
          />
          <button
            onClick={login}
            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
          >
            Entrar
          </button>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold mb-4"> Tigrinho 🐯</h1>
          <p>Saldo: R$ {saldo.toFixed(2)}</p>

          <input
            type="number"
            value={amountToBet === 0 ? "" : amountToBet}
            onChange={(e) => {
              const val = e.target.value;
              setAmountToBet(val === "" ? 0 : Number(val));
            }}
            className="border p-2 w-full my-3"
          />

          <button
            onClick={jogar}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded w-full mb-2"
          >
            {loading ? "Jogando..." : "Jogar"}
          </button>

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded w-full"
          >
            Sair
          </button>

          {mensagem && <p className="mt-4">{mensagem}</p>}

          {history.length > 0 && (
            <div className="mt-6 text-left">
              <h2 className="font-bold mb-2">Histórico:</h2>
              <ul className="border p-2 rounded max-h-40 overflow-y-auto">
                {history.map((j) => {
                  return (
                    <li
                      key={j.id}
                      className={j.won ? "text-green-700" : "text-red-700"}
                    >
                      [{j.timestamp}] Apostou R$ {j.amount.toFixed(2)} -{" "}
                      {j.won ? "Ganhou 🎉" : "Perdeu 😞"}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </main>
  );
}
