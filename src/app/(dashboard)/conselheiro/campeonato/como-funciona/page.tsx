import Link from "next/link";
import { ArrowLeft, Trophy, Star, AlertTriangle, BookOpen, Zap, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ComoFuncionaPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/conselheiro/campeonato">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Como Funciona a Pontuação</h1>
          <p className="text-sm text-gray-500">Entenda como os pontos do dia são calculados</p>
        </div>
      </div>

      {/* Avaliações automáticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-5 w-5 text-amber-500" />
            Avaliações Automáticas (ao finalizar encontro)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-500">
            Ao finalizar um encontro, o sistema calcula automaticamente 3 avaliações por unidade
            com base nos dados da chamada:
          </p>

          {/* Presença / Pontualidade */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <p className="text-sm font-semibold text-gray-700">1. Presença / Pontualidade</p>
            </div>
            <div className="divide-y">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-700">≥ 80% presença pontual</span>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">+50 pts</Badge>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="text-sm text-gray-700">50%–79% presença</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">+30 pts</Badge>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-700">&lt; 50% presença</span>
                </div>
                <Badge className="bg-red-100 text-red-700 border-red-200">+10 pts</Badge>
              </div>
            </div>
          </div>

          {/* Materiais */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <p className="text-sm font-semibold text-gray-700">2. Materiais</p>
            </div>
            <div className="divide-y">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-700">≥ 80% dos presentes com material</span>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">+50 pts</Badge>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="text-sm text-gray-700">50%–79%</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">+30 pts</Badge>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-700">&lt; 50%</span>
                </div>
                <Badge className="bg-red-100 text-red-700 border-red-200">+10 pts</Badge>
              </div>
            </div>
          </div>

          {/* Uniforme */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <p className="text-sm font-semibold text-gray-700">3. Uniforme</p>
            </div>
            <div className="divide-y">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-700">≥ 80% dos presentes uniformizados</span>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">+50 pts</Badge>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="text-sm text-gray-700">50%–79%</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">+30 pts</Badge>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-700">&lt; 50%</span>
                </div>
                <Badge className="bg-red-100 text-red-700 border-red-200">+10 pts</Badge>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              Máximo por encontro via avaliações automáticas: <strong>150 pts</strong> (50 + 50 + 50)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Avaliações manuais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-5 w-5 text-blue-500" />
            Avaliações Manuais (registradas pelo admin)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            O admin pode registrar avaliações adicionais em qualquer eixo do campeonato:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { label: "Compromisso", color: "#007BFF" },
              { label: "Vida da Unidade", color: "#28A745" },
              { label: "Identidade", color: "#6F42C1" },
              { label: "Formação", color: "#FD7E14" },
              { label: "Social", color: "#E83E8C" },
            ].map((eixo) => (
              <div key={eixo.label} className="flex items-center gap-2 p-2 rounded-lg border">
                <span className="inline-block h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: eixo.color }} />
                <span className="text-sm text-gray-700">{eixo.label}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-2">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
              <span className="text-gray-600">Verde = +50 pts</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" />
              <span className="text-gray-600">Amarelo = +30 pts</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
              <span className="text-gray-600">Vermelho = +10 pts</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dinâmicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-5 w-5 text-purple-500" />
            Dinâmicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            Pontuações por colocação em dinâmicas realizadas durante o encontro:
          </p>
          <div className="border rounded-lg divide-y overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-700">🥇 1º Lugar</span>
              <Badge className="bg-green-100 text-green-700 border-green-200">+50 pts</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-700">🥈 2º Lugar</span>
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">+40 pts</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-700">🥉 3º Lugar</span>
              <Badge className="bg-orange-100 text-orange-700 border-orange-200">+30 pts</Badge>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-700">Participação (para todos)</span>
              <Badge className="bg-gray-100 text-gray-700 border-gray-200">+20 pts</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensalidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5 text-green-600" />
            Mensalidades (calculado mensalmente)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            Uma vez por mês, o admin registra a pontuação de mensalidades com base no percentual
            de adimplência da unidade (membros não-isentos que pagaram no mês):
          </p>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <p className="text-sm font-semibold text-gray-700">Percentual de adimplência → Cor → Pontos</p>
            </div>
            <div className="divide-y">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-700">≥ 80% dos membros pagaram</span>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">+50 pts</Badge>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-yellow-400" />
                  <span className="text-sm text-gray-700">50%–79%</span>
                </div>
                <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">+30 pts</Badge>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-700">&lt; 50%</span>
                </div>
                <Badge className="bg-red-100 text-red-700 border-red-200">+10 pts</Badge>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 border rounded-lg p-3 space-y-1">
            <p className="text-xs text-gray-600">
              <strong>Membros isentos</strong> não entram no cálculo — nem no total nem no numerador.
            </p>
            <p className="text-xs text-gray-600">
              <strong>Frequência:</strong> 1 avaliação por mês (fevereiro a novembro = 10 meses).
            </p>
            <p className="text-xs text-gray-600">
              <strong>Máximo:</strong> 10 × 50 = <strong>500 pts</strong> ao longo do campeonato.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Deméritos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Deméritos (desconto de pontos)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-500">
            Comportamentos inadequados resultam em descontos cumulativos:
          </p>
          <div className="space-y-2">
            {[
              { nivel: "D1", label: "Leves", exemplos: "Desrespeito leve, descuido com materiais", range: "-5 a -10 pts", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
              { nivel: "D2", label: "Moderados", exemplos: "Reincidência D1, desrespeito direto", range: "-10 a -15 pts", color: "bg-orange-100 text-orange-800 border-orange-200" },
              { nivel: "D3", label: "Graves", exemplos: "Desrespeito à liderança, comportamento agressivo", range: "-30 a -40 pts", color: "bg-red-100 text-red-800 border-red-200" },
              { nivel: "D4", label: "Críticos", exemplos: "Agressão física, risco de vida", range: "-80 a -100 pts", color: "bg-red-200 text-red-900 border-red-300" },
            ].map((d) => (
              <div key={d.nivel} className={`border rounded-lg p-3 ${d.color}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">{d.nivel} — {d.label}</span>
                  <span className="text-sm font-bold">{d.range}</span>
                </div>
                <p className="text-xs opacity-80">{d.exemplos}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 border rounded-lg p-3">
            <p className="text-xs text-gray-600">
              D3 e D4 exigem descrição obrigatória. Deméritos acumulam — não há limite por dia.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Classes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-5 w-5 text-green-600" />
            Classes e Especialidades (pontuação permanente)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { label: "Classe Regular", deadline: "até 28/06/2026", pontos: "+200 pts", detalhe: "Tudo ou nada" },
            { label: "Classe Avançada", deadline: "até 25/10/2026", pontos: "+300 pts", detalhe: "Tudo ou nada" },
            { label: "Classe Bíblica", deadline: "Contínuo", pontos: "+200 pts", detalhe: "Se em dia" },
            { label: "Especialidades", deadline: "Contínuo", pontos: "×100 pts cada", detalhe: "Máx. 20 (2000 pts)" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 px-3 border rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400">{item.deadline} · {item.detalhe}</p>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-300 font-bold">{item.pontos}</Badge>
            </div>
          ))}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
            <p className="text-xs text-green-700">
              Máximo possível em classes: <strong>2.700 pts</strong> (200 + 300 + 200 + 2000)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Fórmula */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="text-base">Fórmula do Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm">
            <p className="text-gray-400 text-xs mb-2">// Pontos totais da unidade</p>
            <p>total = avaliações</p>
            <p className="text-green-400">       + dinâmicas</p>
            <p className="text-blue-400">       + mensalidades</p>
            <p className="text-purple-400">       + classes</p>
            <p className="text-red-400">       − deméritos</p>
            <p className="text-gray-400 mt-2 text-xs">// Nunca fica negativo (mínimo 0)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
