import ADODB from "node-adodb";
import path from "path";
import fs from "fs";
import {
  askDtCompet,
  askInputDir,
  convertNumberFormat,
  formatDate,
} from "./utils/util.js";
import { BenefGndi } from "./benef.js";

const directoryPath = await askInputDir();
const datePath = await askDtCompet();

class ProcessSinistroGndi {
  async verifyPath(directoryPath) {
    if (!directoryPath || !datePath) {
      console.error("Por favor, forneça o caminho e data.");
      process.exit(1);
    }

    await this.readAllMdbFiles(path.resolve(directoryPath));
  }

  async readAllMdbFiles(directoryPath) {
    try {
      const files = fs.readdirSync(directoryPath);
      const mdbFiles = files.filter((file) => path.extname(file) === ".mdb");

      for (const file of mdbFiles) {
        const filePath = path.join(directoryPath, file);
        await this.readMdbFile(filePath);
      }
    } catch (error) {
      console.error("Erro ao ler os arquivos do diretório:", error);
    }
  }

  async readMdbFile(filePath) {
    try {
      const connection = ADODB.open(
        `Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${filePath};`
      );

      const tables = await connection.schema(20); // 20: adSchemaTables
      if (tables.length > 0) {
        const associados = `SELECT * FROM Associados`;
        const rows = await connection.query(associados);

        if (rows.length > 0) {
          const headers = Object.keys(rows[0]);
          let data = headers.join("\t") + "\n";

          rows.forEach((row) => {
            const rowData = headers.map((header) => {
              let value = row[header];

              if (
                [
                  "Data de Nascimento",
                  "Data do Atendimento",
                  "Competência",
                ].includes(header)
              ) {
                value = formatDate(value);
              }

              if (header.toLowerCase() === "valor") {
                value = convertNumberFormat(value);
              }

              return value;
            });
            data += rowData.join("\t") + "\n";
          });

          const baseName = path.basename(filePath, ".mdb");
          const sanitizedBaseName = baseName;
          const txtFilePath = path.join(
            path.dirname(filePath),
            `Associados ${sanitizedBaseName}.txt`
          );

          fs.writeFileSync(txtFilePath, data, "latin1");

          console.log(
            `Processando arquivo: Associados ${sanitizedBaseName}.txt`
          );
        } else {
          console.log(
            `Nenhuma linha de dados encontrada na tabela do arquivo ${filePath}`
          );
        }
      } else {
        console.log(`Nenhuma tabela encontrada no arquivo ${filePath}`);
      }
    } catch (error) {
      console.error(`Erro ao ler o arquivo ${filePath}:`, error);
    }
  }
}

async function processAllFiles() {
  try {
    const processSinistroGndi = new ProcessSinistroGndi();
    await processSinistroGndi.verifyPath(directoryPath);

    const benefGndi = new BenefGndi();
    await benefGndi.readAllMdbFiles(directoryPath, datePath);
  } catch (error) {
    console.error("Erro ao processar arquivos:", error);
  } finally {
    // Fechar readline e encerrar o processo
    console.log(
      "Todos os arquivos processados com sucesso!!! Author: João Pereira"
    );
    process.exit(0); // Encerra o processo com código de sucesso
  }
}

processAllFiles();
