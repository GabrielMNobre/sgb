"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Loading } from "@/components/ui/loading";
import { Mail, Lock, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { signIn, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Preencha todos os campos.");
      return;
    }

    const result = await signIn(email, password);
    if (result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <h1 className="text-2xl font-bold text-primary text-center mb-2">
        Entrar no SGB
      </h1>
      <p className="text-gray-500 text-center text-sm mb-6">
        Sistema de Gestão do Borba Gato
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="label">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input pl-10"
              placeholder="seu@email.com"
              autoComplete="email"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="label">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pl-10"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          {loading ? (
            <>
              <Loading size="sm" className="border-white border-t-transparent" />
              Entrando...
            </>
          ) : (
            "Entrar"
          )}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400 mt-6">
        Clube de Desbravadores Borba Gato
        <br />
        IASD Santo Amaro - Desde 1965
      </p>
    </div>
  );
}
