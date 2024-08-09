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

// Função para processar o arquivo Excel e criar uma nova planilha
const processExcelFile = (filePath) => {
  try {
    // Lê o arquivo Excel
    const workbook = xlsx.readFile(filePath);

    // Novo workbook para a planilha filtrada
    const newWorkbook = xlsx.utils.book_new();

    // Itera sobre todas as planilhas no arquivo
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];

      // Converte a planilha em JSON, tratando a primeira linha como cabeçalhos
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      // Verifica se há dados na planilha
      if (data.length > 0) {
        const columnNames = data[0]; // Cabeçalhos
        const rows = data.slice(1); // Linhas de dados

        // Filtra as colunas que correspondem a colunasOriginais
        const filteredData = rows.map((row) =>
          colunasOriginais.map((col) => row[columnNames.indexOf(col)] || "")
        );

        // Adiciona os cabeçalhos ao início dos dados filtrados
        filteredData.unshift(colunasOriginais);

        // Cria uma nova planilha com os dados filtrados
        const newSheet = xlsx.utils.aoa_to_sheet(filteredData);

        // Adiciona a nova planilha ao novo workbook
        xlsx.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
      }
    });

    // Salva o novo arquivo Excel
    const newFilePath = path.join(
      path.dirname(filePath),
      "filtered_output.xlsx"
    );
    xlsx.writeFile(newWorkbook, newFilePath);
    console.log(`Novo arquivo criado: ${newFilePath}`);
  } catch (err) {
    console.error(`Erro ao processar o arquivo Excel: ${err.message}`);
  }
};

// Função para buscar o arquivo no diretório e processá-lo
const findAndProcessFile = (directory) => {
  fs.readdir(directory, (err, files) => {
    if (err) {
      return console.error(`Erro ao ler o diretório: ${err}`);
    }

    // Filtra os arquivos que contenham "NANSEN INSTRUMENTOS" no nome e tenham a extensão .xlsx
    const targetFile = files.find(
      (file) =>
        file.includes("NANSEN INSTRUMENTOS") && path.extname(file) === ".xlsx"
    );

    if (!targetFile) {
      console.error(
        'Nenhum arquivo encontrado com "NANSEN INSTRUMENTOS" no nome.'
      );
    } 

    const filePath = path.join(directory, targetFile);
    console.log(`Arquivo encontrado: ${filePath}`);
    processExcelFile(filePath);
  });
};

// Obtém o caminho do diretório passado como argumento no terminal
const inputDir = process.argv[2];
if (!inputDir) {
  console.error("Por favor, forneça o caminho para o diretório.");
  process.exit(1);
}

// Chama a função para buscar e processar o arquivo Excel
findAndProcessFile(inputDir);
