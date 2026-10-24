# Integração do Kando

## Backend integrado na pasta do usuário

O backend principal desta cópia agora está em src/backend/backend/, com seu próprio Git. As alterações de backend-integration foram incorporadas nessa pasta, preservando o código legado, as migrações antigas, o ambiente local e os dados existentes. A pasta estava originalmente em public/backend/backend e foi movida para src/backend/backend para não ser publicada como conteúdo estático pelo Vite.

As migrações até 0017 já foram aplicadas somente no SQLite local dessa pasta. Os dados anteriores foram comparados com o backup em .backend-backups/20261024-035259/. Nenhum commit, push ou deploy foi feito.

O guia atualizado de execução e preparação do commit está em src/backend/backend/INTEGRACAO_KANDO.md. A pasta backend-integration permanece como referência; o backend integrado não precisa dela para executar. As instruções de publicação abaixo continuam necessárias para o servidor remoto.


## O que está implementado

As páginas Projetos, Kanban, Minhas Tarefas e Calendário usam os mesmos registros da API em português: /api/projetos/, /api/tarefas/ e /api/participantes-projeto/. A store mantém um catálogo compartilhado de tarefas por ID, com seleção independente do quadro aberto. Não há cópia de tarefas nem dados demonstrativos nas páginas integradas.

- Administradores são identificados pela participação com papel admin, específica de cada projeto. O criador recebe essa participação automaticamente.
- Todos os administradores têm os mesmos direitos. É possível promover/rebaixar participantes, inclusive o criador, e removê-los, desde que permaneça pelo menos um administrador.
- A proteção do último administrador usa transação e bloqueio da linha do projeto no Django. Excluir a própria conta também não permite contornar essa regra.
- Participantes visualizam o projeto e editam, excluem ou movimentam somente tarefas atribuídas a eles. Atribuição e criação ficam com administradores.
- O frontend aplica as restrições nos botões e na store; o Django valida também requisições diretas. Usuários externos recebem 404, e integrantes sem permissão de escrita recebem 403.
- Minhas Tarefas reúne tarefas atribuídas ao usuário autenticado, com busca e filtros combinados por projeto, prioridade, prazo e status.
- Calendário mensal permite navegar por mês/ano, filtrar projeto/status/minhas tarefas, selecionar dias e abrir o mesmo componente TaskDetails.
- Criação, edição, exclusão, responsáveis, comentários, checklist e materiais utilizam a API. Materiais pertencem ao projeto no modelo existente.
- Prazos mantêm o horário original retornado pelo servidor. Quando o formulário recebe apenas uma data, envia o fim daquele dia no fuso America/Sao_Paulo.
- Perfil recupera nome, e-mail e data de nascimento, permite editar esses campos e atualiza o nome da sidebar imediatamente. O diretório de participantes expõe somente ID, nome e e-mail.
- Alterar senha exige senha atual, nova senha e confirmação, usa os validadores e hash do Django, renova a sessão atual e invalida access/refresh anteriores por versão de token.
- Notificações persistidas são geradas pelo Django para atribuição/alteração/conclusão de tarefas, participação, mudança de função e remoção. Alertas de prazo próximo e atraso usam chaves únicas.
- É possível filtrar, ler individualmente, ler todas, excluir e navegar a partir das notificações. A exclusão mantém internamente a chave do alerta para evitar sua recriação.
- A sidebar mostra a quantidade não lida. A aplicação consulta mudanças a cada 30 segundos e ao recuperar foco, sem sobrepor ciclos. Mudanças locais atualizam a store após o sucesso da API.
- Os estilos de Projetos e Kanban foram conferidos no Chrome, em tema claro/escuro e no celular. A transição da área interna foi encurtada para evitar conteúdo invisível durante a navegação.

A seleção de participantes continua exigindo o e-mail de uma conta existente. A participação é adicionada diretamente; esta implementação não cria um novo fluxo de convite de projeto por e-mail.

## Backend alterado e publicação

O código foi obtido de https://github.com/Hackathon-IFC-2026/backend.git e está em ../backend-integration, como checkout separado. A pasta C:/Users/thaynabecker/backend não foi modificada. O patch backend-kanban.patch reúne todos os arquivos alterados e novos para aplicação sobre a mesma versão do repositório.

As alterações estão locais. Não foi feito push, deploy nem migração no banco publicado. Novos endpoints e regras de segurança dependem de publicar esta versão do Django; uma compilação do frontend sozinha não os instala.

Na cópia do backend destinada à publicação:

1. Aplicar/revisar as alterações (ou usar o checkout backend-integration).
2. Executar python manage.py migrate com as configurações normais do ambiente.
3. Confirmar FRONTEND_URLS com a origem exata do frontend para CORS.
4. Publicar/reiniciar o Django com as configurações normais de produção.
5. Agendar python manage.py notificar_prazos a cada cinco minutos para produzir alertas mesmo sem usuários conectados. A consulta de notificações também gera alertas para o usuário autenticado, sem duplicação.
6. Publicar o frontend compilado com a URL correspondente ao backend atualizado.

Migrações adicionadas:
- 0015_project_creator_membership: registra criadores antigos como administradores, preservando administradores já existentes.
- 0016_user_token_version_notificacao: versão de autenticação e notificações persistidas.
- 0017_tarefa_data_inicio_user_foto: data de início opcional nas tarefas e foto opcional no usuário, preservando registros existentes.

