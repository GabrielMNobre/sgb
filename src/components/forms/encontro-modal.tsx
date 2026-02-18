"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import type { EncontroFormData } from "@/types/encontro";

const encontroSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  descricao: z.string().max(500, "Descrição muito longa").optional(),
});

type EncontroFormValues = z.infer<typeof encontroSchema>;

interface EncontroModalProps {
  isOpen: boolean;
  onClose: () => void;
  encontroInicial?: {
    id: string;
    data: string;
    descricao?: string;
  };
  onSubmit: (data: EncontroFormData, id?: string) => Promise<{ success: boolean; error?: string } | void>;
}

export function EncontroModal({
  isOpen,
  onClose,
  encontroInicial,
  onSubmit,
}: EncontroModalProps) {
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();
  const isEdit = !!encontroInicial;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EncontroFormValues>({
    resolver: zodResolver(encontroSchema),
    defaultValues: {
      data: encontroInicial?.data || "",
      descricao: encontroInicial?.descricao || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        data: encontroInicial?.data || "",
        descricao: encontroInicial?.descricao || "",
      });
    }
  }, [isOpen, encontroInicial, reset]);

  const handleFormSubmit = async (values: EncontroFormValues) => {
    setLoading(true);
    try {
      const result = await onSubmit(
        { data: values.data, descricao: values.descricao || undefined },
        encontroInicial?.id
      );

      if (result && !result.success) {
        error(result.error || "Erro ao salvar encontro");
        return;
      }

      success(
        isEdit
          ? "Encontro atualizado com sucesso"
          : "Encontro criado com sucesso"
      );
      onClose();
    } catch (err) {
      error(err instanceof Error ? err.message : "Erro ao salvar encontro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Editar Encontro" : "Novo Encontro"}
    >
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="space-y-4">
          <div>
            <label className="label">Data *</label>
            <Input
              type="date"
              {...register("data")}
              error={errors.data?.message}
            />
          </div>
          <div>
            <label className="label">Descrição</label>
            <Textarea
              {...register("descricao")}
              placeholder="Tema ou observações do encontro (opcional)"
              error={errors.descricao?.message}
            />
          </div>
        </div>
        <ModalFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? "Salvando..." : isEdit ? "Atualizar" : "Criar Encontro"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
