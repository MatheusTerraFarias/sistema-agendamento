import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildDetail,
  classifyRawStatus,
  needsContact,
  normalizeText,
  resolveClass,
} from "../src/status.js";

test("classifica status da planilha", () => {
  assert.equal(classifyRawStatus("concluído"), "concluida");
  assert.equal(classifyRawStatus("CONCLUÍDA"), "concluida");
  assert.equal(classifyRawStatus("não concluído"), "nao_concluida");
  assert.equal(classifyRawStatus("suspenso"), "suspensa");
  assert.equal(classifyRawStatus("iniciado"), "em_andamento");
  assert.equal(classifyRawStatus("em andamento (ainda em campo)"), "em_andamento");
  assert.equal(classifyRawStatus("finalizado"), "finalizada");
  assert.equal(classifyRawStatus("cancelado"), "cancelada");
  assert.equal(classifyRawStatus("pendente"), "pendente");
  assert.equal(classifyRawStatus(""), "desconhecido");
});

test("resolveClass cruza com o sistema de agendamento", () => {
  assert.equal(resolveClass("em_andamento", { status: "finalizado" }), "finalizada");
  assert.equal(resolveClass("em_andamento", { status: "cancelado" }), "cancelada");
  assert.equal(resolveClass("em_andamento", { status: "em_andamento" }), "em_andamento");
  assert.equal(resolveClass("concluida", { status: "novo" }), "concluida");
  assert.equal(resolveClass("em_andamento", null), "em_andamento");
});

test("needsContact indica apenas ordens que precisam de contato", () => {
  assert.equal(needsContact("nao_concluida"), true);
  assert.equal(needsContact("suspensa"), true);
  assert.equal(needsContact("pendente"), true);
  assert.equal(needsContact("desconhecido"), true);
  assert.equal(needsContact("em_andamento"), false);
  assert.equal(needsContact("concluida"), false);
  assert.equal(needsContact("finalizada"), false);
  assert.equal(needsContact("cancelada"), false);
});

test("buildDetail descreve situação no sistema de agendamento", () => {
  const technicians = new Map([["u1", "João"]]);
  assert.equal(
    buildDetail("em_andamento", null, technicians),
    "Não encontrada no sistema de agendamento"
  );
  assert.equal(
    buildDetail("em_andamento", { status: "em_andamento", criado_por: "u1" }, technicians),
    "Técnico em campo: João"
  );
  assert.equal(
    buildDetail("finalizada", { status: "finalizado", criado_por: "u1" }, technicians),
    "Encerrada no sistema de agendamento"
  );
  assert.equal(
    buildDetail("suspensa", { status: "novo", distribuido_para: "u2" }, technicians),
    "Técnico designado"
  );
});

test("normalizeText remove acentos", () => {
  assert.equal(normalizeText("Não Concluída"), "nao concluida");
});
