import ADODB from "node-adodb";
import path from "path";
import fs from "fs";
import { convertNumberFormat, formatDate } from "./utils/util.js";

const directoryPath = process.argv[3];
const datePath = process.argv[2];
class BenefGndi {
  async verifyPath(directoryPath) {
    if (!directoryPath) {
      console.error(
        "Por favor, forneça o caminho do diretório como argumento."
      );
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
        const tabelaNome = "Cadastro De Associados";
        const query = `SELECT * FROM [${tabelaNome}]`;

        try {
          const rows = await connection.query(query);

          if (rows.length > 0) {
            // Pega os cabeçalhos das colunas e corrige a codificação
            const headers = Object.keys(rows[0]);

            // Adiciona o cabeçalho como primeira linha
            let data = headers.join("\t") + "\n";

            rows.forEach((row) => {
              const rowData = headers.map((header) => {
                let value = row[header];

                // Verifica e formata as colunas específicas de data
                if (
                  [
                    "Data de Nascimento",
                    "Data do Atendimento",
                    "Competência",
                    "Data de Adesão ao Plano",
                    "Data de Admissão do Empregado",
                    "Data de Cancelamento",
                  ].includes(header)
                ) {
                  value = formatDate(value);
                }

                // Converte ponto para vírgula em coluna de valor
                if (header.toLowerCase() === "valor") {
                  value = convertNumberFormat(value);
                }

                return value;
              });
              data += rowData.join("\t") + "\n";
            });

            const baseName = path.basename(filePath, ".mdb");
            const txtFilePath = path.join(
              path.dirname(filePath),
              `${datePath}_Cadastro De Associados ${baseName}.txt`
            );

            // Escrevendo os dados no arquivo .txt
            fs.writeFileSync(txtFilePath, data, "latin1");

            console.log(
              `Dados da tabela ${tabelaNome} salvos em: ${txtFilePath}`
            );
          } else {
            console.log(
              `Nenhuma linha de dados encontrada na tabela ${tabelaNome} do arquivo ${filePath}`
            );
          }
        } catch (queryError) {
          console.error(
            `Erro ao executar a consulta para a tabela ${tabelaNome}:`,
            queryError
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

new BenefGndi().verifyPath(directoryPath);
