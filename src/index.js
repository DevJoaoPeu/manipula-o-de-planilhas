const fs = require("fs");
const path = require("path");
const reader = require("xlsx");

const inputDir = process.argv[2]; // Caminho do diretório passado no terminal

// Função para gerar o mapeamento dos nomes dos arquivos
const fileNameMapping = (fileNames) => {
  const mapping = {};
  fileNames.forEach((fileName) => {
    if (fileName.includes("356")) {
      mapping[fileName] = `beneficiario_${fileNames[0].split(".")[0]}.txt`;
    } else if (fileName.includes("357")) {
      mapping[fileName] = `premio_${fileNames[1].split(".")[0]}.txt`;
    } else if (fileName.includes("358")) {
      mapping[fileName] = `utilizacao_${fileNames[2].split(".")[0]}.txt`;
    }
  });
  return mapping;
};

// Lê todos os arquivos do diretório
fs.readdir(inputDir, (err, files) => {
  if (err) {
    return console.error(`Erro ao ler o diretório: ${err}`);
  }

  // Obtém o mapeamento dos arquivos
  const fileMapping = fileNameMapping(files);

  files.forEach((file) => {
    // Verifica se a extensão do arquivo é .xls
    if (path.extname(file) === ".xls") {
      const filePath = path.join(inputDir, file);

      // Obtém o nome do arquivo de saída a partir do mapeamento
      const outputFileName = fileMapping[file];
      if (!outputFileName) {
        console.error(`Nome de saída não encontrado para o arquivo ${file}`);
        return;
      }
      const outputFile = path.join(inputDir, outputFileName);

      const read = reader.readFile(filePath);
      const sheets = read.SheetNames;
      let outputData = "";

      for (let i = 0; i < sheets.length; i++) {
        const sheet = read.Sheets[sheets[i]];
        const data = reader.utils.sheet_to_json(sheet, { header: 1 });

        // Formata os dados para o formato de texto separado por tabulação
        data.forEach((row) => {
          outputData += row.join("\t") + "\n"; // Une as colunas com tabulação e adiciona uma nova linha
        });

        outputData += "\n"; // Adiciona uma linha em branco entre as planilhas
      }

      // Grava o conteúdo no arquivo de saída
      fs.writeFileSync(outputFile, outputData.trim()); // .trim() para remover a última nova linha extra
      console.log(`Dados exportados para ${outputFile}`);
    }
  });
});
