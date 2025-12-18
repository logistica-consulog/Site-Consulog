'use client'

import { Order, ORDER_STATUS_COLORS, OrderItemBasic } from '@/types/orders'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { X, Package, Calendar, Truck, User } from 'lucide-react'

interface OrderDetailsModalProps {
  order: Order
  isOpen: boolean
  onClose: () => void
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Usar itens ou pedido_items (opcional)
  const items = order.itens || order.pedido_items || []

  // Calcular total se houver preço
  const totalValue = items.reduce((total, item) => {
    const preco = parseFloat(item.preco || '0')
    const qtd = parseFloat(item.prod_qcom || '0')
    return total + (preco * qtd)
  }, 0)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Detalhes do Pedido #{order.pedido_venda}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Informações completas do pedido
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-96 overflow-y-auto">
            {/* Order Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Data do Pedido
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(order.data_add)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Cliente
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.cliente_nome || `Cliente ${order.cliente}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Truck className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Transportadora
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.transp_nome || 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Status
                    </p>
                    <div className="mt-1">
                      <Badge variant={ORDER_STATUS_COLORS[order.status] as 'default' | 'success' | 'warning' | 'error' | 'info'}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Informações de Entrega
              </h4>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Data prevista:</span>{' '}
                  {formatDate(order.data_entrega)}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Itens do Pedido ({items.length} itens)
              </h4>

              {items.length > 0 ? (
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descrição
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qtd
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lote
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Endereço
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item: OrderItemBasic) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item.prod_cprod}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.prod_xprod}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.prod_qcom} {item.prod_ucom}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.lote || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.endereco || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {totalValue > 0 && (
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                            Total do Pedido:
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900">
                            {formatCurrency(totalValue)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">
                    Nenhum item encontrado para este pedido
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end">
              <Button onClick={onClose}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
