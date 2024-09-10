import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import {
  excelDateToString,
  normalizeColumnName,
  toUpperCase,
  colunasOriginaisBnf,
  getCodigoDependenteValue,
  getTypePlano,
  extractBeforeSpace,
  nameBnf,
  defaultValues,
  extractNumber,
} from "../util/utils.js";
import { convertExcelToTabDelimitedTxt } from "../util/convertFileTxt.js";

// Função para processar o arquivo Excel e criar uma nova planilha
const processExcelFile = (filePath, nameFile) => {
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
          codigoPlanoIndex: columnNames.indexOf(normalizeColumnName("plano")),
          descricaoPlanoIndex: columnNames.indexOf(
            normalizeColumnName("plano")
          ),
          dtInicioVigenciaIndex: columnNames.indexOf(
            normalizeColumnName("Dt adesao")
          ),
          titularIndex: columnNames.indexOf(normalizeColumnName("pai mae")),
          dtAdimissaoIndex: columnNames.indexOf(
            normalizeColumnName("Dt admissao")
          ),
          municipioIndex: columnNames.indexOf(normalizeColumnName("municipio")),
          cnsIndex: columnNames.indexOf(normalizeColumnName("cns")),
          matriculaIndex: columnNames.indexOf(normalizeColumnName("matricula")),
        };

        // Verifica se os índices estão corretos
        console.log(columnIndexes);

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
              case "DescricaoEstipulante":
                return columnIndexes.cnsIndex !== -1
                  ? (row[columnIndexes.cnsIndex] || "").toString()
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
                return columnIndexes.codigoPlanoIndex !== -1
                  ? extractNumber(row[columnIndexes.codigoPlanoIndex] || "")
                  : "";
              case "DescricaoPlano":
                return columnIndexes.descricaoPlanoIndex !== -1
                  ? getTypePlano(row[columnIndexes.descricaoPlanoIndex] || "")
                  : "";
              case "DataInicioVigencia":
                return columnIndexes.dtInicioVigenciaIndex !== -1
                  ? excelDateToString(
                      row[columnIndexes.dtInicioVigenciaIndex] || 0
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
                  ? excelDateToString(row[columnIndexes.dtAdimissaoIndex] || 0)
                  : "";
              case "MatriculaFuncional":
                return columnIndexes.matriculaIndex !== -1
                  ? row[columnIndexes.matriculaIndex] || ""
                  : "";
              case "Cidade":
                return columnIndexes.municipioIndex !== -1
                  ? row[columnIndexes.municipioIndex] || ""
                  : "";
              case "DescricaoSubFatura":
                return columnIndexes.contratanteIndex !== -1
                  ? row[columnIndexes.contratanteIndex] || ""
                  : "";
              case "AcomodacaoPlano":
                return columnIndexes.descricaoPlanoIndex !== -1
                  ? extractBeforeSpace(
                      row[columnIndexes.descricaoPlanoIndex] || ""
                    )
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
        filteredData.unshift(colunasOriginaisBnf);

        // Cria uma nova planilha com os dados filtrados
        const newSheet = xlsx.utils.aoa_to_sheet(filteredData);

        // Adiciona a nova planilha ao novo workbook
        xlsx.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
      }
    });

    // Salva o novo arquivo Excel
    const newFilePath = path.join(
      path.dirname(filePath),
      `${nameBnf}_${nameFile}.xlsx`
    );
    xlsx.writeFile(newWorkbook, newFilePath);
    console.log(`Novo arquivo criado: ${newFilePath}`);

    const nameFileTectoy = `${nameBnf}_${nameFile}`;

    // Converte o arquivo Excel para TXT separado por tabulação
    convertExcelToTabDelimitedTxt(newFilePath, nameFileTectoy);
  } catch (err) {
    console.error(`Erro ao processar o arquivo Excel: ${err.message}`);
  }
};

// Função para buscar o arquivo no diretório e processá-lo
const findAndProcessFile = (directory, nameFile) => {
  fs.readdir(directory, (err, files) => {
    if (err) {
      return console.error(`Erro ao ler o diretório: ${err}`);
    }

    // Filtra os arquivos que contenham "1750 - DUNORTE" no nome e tenham a extensão .xlsx
    const targetFile = files.find(
      (file) => file.includes(nameFile) && path.extname(file) === ".xlsx"
    );

    if (!targetFile) {
      console.error(`Nenhum arquivo encontrado com ${nameFile} no nome.`);
      return;
    }

    const filePath = path.join(directory, targetFile);
    console.log(`Arquivo encontrado: ${filePath}`);
    processExcelFile(filePath, nameFile);
  });
};

// Obtém o caminho do diretório passado como argumento no terminal
const inputDir = process.argv[3];
const nameFile = process.argv[2];
if (!inputDir || !nameFile) {
  console.error("Por favor, forneça o caminho para o diretório.");
  process.exit(1);
}

// Chama a função para buscar e processar o arquivo Excel
findAndProcessFile(inputDir, nameFile);
