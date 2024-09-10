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
export async function askIsHeader() {
  createRL();
  const inputDir = await rl.question(
    "------- Os arquivos contém cabeçalho? sim ou não "
  );
  return inputDir;
}
