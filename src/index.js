const reader = require('xlsx');

// Lê o arquivo especificado na linha de comando
const file = process.argv[2];
const read = reader.readFile(file);

// Obtém as planilhas (abas) do arquivo
const sheets = read.SheetNames;

// Loop através de todas as planilhas
for (let i = 0; i < sheets.length; i++) {
  // Converte a planilha em um array de objetos
  const data = reader.utils.sheet_to_json(read.Sheets[sheets[i]]);

  // Reorganiza as colunas e adiciona a nova no índice 2
  const modifiedData = data.map((row) => {
    const keys = Object.keys(row);
    const newColumn = { "Nova Coluna": "Valor Padrão" }; // Altere o nome e valor da nova coluna conforme necessário

    // Insere a nova coluna no índice desejado
    const before = keys.slice(0, 1); // Colunas antes do índice 2
    const after = keys.slice(1);     // Colunas após o índice 2

    // Combina as colunas na nova ordem
    const newRow = {};

    before.forEach(key => newRow[key] = row[key]);
    newRow["Nova Coluna"] = "";
    after.forEach(key => newRow[key] = row[key]);

    console.log(newRow)
    return newRow;
  });

  // Converte os dados de volta em uma planilha
  const newSheet = reader.utils.json_to_sheet(modifiedData);

  // Substitui a planilha antiga pela nova
  read.Sheets[sheets[i]] = newSheet;
}

// Escreve o arquivo modificado de volta
reader.writeFile(read, 'arquivo_modificado.xlsx');
