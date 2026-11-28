// Formatos devolvidos pela API do Pluggy (só os campos que o Lev usa).
// Fonte: https://docs.pluggy.ai/openapi/pluggy-api.json

export type ContaPluggy = {
  id: string
  type: 'BANK' | 'CREDIT'
  subtype: string
  name: string
  marketingName?: string | null
  number: string
  balance: number
  currencyCode: string
  itemId: string
  creditData?: {
    creditLimit?: number | null
    availableCreditLimit?: number | null
    balanceCloseDate?: string | null
    balanceDueDate?: string | null
    minimumPayment?: number | null
  } | null
}

export type TransacaoPluggy = {
  id: string
  description: string
  descriptionRaw?: string | null
  amount: number
  date: string
  type: 'DEBIT' | 'CREDIT' | string
  status?: string | null
  category?: string | null
  currencyCode?: string
  accountId: string
}

export type FaturaPluggy = {
  id: string
  dueDate: string
  billClosingDate?: string | null
  totalAmount: number
  totalAmountCurrencyCode: string
  minimumPaymentAmount?: number | null
  allowsInstallments?: boolean | null
}

export type InvestimentoPluggy = {
  id: string
  name: string
  type: string
  subtype?: string | null
  balance: number
  amount?: number | null
  amountProfit?: number | null
  date?: string | null
  issuer?: string | null
  currencyCode?: string
  itemId: string
}

export type ItemPluggy = {
  id: string
  status: string
  executionStatus?: string | null
  consentExpiresAt?: string | null
  updatedAt?: string | null
}

export type FiltroTransacoes = { dateFrom?: string; dateTo?: string; createdAtFrom?: string }
