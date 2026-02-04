"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import type { Especialidade, MembroEspecialidadeFormData } from "@/types/especialidade";

const membroEspecialidadeSchema = z.object({
  especialidadeId: z.string().min(1, "Especialidade é obrigatória"),
  dataConclusao: z.string().min(1, "Data de conclusão é obrigatória"),
  entregue: z.boolean(),
  dataEntrega: z.string().optional(),
  observacao: z.string().max(500, "Observação muito longa").optional(),
}).refine((data) => {
  if (data.entregue && !data.dataEntrega) {
    return false;
  }
  return true;
}, {
  message: "Data de entrega é obrigatória quando marcado como entregue",
  path: ["dataEntrega"],
}).refine((data) => {
  if (data.entregue && data.dataEntrega && data.dataConclusao) {
    return new Date(data.dataEntrega) >= new Date(data.dataConclusao);
  }
  return true;
}, {
  message: "Data de entrega não pode ser anterior à data de conclusão",
  path: ["dataEntrega"],
});

type MembroEspecialidadeFormValues = z.infer<typeof membroEspecialidadeSchema>;

interface MembroEspecialidadeFormProps {
  membroId: string;
  membroNome: string;
  especialidades: Especialidade[];
  especialidadesExistentes?: string[];
  onSubmit: (data: MembroEspecialidadeFormData) => Promise<void>;
  onCancel: () => void;
}

export function MembroEspecialidadeForm({
  membroId,
  membroNome,
  especialidades,
  especialidadesExistentes = [],
  onSubmit,
  onCancel,
}: MembroEspecialidadeFormProps) {
  const [loading, setLoading] = useState(false);
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("");
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MembroEspecialidadeFormValues>({
    resolver: zodResolver(membroEspecialidadeSchema),
    defaultValues: {
      especialidadeId: "",
      dataConclusao: new Date().toISOString().split("T")[0],
      entregue: false,
      dataEntrega: "",
      observacao: "",
    },
  });

  const entregue = watch("entregue");

  // Filtrar especialidades disponíveis (não já conquistadas e ativas)
  const especialidadesDisponiveis = especialidades.filter(
    (e) => e.ativa && !especialidadesExistentes.includes(e.id)
  );

  // Agrupar por categoria
  const especialidadesFiltradas = categoriaFiltro
    ? especialidadesDisponiveis.filter((e) => e.categoria === categoriaFiltro)
    : especialidadesDisponiveis;

  const especialidadeOptions = especialidadesFiltradas.map((e) => ({
    value: e.id,
    label: e.nome,
  }));

  // Get unique categories from available especialidades
  const categoriaOptions = [
    { value: "", label: "Todas as categorias" },
    ...Array.from(new Set(especialidades.map((e) => e.categoria)))
      .filter(Boolean)
      .sort()
      .map((cat) => ({ value: cat, label: cat })),
  ];

  const handleFormSubmit = async (data: MembroEspecialidadeFormValues) => {
    setLoading(true);
    try {
      await onSubmit({
        membroId,
        especialidadeId: data.especialidadeId,
        dataConclusao: data.dataConclusao,
        entregue: data.entregue,
        dataEntrega: data.entregue ? data.dataEntrega : undefined,
        observacao: data.observacao,
      });
      success("Especialidade registrada com sucesso");
      onCancel();
    } catch (err) {
      error(err instanceof Error ? err.message : "Erro ao registrar especialidade");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label className="label">Membro</label>
        <Input value={membroNome} disabled className="bg-gray-50" />
      </div>

      <div>
        <label className="label">Filtrar por categoria</label>
        <Select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          options={categoriaOptions}
        />
      </div>

      <div>
        <label className="label">Especialidade *</label>
        <Select
          {...register("especialidadeId")}
          options={especialidadeOptions}
          placeholder="Selecione uma especialidade"
          error={errors.especialidadeId?.message}
        />
        {especialidadesFiltradas.length === 0 && (
          <p className="mt-1 text-sm text-amber-600">
            {especialidadesExistentes.length > 0
              ? "Todas as especialidades desta categoria já foram conquistadas"
              : "Nenhuma especialidade disponível nesta categoria"}
          </p>
        )}
      </div>

      <div>
        <label className="label">Data de Conclusão *</label>
        <Input
          type="date"
          {...register("dataConclusao")}
          error={errors.dataConclusao?.message}
        />
      </div>

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={entregue}
            onChange={(e) => setValue("entregue", e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700">
            Insígnia já foi entregue
          </span>
        </label>
      </div>

      {entregue && (
        <div>
          <label className="label">Data de Entrega *</label>
          <Input
            type="date"
            {...register("dataEntrega")}
            error={errors.dataEntrega?.message}
          />
        </div>
      )}

      <div>
        <label className="label">Observação</label>
        <Textarea
          {...register("observacao")}
          placeholder="Observação opcional"
          error={errors.observacao?.message}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || especialidadesFiltradas.length === 0}>
          {loading ? "Registrando..." : "Registrar Conquista"}
        </Button>
      </div>
    </form>
  );
}
