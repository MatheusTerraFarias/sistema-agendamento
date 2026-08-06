# Automação de Status de Ordens de Serviço

Serviço que mantém a **planilha online de ordens de serviço** sincronizada com o
**sistema de agendamento** (Supabase). A automação lê o status bruto de cada OS,
cruza com o agendamento (técnico em campo / encerrada), classifica e grava o
resultado na própria planilha — atualizando apenas as células que mudaram.

## Como funciona

1. Lê a planilha online e identifica a coluna da **Ordem de Serviço (OS)** e a
   coluna de **status** (ex.: `Status da Atividade`).
2. Consulta o Supabase (`agendamentos`) em lote pelos protocolos/OS encontrados.
3. Classifica cada ordem conforme a tabela abaixo.
4. Escreve na planilha 4 colunas automáticas:
   - `STATUS SINCRONIZADO` — classificação;
   - `PRECISA CONTATO` — `SIM`/`NÃO` para os atendentes;
   - `DETALHE STATUS` — situação no agendamento (técnico em campo, encerrada, etc.);
   - `ULTIMA SINCRONIZACAO` — data/hora da última alteração.
5. Espelha status terminal (concluída/finalizada/cancelada) de volta para a
   tabela `agendamentos`, mantendo os dois lados sincronizados.

## Classificação

| Status bruto na planilha | Classificação | Precisa contato |
| --- | --- | --- |
| `concluído` / `concluída` | Concluída | Não |
| `não concluído` / `não concluída` | Não concluída | Sim |
| `suspenso` / `suspensa` | Suspensa | Sim |
| `iniciado` / `em andamento` | Em andamento (técnico em campo) | Não |
| `finalizado` / `finalizada` | Finalizada | Não |
| `cancelado` / `cancelada` | Cancelada | Não |
| `pendente` / `novo` | Pendente | Sim |
| qualquer outro / vazio | Desconhecido | Sim |

Regra de cruzamento: se a planilha ainda não indica status terminal, mas o
agendamento já foi **encerrado** (`finalizado`/`cancelado`), prevalece o
agendamento (`Finalizada`/`Cancelada`). Se o agendamento está `em_andamento`
com técnico atribuído, o detalhe mostra o nome do técnico em campo.

## Configuração

1. **Google Cloud**: crie uma conta de serviço
   (`console.cloud.google.com` → IAM → Contas de serviço), ative a API
   Google Sheets e baixe a chave JSON.
2. **Planilha**: compartilhe a planilha online com o e-mail da conta de serviço
   como **Editor**.
3. **Supabase**: em *Settings → API*, copie a URL e a chave **service_role**.
   Aplique `migrations/status_sync.sql` (índice em `protocolo`).
4. Copie `.env.example` para `.env` e preencha.

```bash
cd automacao-status
npm install
npm start        # sincronização única
npm run watch    # modo contínuo (tempo real + polling)
```

## Tempo real e desempenho

- **Supabase Realtime**: qualquer mudança em `agendamentos` dispara uma
  sincronização quase imediata (com debounce de `DEBOUNCE_MS`).
- **Polling da planilha**: o Google Sheets não notifica contas de serviço, então
  a aba é verificada a cada `SYNC_INTERVAL_SECONDS` (padrão: 60s).
- **Evita trabalho desnecessário**: disparos concorrentes são coalescidos;
  consultas ao Supabase são feitas em lote (`IN` de 100); apenas células com
  status alterado são gravadas; após erros, há backoff exponencial.

## Agendamento (opcional)

Se preferir rodar em intervalos fixos em vez do modo watch:

- **Windows (Agendador de Tarefas)**: crie uma tarefa que execute
  `node C:\Users\mathe\sistema-agendamento\automacao-status\src\cli.js`
  com o diretório de trabalho em `automacao-status`.
- **Linux/macOS (cron)**:
  `*/5 * * * * cd /caminho/automacao-status && node src/cli.js >> logs/sync.log 2>&1`

## Colunas de saída

As colunas automáticas são criadas na primeira execução, caso não existam.
Atendentes podem criar um **filtro de visualização** na planilha
(`PRECISA CONTATO = SIM`) para ver apenas as ordens que realmente precisam de
ligação, sem contatar clientes de ordens concluídas ou finalizadas.

## Segurança

A chave `service_role` ignora RLS do Supabase. Utilize-a **somente** neste
serviço de backend e nunca no front-end. Restrinja o acesso ao arquivo `.env`.
