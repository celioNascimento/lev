// Lista das ferramentas do Lev. Fica fora dos componentes para a home e os testes
// usarem a mesma fonte. Cada ferramenta só é "disponível" quando a tela existir.

export type FerramentaId = 'banco' | 'planejamento' | 'veiculo'

export type Ferramenta = {
  id: FerramentaId
  titulo: string
  descricao: string
  disponivel: boolean
}

export const FERRAMENTAS: readonly Ferramenta[] = [
  {
    id: 'banco',
    titulo: 'Contas e movimentações',
    descricao: 'Conecte o banco e veja, em linguagem simples, o que entrou e o que saiu.',
    disponivel: false,
  },
  {
    id: 'planejamento',
    titulo: 'Planejar uma obra ou compra',
    descricao: 'Liste itens com link, preço e descrição. Exemplo: a reforma do banheiro.',
    disponivel: false,
  },
  {
    id: 'veiculo',
    titulo: 'Cuidar do veículo',
    descricao: 'Registre abastecimento, troca de óleo, pneus e outros gastos.',
    disponivel: false,
  },
]
