export interface Product {
  id: number
  nf_cnf: string
  data_add: string
  prod_cprod: string
  prod_xprod: string
  lote: string | null
  referencia: string
  endereco: string
  prod_qcom: string
  prod_qcom_qres: string
  bloqueado: string
  prod_id: number
  data_vcto: string | null
}

export interface ProductSearchResponse {
  success: boolean
  data: Product[]
}

export interface ProductSearchParams {
  produto: string
}
