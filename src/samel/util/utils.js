import { format, parse, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
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

// Função para perguntar o nome do arquivo
export async function askFileName() {
  createRL();
  const nameFile = await rl.question("------- Qual nome do arquivo? ");
  return nameFile;
}

// Função para fechar a interface readline
export function closeRL() {
  if (rl) {
    rl.close();
    rl = null; // Limpar a variável para permitir recriar a interface futuramente
  }
}

// Função para normalizar os nomes das colunas
export const normalizeColumnName = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
};

export const nameBnf = "BeneficiarioMetainfo";
export const nameUtil = "Utilizacao";

export const toUpperCase = (text) => {
  return text.toUpperCase();
};

// Função para converter número de série de data do Excel para o formato DD/MM/YYYY
export const excelDateToString = (num) => {
  if (typeof num !== "number" || isNaN(num) || num <= 0) {
    return ""; // Retorna uma string vazia para valores não válidos
  }
  const date = new Date((num - 25569) * 86400 * 1000 + 86400 * 1000);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Função para extrair apenas o número de uma string
export const extractNumber = (text) => {
  const match = text.match(/\d+/);
  return match ? match[0] : "";
};

// Função para extrair a parte do texto antes do `-` para a coluna descrição plano
export const extractBeforeDash = (text) => {
  const index = text.indexOf(" -");
  return index !== -1 ? text.substring(0, index).trim() : text.trim();
};

// Função para separar depois do espaço
export const extractBeforeSpace = (text) => {
  const index = text.indexOf(" ");
  return index !== -1 ? text.substring(0, index).trim() : text.trim();
};

//Função para determinar se é titular ou dependente
export const getCodigoDependenteValue = (value) => {
  switch (true) {
    case value.includes("Titular"):
      return "0";
    case value.includes("Dependente"):
      return "1";
    default:
      return "";
  }
};

//Função para definir tpo do plano
export const getTypePlano = (value) => {
  switch (true) {
    case value.includes(
      "Coletivo Empresarial Master - Protocolo ANS: 414538991"
    ):
      return "MASTER EMPRESARIAL";
    case value.includes("Master Executivo - Protocolo ANS: 478519173"):
      return "MASTER EXECUTIVO";
    default:
      return "";
  }
};

export const formatDate = (text) => {
  if (typeof text === "string") {
    try {
      // Verifica se o texto está no formato 'dd/MM/yyyy HH:mm'
      if (/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/.test(text.trim())) {
        // Tenta parsear a data no formato 'dd/MM/yyyy HH:mm'
        const parsedDate = parse(text.trim(), "dd/MM/yyyy HH:mm", new Date(), {
          locale: ptBR,
        });
        return format(parsedDate, "dd/MM/yyyy HH:mm", { locale: ptBR });
      } else {
        // Retorna a data padrão se não estiver no formato esperado ou se não contiver hora
        return `${defaultValues.DataCompetencia} 00:00`;
      }
    } catch (error) {
      // Retorna a data padrão em caso de erro
      return `${defaultValues.DataCompetencia} 00:00`;
    }
  }

  // Retorna a data padrão caso o valor não seja uma string válida
  return `${defaultValues.DataCompetencia} 00:00`;
};

export const defaultValues = {
  NrOperadora: "367095",
  DataCompetencia: "01/07/2024",
  Plano1: "MASTER EMPRESARIAL",
  Plano2: "MASTER EXECUTIVO",
};

export const colunasOriginaisBnf = [
  "NrOperadora",
  "NrApolice",
  "DataCompetencia",
  "CodigoEstipulante",
  "DescricaoEstipulante",
  "CodigoSubEstipulante",
  "DescricaoSubEstipulante",
  "CodigoSubFatura",
  "DescricaoSubFatura",
  "CodigoBeneficiario",
  "NumeroCertificado",
  "CodigoDependente",
  "NomeBeneficiario",
  "DataNascimento",
  "Sexo",
  "CodigoPlano",
  "DescricaoPlano",
  "DataInicioVigencia",
  "DataFimVigencia",
  "Cargo",
  "NomeMae",
  "EstadoCivil",
  "CPF",
  "CodigoGrauParentesco",
  "DescricaoGrauParentesco",
  "PISPASEP",
  "DataAdmissao",
  "MatriculaFuncional",
  "DataFalecimento",
  "Idade",
  "Estado",
  "Cidade",
  "Status",
  "AcomodacaoPlano",
];

export const colunasOriginaisUtil = [
  "DATA",
  "TIPO_INTERNACAO",
  "CARATER_ATENDIMENTO",
  "TIPO_CONTA",
  "ATENDIMENTO",
  "AUTORIZACAO_ORIGINAL",
  "COD_TUSS",
  "EVENTO_TUSS",
  "NR_SEQ_PROC_INTERNO",
  "NmProced",
  "TIPOSERVICO",
  "TIPOCONSULTA",
  "APOLICE",
  "CONTRATANTE",
  "PLANO",
  "COD_BENEFICIARIO",
  "BENEFICIARIO",
  "SEXO",
  "DATANASCIMENTO",
  "MAT_CLIENTE",
  "MAT_SAMEL",
  "TIPODEPENDENTE",
  "TITULAR",
  "PRESTADOR",
  "ESPECIALIDADE",
  "QTDE",
  "VALOR",
  "VALORTOTAL",
  "SE_CONTINUIDADE",
  "DT_CONTRATACAO",
  "DIAS_ADESAO",
  "CID_DOENCA",
  "SUB_ESTIPULANTE",
];
