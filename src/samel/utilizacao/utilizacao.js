import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import {
  normalizeColumnName,
  nameUtil,
  toUpperCase,
  askInputDir,
  askFileName,
  askIndexNameSheet,
} from "../util/utils.js";
import { convertExcelToTabDelimitedTxt } from "../util/convertFileTxt.js";
import { colunasOriginaisUtil, formatDate } from "../util/utils.js";

// Função para processar o arquivo Excel e criar uma nova planilha
const processExcelFile = (filePath, indexSheet) => {
  try {
    // Lê o arquivo Excel
    const workbook = xlsx.readFile(filePath);

    // Cria um novo workbook para a planilha filtrada
    const newWorkbook = xlsx.utils.book_new();

    // Pega a primeira planilha do workbook
    const sheetName = workbook.SheetNames[indexSheet];
    const sheet = workbook.Sheets[sheetName];

    // Converte a planilha em JSON, tratando a primeira linha como cabeçalhos
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1, raw: false });

    // Verifica se há dados na planilha
    if (data.length > 0) {
      let columnNames = data[0]; // Cabeçalhos
      const rows = data.slice(1); // Linhas de dados

      // Normaliza os nomes das colunas
      const normalizedColumnNames = columnNames.map(normalizeColumnName);

      // Identifica os índices das colunas relevantes
      const columnIndexes = colunasOriginaisUtil.reduce((acc, col) => {
        const normalizedCol = normalizeColumnName(col);
        acc[col] = normalizedColumnNames.indexOf(normalizedCol);
        return acc;
      }, {});

      // Verifica os índices das colunas
      console.log("Índices das colunas:", columnIndexes);

      // Filtra as colunas que correspondem a colunasOriginaisUtil
      const filteredData = rows.map((row) => {
        return colunasOriginaisUtil.map((col) => {
          const colIndex = columnIndexes[col];
          let cellValue =
            colIndex !== -1 ? (row[colIndex] || "").toString() : "";

          // Aplica a função formatDate à coluna "Data"
          if (normalizeColumnName(col) === normalizeColumnName("Data")) {
            cellValue = formatDate(cellValue);
          }

          // Validações para colunas de valores numéricos
          if (
            normalizeColumnName(col) === normalizeColumnName("valor") ||
            normalizeColumnName(col) === normalizeColumnName("valorTotal")
          ) {
            // Preserva o valor original com vírgula e remove o ponto
            if (cellValue === "0,00" || cellValue === "0") {
              cellValue = "0"; // Mantém como zero
            } else {
              // Garante que o valor seja tratado como string e preserve a vírgula
              cellValue = cellValue.replace(".", ",");
            }
          }

          return cellValue;
        });
      });

      // Adiciona os cabeçalhos ao início dos dados filtrados
      filteredData.unshift(colunasOriginaisUtil);

      // Cria uma nova planilha com os dados filtrados
      const newSheet = xlsx.utils.aoa_to_sheet(filteredData);

      // Adiciona a nova planilha ao novo workbook
      xlsx.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
    }

    // Salva o novo arquivo Excel
    const newFilePath = path.join(path.dirname(filePath), `${nameUtil}.xlsx`);
    xlsx.writeFile(newWorkbook, newFilePath);
    console.log(`Novo arquivo criado: ${newFilePath}`);

    // Converte o arquivo Excel para TXT separado por tabulação
    convertExcelToTabDelimitedTxt(newFilePath, nameUtil);
  } catch (err) {
    console.error(`Erro ao processar o arquivo Excel: ${err.message}`);
  }
};

// Função para buscar o arquivo no diretório e processá-lo
const findAndProcessFile = (directory, estipulanteName, indexSheet) => {
  fs.readdir(directory, (err, files) => {
    if (err) {
      return console.error(`Erro ao ler o diretório: ${err.message}`);
    }

    // Filtra os arquivos
    const targetFile = files.find(
      (file) =>
        file.includes(toUpperCase(estipulanteName)) &&
        path.extname(file) === ".xlsx"
    );

    if (!targetFile) {
      console.error(
        `Nenhum arquivo encontrado com ${toUpperCase(estipulanteName)} no nome.`
      );
      return;
    }

    const filePath = path.join(directory, targetFile);
    console.log(`Arquivo encontrado: ${filePath}`);
    processExcelFile(filePath, indexSheet);
  });
};

const inputDir = await askInputDir();
const fileName = await askFileName();
const indexSheet = await askIndexNameSheet();

if (!inputDir || !fileName || !indexSheet) {
  console.error("Por favor, forneça o caminho para o diretório.");
  process.exit(1);
}

// Chama a função para buscar e processar o arquivo Excel
findAndProcessFile(inputDir, fileName, indexSheet);
