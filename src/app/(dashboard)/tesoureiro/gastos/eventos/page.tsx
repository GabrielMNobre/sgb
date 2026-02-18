"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EventosTable } from "@/components/tables/eventos-table";
import { EventoModal } from "@/components/forms/evento-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loading } from "@/components/ui/loading";
import { Plus } from "lucide-react";
import type { EventoComGastos, EventoFormData } from "@/types/evento";
import {
  criarEventoAction,
  atualizarEventoAction,
  toggleEventoAtivoAction,
  excluirEventoAction,
} from "../actions";

export default function EventosPage() {
  const [eventos, setEventos] = useState<EventoComGastos[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [eventoSelecionado, setEventoSelecionado] = useState<EventoComGastos | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventoParaExcluir, setEventoParaExcluir] = useState<string | null>(null);

  useEffect(() => {
    carregarEventos();
  }, []);

  const carregarEventos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/eventos?comGastos=true");
      if (res.ok) {
        const data = await res.json();
        setEventos(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      setEventos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNovoEvento = () => {
    setEventoSelecionado(null);
    setModalOpen(true);
  };

  const handleEditarEvento = (evento: EventoComGastos) => {
    setEventoSelecionado(evento);
    setModalOpen(true);
  };

  const handleSalvarEvento = async (data: EventoFormData, id?: string) => {
    if (id) {
      await atualizarEventoAction(id, data);
    } else {
      await criarEventoAction(data);
    }
    await carregarEventos();
  };

  const handleToggleAtivo = async (id: string) => {
    await toggleEventoAtivoAction(id);
    await carregarEventos();
  };

  const handleExcluirEvento = (id: string) => {
    const evento = eventos.find((e) => e.id === id);
    if (evento && evento.quantidadeGastos > 0) {
      alert("Não é possível excluir um evento com gastos vinculados.");
      return;
    }
    setEventoParaExcluir(id);
    setDeleteDialogOpen(true);
  };

  const confirmarExclusao = async () => {
    if (eventoParaExcluir) {
      const result = await excluirEventoAction(eventoParaExcluir);
      if (result.success) {
        await carregarEventos();
      } else {
        alert(result.error);
      }
    }
    setDeleteDialogOpen(false);
    setEventoParaExcluir(null);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Eventos</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Gerenciar eventos para categorizar gastos
          </p>
        </div>
        <Button variant="primary" onClick={handleNovoEvento} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      {/* Tabela */}
      <Card>
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loading size="lg" />
              <p className="text-gray-500 mt-3">Carregando...</p>
            </div>
          ) : (
            <EventosTable
              eventos={eventos}
              basePath="/tesoureiro/gastos/eventos"
              onEdit={handleEditarEvento}
              onToggleAtivo={handleToggleAtivo}
            />
          )}
        </div>
      </Card>

      {/* Modal Evento */}
      <EventoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventoInicial={
          eventoSelecionado
            ? {
                id: eventoSelecionado.id,
                nome: eventoSelecionado.nome,
                descricao: eventoSelecionado.descricao,
                data: eventoSelecionado.data
                  ? new Date(eventoSelecionado.data).toISOString().split("T")[0]
                  : "",
                ativo: eventoSelecionado.ativo,
              }
            : undefined
        }
        onSubmit={handleSalvarEvento}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmarExclusao}
        title="Excluir Evento"
        message="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}
