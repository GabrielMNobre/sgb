"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Loading } from "@/components/ui/loading";
import type { MembroComRelacoes, MembroFormData, Classe } from "@/types/membro";
import type { Unidade } from "@/types/unidade";

const membroSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(200, "Nome muito longo"),
  dataNascimento: z.string().optional(),
  tipo: z.enum(["desbravador", "diretoria"]),
  unidadeId: z.string().optional(),
  classeId: z.string().optional(),
  telefone: z.string().max(20, "Telefone inválido").optional(),
  responsavel: z.string().max(200, "Nome muito longo").optional(),
  telefoneResponsavel: z.string().max(20, "Telefone inválido").optional(),
  isentoMensalidade: z.boolean(),
  motivoIsencao: z.string().max(500, "Motivo muito longo").optional(),
  ativo: z.boolean(),
});

type MembroFormValues = z.infer<typeof membroSchema>;

interface MembroFormProps {
  membro?: MembroComRelacoes;
  unidades: Unidade[];
  classes: Classe[];
  onSubmit: (data: MembroFormData) => Promise<void>;
  redirectPath?: string;
}

export function MembroForm({ membro, unidades, classes, onSubmit, redirectPath = "/secretaria/membros" }: MembroFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MembroFormValues>({
    resolver: zodResolver(membroSchema),
    defaultValues: {
      nome: membro?.nome || "",
      dataNascimento: membro?.dataNascimento
        ? new Date(membro.dataNascimento).toISOString().split("T")[0]
        : "",
      tipo: membro?.tipo || "desbravador",
      unidadeId: membro?.unidadeId || "",
      classeId: membro?.classeId || "",
      telefone: membro?.telefone || "",
      responsavel: membro?.responsavel || "",
      telefoneResponsavel: membro?.telefoneResponsavel || "",
      isentoMensalidade: membro?.isentoMensalidade ?? false,
      motivoIsencao: membro?.motivoIsencao || "",
      ativo: membro?.ativo ?? true,
    },
  });

  const tipo = watch("tipo");
  const dataNascimento = watch("dataNascimento");
  const isentoMensalidade = watch("isentoMensalidade");
  const ativo = watch("ativo");

  // Calcular se é menor de idade
  const isMenorDeIdade = () => {
    if (!dataNascimento) return false;
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAniversario = nascimento.getMonth();
    const mesAtual = hoje.getMonth();
    if (mesAtual < mesAniversario ||
        (mesAtual === mesAniversario && hoje.getDate() < nascimento.getDate())) {
      return idade - 1 < 18;
    }
    return idade < 18;
  };

  const menorDeIdade = isMenorDeIdade();

  // Filtrar classes por tipo
  const classesFiltradas = classes.filter((c) => {
    if (tipo === "desbravador") return c.tipo === "desbravador";
    return c.tipo === "diretoria";
  });

  // Limpar unidade quando tipo muda para diretoria
  useEffect(() => {
    if (tipo === "diretoria") {
      setValue("unidadeId", "");
    }
  }, [tipo, setValue]);

  const handleFormSubmit = async (data: MembroFormValues) => {
    // Validações adicionais
    if (tipo === "desbravador" && !data.unidadeId) {
      error("Unidade é obrigatória para desbravadores");
      return;
    }

    if (tipo === "desbravador" && !data.classeId) {
      error("Classe é obrigatória para desbravadores");
      return;
    }

    if (menorDeIdade && !data.responsavel) {
      error("Responsável é obrigatório para menores de idade");
      return;
    }

    if (menorDeIdade && !data.telefoneResponsavel) {
      error("Telefone do responsável é obrigatório para menores de idade");
      return;
    }

    if (data.isentoMensalidade && !data.motivoIsencao?.trim()) {
      error("Motivo da isenção é obrigatório para membros isentos");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        ...data,
        unidadeId: data.unidadeId || undefined,
        classeId: data.classeId || undefined,
        motivoIsencao: data.isentoMensalidade ? data.motivoIsencao : undefined,
      });
      success(membro ? "Membro atualizado com sucesso" : "Membro cadastrado com sucesso");
      router.push(redirectPath);
    } catch (err) {
      error(err instanceof Error ? err.message : "Erro ao salvar membro");
    } finally {
      setLoading(false);
    }
  };

  const unidadesOptions = unidades.map((u) => ({
    value: u.id,
    label: u.nome,
  }));

  const classesOptions = classesFiltradas.map((c) => ({
    value: c.id,
    label: c.nome,
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
      <div>
        <label className="label">Nome *</label>
        <Input
          {...register("nome")}
          placeholder="Nome completo"
          error={errors.nome?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="label">Data de Nascimento</label>
          <Input
            type="date"
            {...register("dataNascimento")}
            error={errors.dataNascimento?.message}
          />
          {menorDeIdade && (
            <p className="text-xs text-amber-600 mt-1">
              Menor de idade - dados do responsável obrigatórios
            </p>
          )}
        </div>

        <div>
          <label className="label">Tipo *</label>
          <Select
            {...register("tipo")}
            options={[
              { value: "desbravador", label: "Desbravador" },
              { value: "diretoria", label: "Diretoria" },
            ]}
            error={errors.tipo?.message}
          />
        </div>
      </div>

      {tipo === "desbravador" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="label">Unidade *</label>
            <Select
              {...register("unidadeId")}
              options={unidadesOptions}
              placeholder="Selecione uma unidade"
              error={errors.unidadeId?.message}
            />
          </div>

          <div>
            <label className="label">Classe {!membro && "*"}</label>
            <Select
              {...register("classeId")}
              options={classesOptions}
              placeholder="Selecione uma classe"
              error={errors.classeId?.message}
            />
          </div>
        </div>
      )}

      {tipo === "diretoria" && (
        <div>
          <label className="label">Classe (opcional)</label>
          <Select
            {...register("classeId")}
            options={classesOptions}
            placeholder="Selecione uma classe"
            error={errors.classeId?.message}
          />
        </div>
      )}

      <div>
        <label className="label">Telefone</label>
        <Input
          {...register("telefone")}
          placeholder="(00) 00000-0000"
          error={errors.telefone?.message}
        />
      </div>

      {menorDeIdade && (
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-4">
          <p className="text-sm font-medium text-amber-800">
            Dados do Responsável (obrigatório para menores de idade)
          </p>

          <div>
            <label className="label">Nome do Responsável *</label>
            <Input
              {...register("responsavel")}
              placeholder="Nome completo do responsável"
              error={errors.responsavel?.message}
            />
          </div>

          <div>
            <label className="label">Telefone do Responsável *</label>
            <Input
              {...register("telefoneResponsavel")}
              placeholder="(00) 00000-0000"
              error={errors.telefoneResponsavel?.message}
            />
          </div>
        </div>
      )}

      {!menorDeIdade && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="label">Nome do Responsável</label>
            <Input
              {...register("responsavel")}
              placeholder="Nome completo do responsável"
              error={errors.responsavel?.message}
            />
          </div>

          <div>
            <label className="label">Telefone do Responsável</label>
            <Input
              {...register("telefoneResponsavel")}
              placeholder="(00) 00000-0000"
              error={errors.telefoneResponsavel?.message}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isentoMensalidade}
              onChange={(e) => {
                setValue("isentoMensalidade", e.target.checked);
                if (!e.target.checked) {
                  setValue("motivoIsencao", "");
                }
              }}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">Isento de mensalidade</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-8">
            Membros isentos não geram mensalidades e não contam como inadimplentes
          </p>
        </div>

        {isentoMensalidade && (
          <div className="ml-8">
            <label className="label">Motivo da Isenção *</label>
            <textarea
              {...register("motivoIsencao")}
              placeholder="Informe o motivo da isenção de mensalidade"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.motivoIsencao && (
              <p className="text-xs text-red-500 mt-1">{errors.motivoIsencao.message}</p>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setValue("ativo", e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700">Membro ativo</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-8">
          Membros inativos não aparecem na chamada
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? <><Loading size="sm" className="mr-2" />Salvando...</> : membro ? "Atualizar" : "Cadastrar Membro"}
        </Button>
      </div>
    </form>
  );
}
