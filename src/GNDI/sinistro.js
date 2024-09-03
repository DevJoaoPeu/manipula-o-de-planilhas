import ADODB from "node-adodb";
import path from "path";
import fs from "fs";
import iconv from "iconv-lite";
import { parse, format, isValid } from "date-fns"; // Importando a função isValid

// Função para converter valores numéricos de ponto para vírgula
function convertNumberFormat(value) {
  if (typeof value === "number") {
    return value.toString().replace(".", ",");
  }
  return value;
}

// Função para corrigir a codificação de caracteres
function fixEncoding(value) {
  if (typeof value === "string") {
    return iconv.decode(Buffer.from(value, "binary"), "latin1");
  }
  return value;
}

// Função para formatar datas para o formato dd/mm/aaaa
function formatDate(value) {
  if (typeof value === "string" && value.includes("/")) {
    try {
      // Tenta fazer o parse da data
      const parsedDate = parse(value, "dd/MM/yyyy HH:mm:ss", new Date());

      if (isValid(parsedDate)) {
        // Retorna a data formatada se for válida
        return format(parsedDate, "dd/MM/yyyy");
      } else {
        console.warn(`Data inválida encontrada: ${value}`);
      }
    } catch (error) {
      console.error("Erro ao formatar a data:", error);
    }
  }
  // Retorna o valor original se não for uma data válida
  return value;
}

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
        const headers = Object.keys(rows[0]).map(fixEncoding);

        // Adiciona o cabeçalho como primeira linha
        let data = headers.join("\t") + "\n";

        // Adiciona cada linha de dados
        rows.forEach((row) => {
          const rowData = headers.map((header) => {
            let value = row[header];
            value = fixEncoding(value); // Corrige a codificação

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
        const txtFilePath = filePath.replace(".mdb", ".txt");

        // Escrevendo os dados no arquivo .txt
        fs.writeFileSync(txtFilePath, data);

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
