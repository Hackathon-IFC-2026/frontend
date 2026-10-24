# Kando Insights

A página autenticada `/insights` usa as tarefas reais do projeto selecionado. O Kanban possui um atalho Carga de trabalho. Administradores consultam a equipe completa, configuram a capacidade de cada pessoa e confirmam transferências; participantes consultam somente sua própria análise. O servidor aplica as mesmas restrições.

## Ativar no servidor

1. Publicar o backend desta pasta `backend/`.
2. Executar `python manage.py migrate` (nova migração `0018_kando_insights`). Ela acrescenta os campos sem remover tarefas ou participações existentes.
3. Publicar o frontend com `npm ci` e `npm run build`.

Não há dependência de IA externa. Nenhum dado fictício é usado pela página. As APIs novas precisam estar publicadas para a página funcionar.

## Cálculo

Somente tarefas não concluídas. Complexidade baixa/média/alta soma 1/2/3 pontos. Alta prioridade soma 1; prazo entre agora e as próximas 48 horas soma 2; atraso soma 3 (sem acumular os dois adicionais de prazo). Tarefas bloqueadas por dependência são exibidas separadamente e não entram na carga executável. Sem responsável, não entram em cargas individuais.

A capacidade inicial é 10 pontos por participação e pode ser ajustada de 1 a 1000 pelo administrador, inclusive para administradores. Atenção a partir de 80%; possível sobrecarga acima de 100%. Estes números são referências de planejamento, não indicadores de produtividade ou competência. Confirme habilidade e disponibilidade reais com a pessoa antes de transferir tarefas.

Os pesos podem ser definidos no Django em `KANDO_INSIGHTS_PESOS` (chaves `baixa`, `media`, `alta`, `proxima`, `atrasada`, `prioridade`). `KANDO_INSIGHTS_ATENCAO` configura a proporção de atenção, padrão `0.8`. Use pesos positivos e limites entre 0 e 1.

## Endpoints

- `GET /api/projetos/{id}/carga-trabalho/`: equipe para administradores, somente o próprio usuário para participantes. Inclui tarefas, pontuação, capacidade, alertas e sugestões. Não depende da paginação de tarefas.
- `GET /api/projetos/{id}/sugestoes-redistribuicao/`: somente administradores.
- `POST /api/projetos/{id}/capacidade/`: administrador envia `usuario` e `capacidade`.
- `PATCH /api/tarefas/{id}/`: reutilizado para transferir, enviando `responsavel` e `esperado_responsavel`. O responsável anterior é comparado novamente sob bloqueio de banco, evitando aplicar sugestão com atribuição desatualizada.
- `GET /api/tarefas/{id}/redistribuicoes/`: histórico de responsável anterior, novo, autor e data, acessível apenas aos integrantes do projeto.

Sugestões simulam sua aplicação conjunta para não ultrapassar a capacidade estimada de quem recebe. A seleção manual permite outro participante, pois a decisão final é humana. A confirmação grava o histórico e as notificações na mesma transação. Ignorar apenas oculta a sugestão nessa visita; não altera tarefas.

As notificações de sobrecarga são geradas no servidor quando o cliente consulta suas notificações (sincronização existente de 30 segundos). São exclusivas de administradores e deduplicadas pelo estado das tarefas e capacidade, inclusive após exclusão da notificação. Não há processo agendado novo.

O painel se atualiza após transferências, alterações de capacidade, edição pelo modal compartilhado e sincronização periódica de 30 segundos. Usa o mesmo registro de tarefa do Kanban, Minhas Tarefas e Calendário.

## Verificação

- `pdm run python manage.py test core.tests --settings=app.test_settings --noinput`
- `npm run build`
- `npx eslint src --no-fix`
- `node tests/insights.integration.mjs`: isolamento entre projetos e sessões, erros e atualização de capacidade.
- `node tests/kanban.integration.mjs`: regressão da integração compartilhada.

A checagem visual automatizada não foi concluída neste ambiente: o Chrome apresentou timeout de conexão.
