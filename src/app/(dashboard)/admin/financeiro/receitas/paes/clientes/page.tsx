"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClientesPaesTable } from "@/components/tables/clientes-paes-table";
import { ClientePaesModal } from "@/components/forms/cliente-paes-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus } from "lucide-react";
import type { ClientePaes, ClientePaesFormData } from "@/types/paes";
import {
  criarClientePaesAction,
  atualizarClientePaesAction,
  toggleClientePaesAtivoAction,
} from "../actions";

export default function ClientesPaesPage() {
  const [clientes, setClientes] = useState<ClientePaes[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteSelecionado, setClienteSelecionado] = useState<ClientePaes | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/paes/clientes");

      if (response.ok) {
        const data = await response.json();
        setClientes(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNovoCliente = () => {
    setClienteSelecionado(null);
    setModalOpen(true);
  };

  const handleEditarCliente = (cliente: ClientePaes) => {
    setClienteSelecionado(cliente);
    setModalOpen(true);
  };

  const handleSalvarCliente = async (data: ClientePaesFormData, id?: string) => {
    if (id) {
      await atualizarClientePaesAction(id, data);
    } else {
      await criarClientePaesAction(data);
    }
    await carregarDados();
  };

  const handleToggleAtivo = async (id: string) => {
    await toggleClientePaesAtivoAction(id);
    await carregarDados();
  };

  const totalClientes = clientes.length;
  const clientesAtivos = clientes.filter((c) => c.ativo).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes de Paes</h1>
          <p className="text-gray-600 mt-1">
            Gerenciamento de clientes do modulo de paes
          </p>
        </div>
        <Button variant="primary" onClick={handleNovoCliente}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Total Clientes</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {totalClientes}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Ativos</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {clientesAtivos}
            </p>
          </div>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <ClientesPaesTable
              clientes={clientes}
              basePath="/admin/financeiro/receitas/paes/clientes"
              onEdit={handleEditarCliente}
              onToggleAtivo={handleToggleAtivo}
            />
          )}
        </div>
      </Card>

      {/* Modal Cliente */}
      <ClientePaesModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        clienteInicial={
          clienteSelecionado
            ? {
                id: clienteSelecionado.id,
                nome: clienteSelecionado.nome,
              }
            : undefined
        }
        onSubmit={handleSalvarCliente}
      />
    </div>
  );
}
