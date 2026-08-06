import { createSheetsClient } from "./sheets.js";
import { createSupabase } from "./supabaseClient.js";
import { syncOnce } from "./sync.js";

export async function runWatch(config) {
  const sheets = createSheetsClient(config);
  const supabase = createSupabase(config);

  let running = false;
  let pending = false;
  let shutdown = false;
  let consecutiveErrors = 0;

  const log = (message) => console.log(`[${new Date().toISOString()}] ${message}`);

  async function execute(reason) {
    if (running || shutdown) return;
    running = true;
    try {
      const summary = await syncOnce({ config, sheets, supabase });
      consecutiveErrors = 0;
      log(
        `Sincronizado (${reason}) — ${summary.linhasAlteradas} linha(s) alterada(s), ` +
          `${summary.agendamentosAtualizados} agendamento(s) atualizado(s), ${summary.duracaoMs}ms`
      );
    } catch (error) {
      consecutiveErrors += 1;
      log(`Erro na sincronização (${reason}): ${error.message}`);
    } finally {
      running = false;
      pending = false;
    }
  }

  // Disparos concorrentes são coalescidos: se já há uma sincronização
  // rodando ou agendada, o novo disparo é ignorado.
  function schedule(reason) {
    if (shutdown || pending) return;
    pending = true;
    const delay =
      consecutiveErrors > 0
        ? Math.min(config.maxBackoffMs, 1000 * 2 ** consecutiveErrors)
        : config.debounceMs;
    setTimeout(() => execute(reason), delay);
  }

  // Fonte 1: mudanças em tempo real no sistema de agendamento (Supabase).
  const channel = supabase
    .channel("automacao-status")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "agendamentos" },
      () => schedule("agendamento alterado")
    )
    .subscribe((status) => log(`Realtime conectado: ${status}`));

  // Fonte 2: polling periódico da planilha (o Google Sheets não notifica
  // mudanças para contas de serviço).
  const timer = setInterval(() => schedule("poll da planilha"), config.syncIntervalMs);

  // Execução inicial.
  schedule("inicial");

  async function shutdownHandler() {
    shutdown = true;
    clearInterval(timer);
    await supabase.removeChannel(channel);
    log("Encerrando automação.");
    process.exit(0);
  }

  process.on("SIGINT", shutdownHandler);
  process.on("SIGTERM", shutdownHandler);
}
