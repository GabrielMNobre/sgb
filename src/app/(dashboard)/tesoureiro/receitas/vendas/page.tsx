"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { VendasTable } from "@/components/tables/vendas-table";
import { VendasFilters } from "@/components/forms/vendas-filters";
import { VendaModal } from "@/components/forms/venda-modal";
import { CategoriaVendaModal } from "@/components/forms/categoria-venda-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Tags } from "lucide-react";
import type {
  VendaComCategoria,
  FiltrosVenda,
  VendaFormData,
  CategoriaVenda,
  CategoriaVendaFormData,
} from "@/types/venda";
import {
  criarVendaAction,
  atualizarVendaAction,
  excluirVendaAction,
  criarCategoriaAction,
  atualizarCategoriaAction,
  excluirCategoriaAction,
} from "./actions";

export default function VendasPage() {
  const [vendas, setVendas] = useState<VendaComCategoria[]>([]);
  const [categorias, setCategorias] = useState<CategoriaVenda[]>([]);
  const [filtros, setFiltros] = useState<FiltrosVenda>({});
  const [loading, setLoading] = useState(true);
  const [modalVendaOpen, setModalVendaOpen] = useState(false);
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState<VendaComCategoria | null>(null);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<CategoriaVenda | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [vendaParaExcluir, setVendaParaExcluir] = useState<string | null>(null);

  useEffect(() => {
    carregarDados();
  }, [filtros]);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [vendasRes, categoriasRes] = await Promise.all([
        fetch(`/api/vendas?${new URLSearchParams(filtros as any)}`),
        fetch("/api/categorias-vendas"),
      ]);

      if (vendasRes.ok && categoriasRes.ok) {
        const vendasData = await vendasRes.json();
        const categoriasData = await categoriasRes.json();
        setVendas(Array.isArray(vendasData) ? vendasData : []);
        setCategorias(Array.isArray(categoriasData) ? categoriasData : []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setVendas([]);
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNovaVenda = () => {
    setVendaSelecionada(null);
    setModalVendaOpen(true);
  };

  const handleEditarVenda = (venda: VendaComCategoria) => {
    setVendaSelecionada(venda);
    setModalVendaOpen(true);
  };

  const handleSalvarVenda = async (data: VendaFormData, id?: string) => {
    if (id) {
      await atualizarVendaAction(id, data);
    } else {
      await criarVendaAction(data);
    }
    await carregarDados();
  };

  const handleExcluirVenda = (id: string) => {
    setVendaParaExcluir(id);
    setDeleteDialogOpen(true);
  };

  const confirmarExclusao = async () => {
    if (vendaParaExcluir) {
      await excluirVendaAction(vendaParaExcluir);
      await carregarDados();
    }
    setDeleteDialogOpen(false);
    setVendaParaExcluir(null);
  };

  const handleGerenciarCategorias = () => {
    setCategoriaSelecionada(null);
    setModalCategoriaOpen(true);
  };

  const handleEditarCategoria = (categoria: CategoriaVenda) => {
    setCategoriaSelecionada(categoria);
    setModalCategoriaOpen(true);
  };

  const handleSalvarCategoria = async (data: CategoriaVendaFormData, id?: string) => {
    if (id) {
      await atualizarCategoriaAction(id, data);
    } else {
      await criarCategoriaAction(data);
    }
    await carregarDados();
  };

  const handleExcluirCategoria = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta categoria?")) {
      await excluirCategoriaAction(id);
      await carregarDados();
    }
  };

  const totalVendas = vendas.reduce((sum, v) => sum + v.valorTotal, 0);
  const quantidadeTotal = vendas.reduce((sum, v) => sum + v.quantidade, 0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600 mt-1">
            Controle de vendas e receitas do clube
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleGerenciarCategorias}>
            <Tags className="w-4 h-4 mr-2" />
            Categorias
          </Button>
          <Button variant="primary" onClick={handleNovaVenda}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Venda
          </Button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Total de Vendas</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {formatCurrency(totalVendas)}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Quantidade de Itens</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {quantidadeTotal}
            </p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <p className="text-sm text-gray-600">Número de Vendas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {vendas.length}
            </p>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <div className="p-6">
          <VendasFilters
            categorias={categorias}
            filtros={filtros}
            onFiltrosChange={setFiltros}
          />
        </div>
      </Card>

      {/* Tabela */}
      <Card>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : (
            <VendasTable
              vendas={vendas}
              onEdit={handleEditarVenda}
              onDelete={handleExcluirVenda}
            />
          )}
        </div>
      </Card>

      {/* Categorias */}
      {!loading && categorias.length > 0 && (
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categorias.map((categoria) => (
                <div
                  key={categoria.id}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleEditarCategoria(categoria)}
                >
                  <span className="text-sm font-medium text-gray-700 truncate">
                    {categoria.nome}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Modal Venda */}
      <VendaModal
        isOpen={modalVendaOpen}
        onClose={() => setModalVendaOpen(false)}
        categorias={categorias}
        vendaInicial={
          vendaSelecionada
            ? {
                id: vendaSelecionada.id,
                categoriaId: vendaSelecionada.categoriaId,
                data: new Date(vendaSelecionada.data).toISOString().split("T")[0],
                descricao: vendaSelecionada.descricao,
                quantidade: vendaSelecionada.quantidade,
                valorUnitario: vendaSelecionada.valorUnitario,
                observacao: vendaSelecionada.observacao,
              }
            : undefined
        }
        onSubmit={handleSalvarVenda}
      />

      {/* Modal Categoria */}
      <CategoriaVendaModal
        isOpen={modalCategoriaOpen}
        onClose={() => setModalCategoriaOpen(false)}
        categoriaInicial={
          categoriaSelecionada
            ? {
                id: categoriaSelecionada.id,
                nome: categoriaSelecionada.nome,
                descricao: categoriaSelecionada.descricao,
              }
            : undefined
        }
        onSubmit={handleSalvarCategoria}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmarExclusao}
        title="Excluir Venda"
        message="Tem certeza que deseja excluir esta venda? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />
    </div>
  );
}
