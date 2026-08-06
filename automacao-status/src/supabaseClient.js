import { createClient } from "@supabase/supabase-js";

export function createSupabase(config) {
  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const AGENDAMENTO_FIELDS = "id,protocolo,status,criado_por,distribuido_para,updated_at";

export async function fetchAgendamentosByProtocolos(client, protocolos, chunkSize = 100) {
  const unique = [...new Set(protocolos.map((protocolo) => String(protocolo ?? "").trim()).filter(Boolean))];
  const byProtocolo = new Map();

  for (let i = 0; i < unique.length; i += chunkSize) {
    const chunk = unique.slice(i, i + chunkSize);
    const { data, error } = await client
      .from("agendamentos")
      .select(AGENDAMENTO_FIELDS)
      .in("protocolo", chunk);
    if (error) {
      throw new Error(`Falha ao consultar agendamentos (${chunk.length} protocolos): ${error.message}`);
    }
    for (const row of data ?? []) {
      byProtocolo.set(String(row.protocolo ?? "").trim(), row);
    }
  }

  return byProtocolo;
}

export async function fetchTechnicianNames(client) {
  const { data, error } = await client.from("usuarios").select("id,nome");
  if (error) return new Map();
  return new Map((data ?? []).map((user) => [user.id, user.nome]));
}

export async function applyStatusToAgendamentos(client, updates) {
  const grouped = new Map();
  for (const update of updates) {
    if (!grouped.has(update.status)) grouped.set(update.status, []);
    grouped.get(update.status).push(update.id);
  }

  let total = 0;
  for (const [status, ids] of grouped) {
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      const { error } = await client
        .from("agendamentos")
        .update({ status, updated_at: new Date().toISOString() })
        .in("id", chunk);
      if (error) {
        throw new Error(`Falha ao atualizar status '${status}' no agendamento: ${error.message}`);
      }
      total += chunk.length;
    }
  }
  return total;
}
