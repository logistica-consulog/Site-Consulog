'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { ProductAutocomplete } from '@/components/ui/ProductAutocomplete'
import { Plus, Trash2, Save, FileText } from 'lucide-react'
import { pedidoPreService } from '@/services/pedido-pre'
import {
  CreatePedidoPreRequest,
  PedidoFormData,
  ItemFormData,
  PEDIDO_PREFIXOS_MAP
} from '@/types/pedido-pre'

export default function PedidoPrePage() {
  const [formData, setFormData] = useState<CreatePedidoPreRequest>({
    pedidos: [
      {
        entrega: '',
        nota_fiscal: '',
        serie: '',
        chave_acesso: '',
        cliente: '',
        pedido: '',
        observacao: '',
        prefixo: '1', // Default: Pedido de Venda
        pedido_vinculado: '',
        franquia: '',
        transp_nome: '',
        data_doca: '',
        itens: [
          {
            codigo: '',
            qtde: '1'
          }
        ]
      }
    ]
  })

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')



  const handlePedidoChange = (pedidoIndex: number, field: keyof PedidoFormData, value: string) => {
    const newPedidos = [...formData.pedidos]
    newPedidos[pedidoIndex] = {
      ...newPedidos[pedidoIndex],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      pedidos: newPedidos
    }))
  }

  const handleItemChange = (pedidoIndex: number, itemIndex: number, field: keyof ItemFormData, value: string) => {
    const newPedidos = [...formData.pedidos]
    newPedidos[pedidoIndex].itens[itemIndex] = {
      ...newPedidos[pedidoIndex].itens[itemIndex],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      pedidos: newPedidos
    }))
  }


  const addItem = (pedidoIndex: number) => {
    const newPedidos = [...formData.pedidos]
    newPedidos[pedidoIndex].itens.push({
      codigo: '',
      qtde: '1'
    })
    setFormData(prev => ({
      ...prev,
      pedidos: newPedidos
    }))
  }

  const removeItem = (pedidoIndex: number, itemIndex: number) => {
    if (formData.pedidos[pedidoIndex].itens.length > 1) {
      const newPedidos = [...formData.pedidos]
      newPedidos[pedidoIndex].itens = newPedidos[pedidoIndex].itens.filter((_, i) => i !== itemIndex)
      setFormData(prev => ({
        ...prev,
        pedidos: newPedidos
      }))
    }
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Validate form
      const validation = pedidoPreService.validatePedidoPreData(formData)
      if (!validation.isValid) {
        setError(validation.errors.map(err => err.message).join(', '))
        return
      }

      // Submit
      const result = await pedidoPreService.createPedidoPre(formData)
      setSuccess(result.message || 'Solicitação criada com sucesso!')
      
      // Reset form
      setFormData({
        pedidos: [
          {
            entrega: '',
            nota_fiscal: '',
            serie: '',
            chave_acesso: '',
            cliente: '',
            pedido: '',
            observacao: '',
            prefixo: '1',
            pedido_vinculado: '',
            franquia: '',
            transp_nome: '',
            data_doca: '',
            itens: [
              {
                codigo: '',
                qtde: '1'
              }
            ]
          }
        ]
      })

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar solicitação')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Criar Solicitação de Pedido
                </h1>
                <p className="text-sm text-gray-500">
                  Criar uma nova solicitação de pedido com itens e endereços de entrega
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/pedidos'}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Pedidos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Pedido */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Pedido</h2>
            </div>
            <div className="p-6 space-y-8">
              {formData.pedidos.map((pedido, pedidoIndex) => (
                <div key={pedidoIndex} className="border border-gray-200 rounded-lg p-6">

                  {/* Informações Básicas do Pedido */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <Input
                        label="CNPJ do Cliente *"
                        placeholder="00.000.000/0000-00"
                        mask="00.000.000/0000-00"
                        value={pedido.cliente}
                        onChange={(e) => handlePedidoChange(pedidoIndex, 'cliente', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label="Número do Pedido *"
                        placeholder="000082218-XXX"
                        value={pedido.pedido}
                        onChange={(e) => handlePedidoChange(pedidoIndex, 'pedido', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo do Pedido
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={pedido.prefixo}
                        onChange={(e) => handlePedidoChange(pedidoIndex, 'prefixo', e.target.value)}
                      >
                        {Object.entries(PEDIDO_PREFIXOS_MAP).map(([key, config]) => (
                          <option key={key} value={config.value}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Datas e Informações Adicionais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <Input
                        label="Data de Entrega *"
                        type="date"
                        value={pedido.entrega}
                        onChange={(e) => handlePedidoChange(pedidoIndex, 'entrega', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Observações */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Observações sobre o pedido..."
                      value={pedido.observacao}
                      onChange={(e) => handlePedidoChange(pedidoIndex, 'observacao', e.target.value)}
                    />
                  </div>

                  {/* Itens do Pedido */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Itens</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addItem(pedidoIndex)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Adicionar Item
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {pedido.itens.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-end space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <ProductAutocomplete
                              label="Código do Produto *"
                              placeholder="Digite para buscar produtos..."
                              value={item.codigo}
                              onChange={(value) => handleItemChange(pedidoIndex, itemIndex, 'codigo', value)}
                              required
                            />
                          </div>
                          <div className="w-32">
                            <Input
                              label="Quantidade *"
                              placeholder="4.0"
                              value={item.qtde}
                              onChange={(e) => handleItemChange(pedidoIndex, itemIndex, 'qtde', e.target.value)}
                              required
                            />
                          </div>
                          {pedido.itens.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(pedidoIndex, itemIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
              size="lg"
            >
              <Save className="h-4 w-4 mr-2" />
              Criar Solicitação
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}