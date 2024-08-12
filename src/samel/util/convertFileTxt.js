import xlsx from "xlsx";
import path from "path";
import fs from "fs";

// Função para converter o arquivo Excel em um arquivo TXT separado por tabulação
export const convertExcelToTabDelimitedTxt = (filePath, nameFile) => {
  try {
    // Lê o arquivo Excel
    const workbook = xlsx.readFile(filePath);

    // Itera sobre todas as planilhas no arquivo
    workbook.SheetNames.forEach((sheetName) => {
      const sheet = workbook.Sheets[sheetName];

      // Converte a planilha em JSON
      const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

      // Verifica se há dados na planilha
      if (data.length > 0) {
        const tabDelimitedText = data.map((row) => row.join("\t")).join("\n");

        // Salva o arquivo TXT
        const txtFilePath = path.join(
          path.dirname(filePath),
          `${nameFile}.txt`
        );
        fs.writeFileSync(txtFilePath, tabDelimitedText, "utf8");
        console.log(`Arquivo TXT criado: ${txtFilePath}`);
      }
    });
  } catch (err) {
    console.error(`Erro ao converter o arquivo Excel para TXT: ${err.message}`);
  }
};
