"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { Loading } from "@/components/ui/loading";
import type { Especialidade, EspecialidadeFormData } from "@/types/especialidade";

const especialidadeSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  categoria: z.string().min(1, "Categoria é obrigatória").max(100, "Categoria muito longa"),
  descricao: z.string().max(500, "Descrição muito longa").optional(),
  ativa: z.boolean(),
});

type EspecialidadeFormValues = z.infer<typeof especialidadeSchema>;

interface EspecialidadeFormProps {
  especialidade?: Especialidade;
  onSubmit: (data: EspecialidadeFormData) => Promise<void>;
  redirectPath?: string;
}

export function EspecialidadeForm({ especialidade, onSubmit, redirectPath = "/secretaria/especialidades" }: EspecialidadeFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EspecialidadeFormValues>({
    resolver: zodResolver(especialidadeSchema),
    defaultValues: {
      nome: especialidade?.nome || "",
      categoria: especialidade?.categoria || undefined,
      descricao: especialidade?.descricao || "",
      ativa: especialidade?.ativa ?? true,
    },
  });

  const ativa = watch("ativa");

  const handleFormSubmit = async (data: EspecialidadeFormValues) => {
    setLoading(true);
    try {
      await onSubmit({
        nome: data.nome,
        categoria: data.categoria,
        descricao: data.descricao,
        ativa: data.ativa,
      });
      success(especialidade ? "Especialidade atualizada com sucesso" : "Especialidade criada com sucesso");
      router.push(redirectPath);
    } catch (err) {
      error(err instanceof Error ? err.message : "Erro ao salvar especialidade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 sm:space-y-6">
      <div>
        <label className="label">Nome *</label>
        <Input
          {...register("nome")}
          placeholder="Nome da especialidade"
          error={errors.nome?.message}
        />
      </div>

      <div>
        <label className="label">Categoria *</label>
        <Input
          {...register("categoria")}
          placeholder="Categoria da especialidade"
          error={errors.categoria?.message}
        />
      </div>

      <div>
        <label className="label">Descrição</label>
        <Textarea
          {...register("descricao")}
          placeholder="Descrição da especialidade (opcional)"
          error={errors.descricao?.message}
        />
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={ativa}
            onChange={(e) => setValue("ativa", e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700">
            Especialidade ativa
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-8">
          Especialidades inativas não aparecem nas opções de registro
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
          {loading ? <><Loading size="sm" className="mr-2" />Salvando...</> : especialidade ? "Atualizar" : "Criar Especialidade"}
        </Button>
      </div>
    </form>
  );
}
