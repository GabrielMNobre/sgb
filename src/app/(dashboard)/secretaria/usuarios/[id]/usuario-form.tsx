"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import type { UsuarioComMembro, UsuarioFormData } from "@/services/usuarios";
import type { Membro } from "@/types/membro";
import { updateUsuarioAction } from "../actions";

const usuarioSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  papel: z.enum(["admin", "secretaria", "tesoureiro", "conselheiro"]),
  membroId: z.string().optional().nullable(),
  ativo: z.boolean(),
});

interface UsuarioFormProps {
  usuario: UsuarioComMembro;
  membrosDiretoria: Membro[];
}

export function UsuarioForm({ usuario, membrosDiretoria }: UsuarioFormProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { success, error } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UsuarioFormData>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: usuario.nome,
      papel: usuario.papel,
      membroId: usuario.membroId || undefined,
      ativo: usuario.ativo,
    },
  });

  const papel = watch("papel");
  const membroId = watch("membroId");
  const ativo = watch("ativo");

  const onSubmit = async (data: UsuarioFormData) => {
    setLoading(true);
    try {
      await updateUsuarioAction(usuario.id, data);
      success("Usuário atualizado com sucesso");
      router.push("/secretaria/usuarios");
      router.refresh();
    } catch (err) {
      error("Erro ao atualizar usuário");
    } finally {
      setLoading(false);
    }
  };

  const papelOptions = [
    { value: "admin", label: "Admin" },
    { value: "secretaria", label: "Secretaria" },
    { value: "tesoureiro", label: "Tesoureiro" },
    { value: "conselheiro", label: "Conselheiro" },
  ];

  const membroOptions = [
    { value: "", label: "Nenhum" },
    ...membrosDiretoria.map((m) => ({
      value: m.id,
      label: m.nome.toUpperCase(),
    })),
  ];

  const showConselheiroWarning = papel === "conselheiro" && !membroId;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="label">Nome *</label>
        <Input
          {...register("nome")}
          placeholder="Nome completo"
          error={errors.nome?.message}
        />
      </div>

      <div>
        <label className="label">Email</label>
        <Input
          value={usuario.email}
          disabled
          className="bg-gray-50"
        />
        <p className="text-xs text-gray-500 mt-1">
          O email não pode ser alterado
        </p>
      </div>

      <div>
        <label className="label">Papel *</label>
        <Select
          value={papel}
          onChange={(e) => setValue("papel", e.target.value as UsuarioFormData["papel"])}
          options={papelOptions}
        />
        {errors.papel && (
          <p className="text-sm text-red-500 mt-1">{errors.papel.message}</p>
        )}
      </div>

      <div>
        <label className="label">Membro Vinculado</label>
        <Select
          value={membroId || ""}
          onChange={(e) => setValue("membroId", e.target.value || undefined)}
          options={membroOptions}
        />
        <p className="text-xs text-gray-500 mt-1">
          Vincule este usuário a um membro da diretoria. Necessário para conselheiros acessarem suas unidades.
        </p>
      </div>

      {showConselheiroWarning && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              Atenção: Conselheiro sem membro vinculado
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Usuários com papel de conselheiro precisam estar vinculados a um membro da diretoria para acessarem suas unidades.
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={ativo}
            onChange={(e) => setValue("ativo", e.target.checked)}
            className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700">Usuário ativo</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-8">
          Usuários inativos não podem acessar o sistema
        </p>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>
    </form>
  );
}
