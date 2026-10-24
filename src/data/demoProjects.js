export const DEMO_PROJECTS = [
  {
    id: 1,
    nome: 'Natal Luz',
    descricao: 'Organização das atividades e entregas do projeto.',
    creatorId: 1,
    participants: [
      { id: 1, nome: 'Ana' },
      { id: 2, nome: 'Julia' },
      { id: 3, nome: 'Amanda' },
      { id: 4, nome: 'Anna' },
    ],
  },
  {
    id: 2,
    nome: 'Reforma Praça Central',
    descricao: 'Planejamento e execução das melhorias.',
    creatorId: 1,
    participants: [
      { id: 1, nome: 'Ana' },
      { id: 3, nome: 'Amanda' },
      { id: 4, nome: 'Anna' },
    ],
  },
  {
    id: 3,
    nome: 'Mutirão Verde',
    descricao: 'Plantio de árvores e conscientização ambiental.',
    creatorId: null,
    participants: [
      { id: 1, nome: 'Ana' },
      { id: 2, nome: 'Bruno' },
      { id: 3, nome: 'Carla' },
      { id: 4, nome: 'Davi' },
    ],
  },
  {
    id: 4,
    nome: 'Festival de Inverno',
    descricao: 'Shows culturais, gastronomia e artesanato.',
    creatorId: null,
    participants: [
      { id: 1, nome: 'Ana' },
      { id: 2, nome: 'Bruno' },
    ],
  },
  {
    id: 5,
    nome: 'Feira Tecnológica',
    descricao: 'Exposição de startups e palestras de inovação.',
    creatorId: null,
    participants: [
      { id: 1, nome: 'Ana' },
      { id: 2, nome: 'Bruno' },
      { id: 3, nome: 'Carla' },
    ],
  },
  {
    id: 6,
    nome: 'Iluminação Pública LED',
    descricao: 'Instalação de lâmpadas LED sustentáveis.',
    creatorId: null,
    participants: [{ id: 1, nome: 'Ana' }],
  },
  {
    id: 7,
    nome: 'Revitalização Orla',
    descricao: 'Ciclovia e nova calçada para caminhada.',
    creatorId: null,
    participants: [
      { id: 1, nome: 'Ana' },
      { id: 2, nome: 'Bruno' },
      { id: 3, nome: 'Carla' },
    ],
  },
  {
    id: 8,
    nome: 'Horta Comunitária',
    descricao: 'Cultivo de hortaliças e oficinas ecológicas.',
    creatorId: null,
    participants: [
      { id: 1, nome: 'Ana' },
      { id: 2, nome: 'Bruno' },
    ],
  },
]

export function copiarDadosDemo(valor) {
  return JSON.parse(JSON.stringify(valor))
}