Não usar app.test_settings em desenvolvimento ou produção: esse módulo existe exclusivamente para testes, com banco SQLite em memória, envio de e-mail em memória e hash simplificado de teste.

## Configuração do frontend

O Axios normaliza a URL e centraliza JWT/renovação. O .env encontrado durante esta implementação aponta para localhost:8000 e foi preservado. Essa forma é normalizada para http://localhost:8000.

Para usar o servidor publicado, configurar:

    VITE_API_URL=https://backend.class.fabricadesoftware.ifc.edu.br

Para usar o Django local atualizado:

    VITE_API_URL=http://localhost:8000

Reiniciar o Vite após mudar o .env. O host publicado precisa receber as alterações do backend antes que notificações e troca de senha fiquem disponíveis.

## Verificações

Frontend:

    node tests/kanban.integration.mjs
    npm run build

O teste de store cobre autenticação, projetos, isolamento, responsabilidades, conversões, paginação, recursos, erros de PATCH, promoção/rebaixamento, último Admin, compartilhamento entre páginas e renovação JWT.

Verificação visual e de interações com Chrome instalado no caminho padrão do Windows:

    node tests/ui-smoke.mjs

O teste usa API interceptada exclusivamente no navegador de teste. Não modifica o banco publicado. Confere CSS, funções, detalhes, calendário, perfil com atualização da sidebar, senha, notificações e ausência de transbordamento no celular. Capturas em ui-checks/.

Backend:

    python manage.py test core.tests --settings=app.test_settings --noinput

Passaram os 91 testes da suíte, incluindo os testes existentes e os novos fluxos de autorização, notificações, privacidade, senha, migração e exclusão de projetos sem registros órfãos. A validação local utiliza SQLite em memória; o bloqueio concorrente das permissões deve também ser verificado no ambiente PostgreSQL de homologação.

Um teste anterior no servidor publicado identificou acesso indevido de usuário externo a projeto e edição de projeto por participante. As correções descritas aqui foram verificadas localmente e precisam ser publicadas para proteger aquele servidor.

## Sidebar, planejamento e personalização do perfil

- Sidebar existente modernizada: fundo off-white, 260 px expandida e 76 px compacta, animação GSAP de 300 ms, preferência em localStorage, tooltips por hover/foco e identificação da rota atual, inclusive dentro do Kanban. A área principal usa a mesma variável de largura para acompanhar a animação.
- Tablet inicia compacto quando não há preferência salva. No celular, há menu deslizante com sobreposição, fechamento por Escape/clique externo/navegação, controle de foco e bloqueio de rolagem do fundo. A preferência de movimento reduzido é respeitada e as animações são limpas ao desmontar.
- Dashboard em /dashboard utiliza projetos e tarefas reais das stores. As rotas anteriores continuam disponíveis. Kando Insights não é exibido, pois essa página ainda não existe.
- Foto aparece na sidebar e no Perfil. Seleção, recorte, zoom, ajuste e remoção ficam disponíveis somente depois de clicar em Editar perfil. Não há upload de foto no cadastro.
- O upload usa PATCH multipart autenticado no endpoint do próprio usuário. São aceitos JPG, PNG e WebP de até 5 MB, com validação do conteúdo e da resolução no Django. A imagem é regravada em JPEG, com nome aleatório. A remoção usa PATCH JSON com foto: null.
- O campo de nascimento é obrigatório para novas contas; datas inválidas/futuras são rejeitadas no servidor. Contas existentes com data vazia continuam acessíveis e podem preenchê-la no Perfil. A data não aparece no diretório de outros usuários.
- O mesmo formulário de 520 px atende criação e edição de tarefas. Início e prazo ficam lado a lado no desktop. O Django valida ambos em POST e PATCH, inclusive quando só uma das datas é alterada. Participantes não podem reatribuir tarefas pelo formulário.
- O Calendário mostra início e entrega, distinguindo cada evento. Kanban, Minhas Tarefas e detalhes usam os mesmos campos persistidos.
- As cores de funções, prioridades e status estão centralizadas em src/assets/badges.css, com variantes para tema escuro. Filtros exibem a seleção e têm opção de limpeza.

Para ativar esta atualização no backend, publicar a nova versão e executar python manage.py migrate, incluindo a migração 0017.

Em desenvolvimento, Django disponibiliza /media/ quando DEBUG=True e Cloudinary não está configurado. Em produção, configurar CLOUDINARY_URL para aproveitar o armazenamento já integrado ao projeto, ou servir MEDIA_ROOT em um volume persistente com MEDIA_URL adequado. Não depender do disco temporário de uma instância para guardar fotos.

A biblioteca GSAP foi adicionada ao package.json/package-lock.json; executar npm install ao atualizar outra cópia do frontend.

Referência de implementação das animações: https://gsap.com/docs/v3/GSAP/gsap.context/ e https://gsap.com/docs/v3/GSAP/Timeline/.

Os testes do Chrome também cobrem o modal compacto de edição, upload/recorte de foto com atualização da sidebar, cadastro sem upload, primeiro acesso no tablet, persistência da preferência e movimento reduzido. A API é interceptada apenas nesse teste; a aplicação usa Axios e o backend configurado normalmente.
