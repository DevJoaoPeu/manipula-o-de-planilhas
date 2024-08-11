// Função para normalizar os nomes das colunas
export const normalizeColumnName = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
};

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
