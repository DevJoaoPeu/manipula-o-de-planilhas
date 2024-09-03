import ADODB from "node-adodb";
import path from "path";
import fs from "fs";
import { convertNumberFormat, formatDate } from "./utils/util.js";

// Função para ler um arquivo .mdb e salvar os dados em um arquivo .txt formatado por tabulação
async function readMdbFile(filePath) {
  try {
    const connection = ADODB.open(
      `Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${filePath};`
    );

    const tables = await connection.schema(20); // 20: adSchemaTables
    if (tables.length > 0) {
      console.log(`Lendo dados da tabela no arquivo ${filePath}:`);

      const associados = `SELECT * FROM Associados`;
      const rows = await connection.query(associados);

      if (rows.length > 0) {
        // Pega os cabeçalhos das colunas e corrige a codificação
        const headers = Object.keys(rows[0]);

        // Adiciona o cabeçalho como primeira linha
        let data = headers.join("\t") + "\n";

        // Adiciona cada linha de dados
        rows.forEach((row) => {
          const rowData = headers.map((header) => {
            let value = row[header];

            // Verifica e formata as colunas específicas de data
            if (
              [
                "Data de Nascimento",
                "Data do Atendimento",
                "Competência",
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

        // Caminho para o arquivo .txt
        const baseName = path.basename(filePath, ".mdb");
        const sanitizedBaseName = baseName;
        const txtFilePath = path.join(
          path.dirname(filePath),
          `Associados ${sanitizedBaseName}.txt`
        );

        // Escrevendo os dados no arquivo .txt
        fs.writeFileSync(txtFilePath, data, "latin1");

        console.log(`Dados salvos em: ${txtFilePath}`);
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

// Função para ler todos os arquivos .mdb em um diretório
async function readAllMdbFiles(directoryPath) {
  try {
    // Lendo todos os arquivos no diretório
    const files = fs.readdirSync(directoryPath);

    // Filtrando apenas arquivos com a extensão .mdb
    const mdbFiles = files.filter((file) => path.extname(file) === ".mdb");

    // Lendo cada arquivo .mdb
    for (const file of mdbFiles) {
      const filePath = path.join(directoryPath, file);
      await readMdbFile(filePath);
    }
  } catch (error) {
    console.error("Erro ao ler os arquivos do diretório:", error);
  }
}

// Obtendo o caminho do diretório do terminal
const directoryPath = process.argv[2];
if (!directoryPath) {
  console.error("Por favor, forneça o caminho do diretório como argumento.");
  process.exit(1);
}

// Chamando a função para ler todos os arquivos .mdb no diretório
readAllMdbFiles(path.resolve(directoryPath));
