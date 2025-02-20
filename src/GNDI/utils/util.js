import { parse, format, isValid, parseISO } from "date-fns";
import readline from "readline/promises";
import { stdin as input, stdout as output } from "process";

let rl;

// Função para criar a interface readline, caso ainda não tenha sido criada
function createRL() {
  if (!rl) {
    rl = readline.createInterface({ input, output });
  }
}

// Função para perguntar o diretório
export async function askInputDir() {
  createRL();
  const inputDir = await rl.question("------- Qual o diretório? ");
  return inputDir;
}

// Função para perguntar a data compet
export async function askDtCompet() {
  createRL();
  const inputDir = await rl.question(
    "------- Qual a data de competencia desse arquivo? format(MMAAAA) "
  );
  return inputDir;
}

// Função para fechar a interface readline
export function closeRL() {
  if (rl) {
    rl.close();
    rl = null; // Limpar a variável para permitir recriar a interface futuramente
  }
}

export function convertNumberFormat(value) {
  if (typeof value === "number") {
    return value.toString().replace(".", ",");
  }
  return value;
}

// Função para formatar datas para o formato dd/MM/aaaa
export function formatDate(value) {
  if (typeof value === "string") {
    // Tenta lidar com o formato ISO 8601 diretamente
    try {
      const parsedDate = parseISO(value);
      if (isValid(parsedDate)) {
        return format(parsedDate, "dd/MM/yyyy");
      }
    } catch (error) {
      console.error("Erro ao formatar data ISO:", error);
    }

    // Define os formatos possíveis
    const formats = [
      "dd/MM/yyyy HH:mm:ss", // formato completo com hora
      "dd/MM/yyyy", // formato sem hora
      "MM/dd/yyyy", // formato americano
      "yyyy-MM-dd", // formato ISO sem hora
    ];

    for (const fmt of formats) {
      try {
        const parsedDate = parse(value, fmt, new Date());
        if (isValid(parsedDate)) {
          return format(parsedDate, "dd/MM/yyyy");
        }
      } catch (error) {
        console.error(
          `Erro ao tentar parsear a data com o formato ${fmt}:`,
          error
        );
      }
    }

    // Se nenhum formato for válido, loga um aviso
    console.warn(`Data inválida encontrada: ${value}`);
  }

  // Retorna o valor original se não for uma data válida
  return value;
}

export const colunsFormatBenef = [
  "Data de Nascimento",
  "Data do Atendimento",
  "Competência",
  "Data de Adesão ao Plano",
  "Data de Admissão do Empregado",
  "Data de Cancelamento",
];
