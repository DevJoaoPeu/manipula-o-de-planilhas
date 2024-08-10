const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

// Função para normalizar os nomes das colunas
const normalizeColumnName = (name) => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
};

const toUpperCase = (text) => {
  return text.toUpperCase();
};

// Função para converter número de série de data do Excel para o formato DD/MM/YYYY
const excelDateToString = (num) => {
  const date = new Date((num - 25569) * 86400 * 1000 + 86400 * 1000);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Função para extrair apenas o número de uma string
const extractNumber = (text) => {
  const match = text.match(/\d+/);
  return match ? match[0] : "";
};

// Função para extrair a parte do texto antes do `-`
const extractBeforeDash = (text) => {
  const index = text.indexOf(" -");
  return index !== -1 ? text.substring(0, index).trim() : text.trim();
};

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

const defaultValues = {
  NrOperadora: "367095",
  DataCompetencia: "01/06/2024",
};

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
        let columnNames = data[0]; // Cabeçalhos
        const rows = data.slice(1); // Linhas de dados

        columnNames = columnNames.map(normalizeColumnName);

        // Identifica os índices das colunas relevantes
        const columnIndexes = {
          contratoIndex: columnNames.indexOf(normalizeColumnName("contrato")),
          codigoSubFaturaIndex: columnNames.indexOf(
            normalizeColumnName("codigosubfatura")
          ),
          contratanteIndex: columnNames.indexOf(
            normalizeColumnName("contratante")
          ),
          codigoBeneficiarioIndex: columnNames.indexOf(
            normalizeColumnName("carteirinha")
          ),
          numeroCertificadoIndex: columnNames.indexOf(
            normalizeColumnName("familia")
          ),
          codigoDependenteIndex: columnNames.indexOf(
            normalizeColumnName("tipo")
          ),
          nomeBeneficiarioIndex: columnNames.indexOf(
            normalizeColumnName("beneficiario")
          ),
          dtNacimentoIndex: columnNames.indexOf(
            normalizeColumnName("dtnascimento")
          ),
          codigoPlanoIndex: columnNames.indexOf(normalizeColumnName("plano")),
          descricaoPlanoIndex: columnNames.indexOf(
            normalizeColumnName("plano")
          ),
          dtInicioVigenciaIndex: columnNames.indexOf(
            normalizeColumnName("Dt adesao")
          ),
          titularIndex: columnNames.indexOf(normalizeColumnName("titular")),
          dtAdimissaoIndex: columnNames.indexOf(
            normalizeColumnName("Dt admissao")
          ),
          matriculaIndex: columnNames.indexOf(normalizeColumnName("matricula")),
          municipioIndex: columnNames.indexOf(normalizeColumnName("municipio")),
        };

        // Verifica se os índices estão corretos
        console.log(columnIndexes);

        // Função para determinar o valor do código dependente
        const getCodigoDependenteValue = (value) => {
          switch (true) {
            case value.includes("Titular"):
              return "0";
            case value.includes("Dependente"):
              return "1";
            default:
              return "";
          }
        };

        // Filtra as colunas que correspondem a colunasOriginais
        const filteredData = rows.map((row) => {
          return colunasOriginais.map((col) => {
            const normalizedCol = normalizeColumnName(col);
            const colIndex = columnNames.indexOf(normalizedCol);

            switch (col) {
              case "NrApolice":
                return columnIndexes.contratoIndex !== -1
                  ? row[columnIndexes.contratoIndex] || ""
                  : "";
              case "CodigoSubFatura":
                return 0;
              case "DescricaoSubFatura":
                return columnIndexes.contratanteIndex !== -1
                  ? row[columnIndexes.contratanteIndex] || ""
                  : "";
              case "CodigoBeneficiario":
                return columnIndexes.codigoBeneficiarioIndex !== -1
                  ? (
                      row[columnIndexes.codigoBeneficiarioIndex] || ""
                    ).toString()
                  : "";
              case "NumeroCertificado":
                return columnIndexes.numeroCertificadoIndex !== -1
                  ? (row[columnIndexes.numeroCertificadoIndex] || "").toString()
                  : "";
              case "CodigoDependente":
                return columnIndexes.codigoDependenteIndex !== -1
                  ? getCodigoDependenteValue(
                      row[columnIndexes.codigoDependenteIndex] || ""
                    )
                  : "";
              case "NomeBeneficiario":
                return columnIndexes.nomeBeneficiarioIndex !== -1
                  ? toUpperCase(row[columnIndexes.nomeBeneficiarioIndex] || "")
                  : "";
              case "DataNascimento":
                return columnIndexes.dtNacimentoIndex !== -1
                  ? excelDateToString(row[columnIndexes.dtNacimentoIndex] || "")
                  : "";
              case "CodigoPlano":
                return columnIndexes.codigoPlanoIndex !== -1
                  ? extractNumber(row[columnIndexes.codigoPlanoIndex] || "")
                  : "";
              case "DescricaoPlano":
                return columnIndexes.descricaoPlanoIndex !== -1
                  ? extractBeforeDash(
                      row[columnIndexes.descricaoPlanoIndex] || ""
                    )
                  : "";
              case "DataInicioVigencia":
                return columnIndexes.dtInicioVigenciaIndex !== -1
                  ? excelDateToString(
                      row[columnIndexes.dtInicioVigenciaIndex] || ""
                    )
                  : "";
              case "NomeMae":
                return columnIndexes.titularIndex !== -1
                  ? toUpperCase(row[columnIndexes.titularIndex] || "")
                  : "";
              case "CodigoGrauParentesco":
                return columnIndexes.codigoDependenteIndex !== -1
                  ? row[columnIndexes.codigoDependenteIndex] || ""
                  : "";
              case "DescricaoGrauParentesco":
                return columnIndexes.codigoDependenteIndex !== -1
                  ? row[columnIndexes.codigoDependenteIndex] || ""
                  : "";
              case "DataAdmissao":
                return columnIndexes.dtAdimissaoIndex !== -1
                  ? excelDateToString(row[columnIndexes.dtAdimissaoIndex] || "")
                  : "";
              case "MatriculaFuncional":
                return columnIndexes.matriculaIndex !== -1
                  ? row[columnIndexes.matriculaIndex] || ""
                  : "";
              case "Cidade":
                return columnIndexes.municipioIndex !== -1
                  ? row[columnIndexes.municipioIndex] || ""
                  : "";
              case "NrOperadora":
                return defaultValues.NrOperadora;
              case "DataCompetencia":
                return defaultValues.DataCompetencia;
              default:
                return colIndex !== -1 ? (row[colIndex] || "").toString() : "";
            }
          });
        });

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
