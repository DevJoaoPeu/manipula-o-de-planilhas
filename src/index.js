const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const colunasOriginais = [
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

// Função para ler e imprimir os nomes das colunas de um arquivo Excel
const printExcelFile = (filePath) => {
  try {
    // Lê o arquivo Excel
    const workbook = xlsx.readFile(filePath);

    // Itera sobre todas as planilhas no arquivo
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];

      // Converte a planilha em JSON, tratando a primeira linha como cabeçalhos
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      // Verifica se há dados na planilha
      if (data.length > 0) {
        // Obtém os nomes das colunas (primeira linha da planilha)
        const columnNames = data[0];

        console.log(`Planilha: ${sheetName}`);
        console.log("Nomes das Colunas:", columnNames);
      } else {
        console.log(`Planilha: ${sheetName} está vazia.`);
      }
    });
  } catch (err) {
    console.error(`Erro ao ler o arquivo Excel: ${err.message}`);
  }
};

// Função para buscar o arquivo no diretório
const findAndPrintFile = (directory) => {
  fs.readdir(directory, (err, files) => {
    if (err) {
      return console.error(`Erro ao ler o diretório: ${err}`);
    }

    // Filtra os arquivos que contenham "NANSEN INSTRUMENTOS" no nome e tenham a extensão .xlsx
    const targetFile = files.find(
      (file) =>
        file.includes("NANSEN INSTRUMENTOS") && path.extname(file) === ".xlsx"
    );

    console.log(files);

    if (targetFile) {
      const filePath = path.join(directory, targetFile);
      console.log(`Arquivo encontrado: ${filePath}`);
      printExcelFile(filePath);
    } else {
      console.error(
        'Nenhum arquivo encontrado com "NANSEN INSTRUMENTOS" no nome.'
      );
    }
  });
};

// Obtém o caminho do diretório passado como argumento no terminal
const inputDir = process.argv[2];
if (!inputDir) {
  console.error("Por favor, forneça o caminho para o diretório.");
  process.exit(1);
}

// Chama a função para buscar e imprimir o arquivo Excel
findAndPrintFile(inputDir);
