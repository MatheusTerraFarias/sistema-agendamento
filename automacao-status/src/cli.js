import { loadConfig } from "./config.js";
import { runSync } from "./sync.js";
import { runWatch } from "./watch.js";

const HELP = `
Automação de Status de Ordens de Serviço

Uso:
  npm start              Executa uma sincronização única
  npm run watch          Modo contínuo (tempo real + polling)
  node src/cli.js -w     Atalho para o modo contínuo

O modo contínuo:
  - Reage em tempo real a mudanças no sistema de agendamento (Supabase Realtime);
  - Faz polling da planilha a cada SYNC_INTERVAL_SECONDS;
  - Coalesce disparos (debounce) e aplica backoff após erros;
  - Escreve apenas as células cujo status mudou.
`;

function parseArgs(argv) {
  return {
    watch: argv.includes("--watch") || argv.includes("-w"),
    help: argv.includes("--help") || argv.includes("-h"),
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(HELP);
    process.exit(0);
  }

  let config;
  try {
    config = loadConfig();
  } catch (error) {
    console.error(`Configuração inválida: ${error.message}`);
    process.exit(1);
  }

  if (args.watch) {
    await runWatch(config);
    return;
  }

  try {
    const summary = await runSync(config);
    console.log(JSON.stringify(summary, null, 2));
  } catch (error) {
    console.error(`Falha na sincronização: ${error.message}`);
    process.exit(1);
  }
}

main();
