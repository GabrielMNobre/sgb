"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Users, Search, Eye } from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MembroComRelacoes, Classe } from "@/types/membro";

function calcularIdade(dataNascimento?: Date | string): string {
  if (!dataNascimento) return "\u2014";
  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const m = hoje.getMonth() - nascimento.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) idade--;
  return `${idade} anos`;
}

export default function MembrosPage() {
  const [membros, setMembros] = useState<MembroComRelacoes[]>([]);
  const [classes, setClasses] = useState<Classe[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [classeId, setClasseId] = useState("");
  const [ativo, setAtivo] = useState<string>("true");

  const carregarMembros = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("busca", busca);
      if (classeId) params.set("classeId", classeId);
      params.set("ativo", ativo);

      const res = await fetch(`/api/conselheiro/membros?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMembros(data);

        // Extract unique classes from membros for the filter dropdown
        const classesMap = new Map<string, Classe>();
        data.forEach((m: MembroComRelacoes) => {
          if (m.classe) {
            classesMap.set(m.classe.id, {
              id: m.classe.id,
              nome: m.classe.nome,
              tipo: "desbravador" as const,
              ordem: 0,
            });
          }
        });
        setClasses(Array.from(classesMap.values()));
      }
    } catch (err) {
      console.error("Erro ao carregar membros:", err);
    } finally {
      setLoading(false);
    }
  }, [busca, classeId, ativo]);

  useEffect(() => {
    carregarMembros();
  }, [carregarMembros]);

  // Debounce for search
  const [buscaInput, setBuscaInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusca(buscaInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [buscaInput]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Membros</h1>
        <p className="text-sm sm:text-base font-medium" style={{ color: "var(--unit-primary)" }}>
          Membros da sua unidade
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome..."
                value={buscaInput}
                onChange={(e) => setBuscaInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <select
              value={classeId}
              onChange={(e) => setClasseId(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Todas as classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>

            <select
              value={ativo}
              onChange={(e) => setAtivo(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="true">Ativos</option>
              <option value="false">Inativos</option>
              <option value="all">Todos</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs sm:text-sm text-gray-500">Total</p>
            <p className="text-xl sm:text-2xl font-bold" style={{ color: "var(--unit-primary)" }}>{membros.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs sm:text-sm text-gray-500">Desbravadores</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {membros.filter((m) => m.tipo === "desbravador").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs sm:text-sm text-gray-500">Diretoria</p>
            <p className="text-xl sm:text-2xl font-bold text-amber-600">
              {membros.filter((m) => m.tipo === "diretoria").length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {loading ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center py-12">
              <Loading size="lg" />
              <p className="text-gray-500 mt-3">Carregando...</p>
            </div>
          </CardContent>
        </Card>
      ) : membros.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Nenhum membro encontrado</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Nome</th>
                    <th className="pb-3 font-medium">Classe</th>
                    <th className="pb-3 font-medium">Idade</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {membros.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b last:border-0 hover:bg-gray-50"
                    >
                      <td className="py-3 font-medium">{m.nome}</td>
                      <td className="py-3">
                        <Badge variant="outline">
                          {m.classe?.nome || "\u2014"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        {calcularIdade(m.dataNascimento)}
                      </td>
                      <td className="py-3">
                        <Badge
                          variant={m.ativo ? "success" : "secondary"}
                        >
                          {m.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Link
                          href={`/conselheiro/minha-unidade/membros/${m.id}`}
                        >
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {membros.map((m) => (
                <Link
                  key={m.id}
                  href={`/conselheiro/minha-unidade/membros/${m.id}`}
                >
                  <Card className="hover:bg-gray-50">
                    <CardContent className="py-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{m.nome}</p>
                          <p className="text-sm text-gray-500">
                            {m.classe?.nome || "Sem classe"} &bull;{" "}
                            {calcularIdade(m.dataNascimento)}
                          </p>
                        </div>
                        <Badge
                          variant={m.ativo ? "success" : "secondary"}
                        >
                          {m.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
