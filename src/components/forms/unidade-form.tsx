"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "@/components/ui/color-picker";
import { useToast } from "@/components/ui/toast";
import { Loading } from "@/components/ui/loading";
import type { Unidade, UnidadeFormData } from "@/types/unidade";

const unidadeSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  descricao: z.string().max(500, "Descrição muito longa").optional(),
  corPrimaria: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida"),
  corSecundaria: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida"),
  ativa: z.boolean(),
});

type UnidadeFormValues = z.infer<typeof unidadeSchema>;

interface UnidadeFormProps {
  unidade?: Unidade;
  onSubmit: (data: UnidadeFormData) => Promise<void>;
  redirectPath?: string;
}

export function UnidadeForm({ unidade, onSubmit, redirectPath = "/secretaria/unidades" }: UnidadeFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UnidadeFormValues>({
    resolver: zodResolver(unidadeSchema),
    defaultValues: {
      nome: unidade?.nome || "",
      descricao: unidade?.descricao || "",
      corPrimaria: unidade?.corPrimaria || "#1a2b5f",
      corSecundaria: unidade?.corSecundaria || "#f5c518",
      ativa: unidade?.ativa ?? true,
    },
  });

  const corPrimaria = watch("corPrimaria");
  const corSecundaria = watch("corSecundaria");
  const ativa = watch("ativa");

  const handleFormSubmit = async (data: UnidadeFormValues) => {
    setLoading(true);
    try {
      await onSubmit(data);
      success(unidade ? "Unidade atualizada com sucesso" : "Unidade criada com sucesso");
      router.push(redirectPath);
    } catch (err) {
      error(err instanceof Error ? err.message : "Erro ao salvar unidade");
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
          placeholder="Nome da unidade"
          error={errors.nome?.message}
        />
      </div>

      <div>
        <label className="label">Descrição</label>
        <Textarea
          {...register("descricao")}
          placeholder="Descrição da unidade (opcional)"
          error={errors.descricao?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="label">Cor Primária *</label>
          <ColorPicker
            value={corPrimaria}
            onChange={(e) => setValue("corPrimaria", e.target.value)}
            error={errors.corPrimaria?.message}
          />
        </div>

        <div>
          <label className="label">Cor Secundária *</label>
          <ColorPicker
            value={corSecundaria}
            onChange={(e) => setValue("corSecundaria", e.target.value)}
            error={errors.corSecundaria?.message}
          />
        </div>
      </div>

      {/* Preview das cores */}
      <div>
        <label className="label">Preview</label>
        <div
          className="h-16 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: corPrimaria }}
        >
          <span
            className="px-4 py-2 rounded font-medium"
            style={{ backgroundColor: corSecundaria, color: corPrimaria }}
          >
            {watch("nome") || "Nome da Unidade"}
          </span>
        </div>
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
            Unidade ativa
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-8">
          Unidades inativas não aparecem nas listagens de seleção
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
          {loading ? <><Loading size="sm" className="mr-2" />Salvando...</> : unidade ? "Atualizar" : "Criar Unidade"}
        </Button>
      </div>
    </form>
  );
}
