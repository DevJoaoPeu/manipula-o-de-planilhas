import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import {
  excelDateToString,
  normalizeColumnName,
  toUpperCase,
  colunasOriginaisBnf,
  getCodigoDependenteValue,
  nameBnf,
  defaultValues,
  askInputDir,
  askDtCompet,
} from "../util/utils.js";
import { convertExcelToTabDelimitedTxt } from "../util/convertFileTxt.js";

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
          dtInicioVigenciaIndex: columnNames.indexOf(
            normalizeColumnName("Dt adesao")
          ),
          dtAdimissaoIndex: columnNames.indexOf(
            normalizeColumnName("Dt admissao")
          ),
          matriculaIndex: columnNames.indexOf(normalizeColumnName("matricula")),
        };

        // Filtra as colunas que correspondem a colunasOriginaisBnf
        const filteredData = rows.map((row) => {
          return colunasOriginaisBnf.map((col) => {
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
                  ? excelDateToString(row[columnIndexes.dtNacimentoIndex] || 0)
                  : "";
              case "CodigoPlano":
                return defaultValues.Plano1;
              case "DescricaoPlano":
                return defaultValues.Plano1;
              case "DataInicioVigencia":
                return columnIndexes.dtInicioVigenciaIndex !== -1
                  ? excelDateToString(
                      row[columnIndexes.dtInicioVigenciaIndex] || 0
                    )
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
                  ? excelDateToString(row[columnIndexes.dtAdimissaoIndex] || 0)
                  : "";
              case "MatriculaFuncional":
                return columnIndexes.matriculaIndex !== -1
                  ? row[columnIndexes.matriculaIndex] || ""
                  : "";
              case "NrOperadora":
                return defaultValues.NrOperadora;
              case "DataCompetencia":
                return dtCompet;
              default:
                return colIndex !== -1 ? (row[colIndex] || "").toString() : "";
            }
          });
        });

        // Adiciona os cabeçalhos ao início dos dados filtrados
        filteredData.unshift(colunasOriginaisBnf);

        // Cria uma nova planilha com os dados filtrados
        const newSheet = xlsx.utils.aoa_to_sheet(filteredData);

        // Adiciona a nova planilha ao novo workbook
        xlsx.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
      }
    });

    // Salva o novo arquivo Excel
    const newFilePath = path.join(path.dirname(filePath), `${nameBnf}.xlsx`);
    xlsx.writeFile(newWorkbook, newFilePath);
    console.log(`Novo arquivo criado: ${newFilePath}`);

    // Converte o arquivo Excel para TXT separado por tabulação
    convertExcelToTabDelimitedTxt(newFilePath, nameBnf);
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

    // Filtra os arquivos que contenham "AMAZONIA INDUSTRIA" no nome e tenham a extensão .xlsx
    const targetFile = files.find(
      (file) =>
        file.includes("AMAZONIA INDUSTRIA") && path.extname(file) === ".xlsx"
    );

    if (!targetFile) {
      console.error(
        'Nenhum arquivo encontrado com "AMAZONIA INDUSTRIA" no nome.'
      );
      return;
    }

    const filePath = path.join(directory, targetFile);
    console.log(`Arquivo encontrado: ${filePath}`);
    processExcelFile(filePath);
  });
};

const inputDir = await askInputDir();
const dtCompet = await askDtCompet();

if (!inputDir || !dtCompet) {
  console.error("Por favor, forneça o caminho para o diretório.");
  process.exit(1);
}

// Chama a função para buscar e processar o arquivo Excel
findAndProcessFile(inputDir, dtCompet);
