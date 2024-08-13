import { promises as fs } from "fs";
import path from "path";

// Diretório onde os arquivos estão localizados
const directoryPath = process.argv[3];
const outputFileName = "Mensalidade.txt"; // Nome do arquivo de saída
const hasHeader = process.argv[2] === "true"; // Se 'true', considera que os arquivos têm cabeçalho

class MergeFiles {
  async lerArquivos(directoryPath) {
    if (!directoryPath) {
      console.error(
        "Por favor, forneça um caminho de diretório como argumento."
      );
      process.exit(1);
    }

    try {
      const files = await fs.readdir(directoryPath);
      this.filtrarArquivos(files);
    } catch (err) {
      console.error("Erro ao ler o diretório: " + err.message);
    }
  }

  async filtrarArquivos(files) {
    const filtro = files.filter((file) => path.extname(file) === ".txt");

    if (!filtro.length) {
      return console.log("Nenhum arquivo .txt encontrado no diretório.");
    }

    let conteudoCombinado = "";
    let primeiroArquivo = true;

    for (const file of filtro) {
      const caminhoArquivo = path.join(directoryPath, file);
      console.log(`Lendo arquivo: ${caminhoArquivo}`);
      const conteudo = await this.lerConteudo(caminhoArquivo);

      if (hasHeader) {
        // Se for o primeiro arquivo, inclui todo o conteúdo, senão, exclui a primeira linha (cabeçalho)
        if (primeiroArquivo) {
          conteudoCombinado += conteudo;
          primeiroArquivo = false;
        } else {
          const linhas = conteudo.split("\n");
          conteudoCombinado += linhas.slice(1).join("\n");
        }
      } else {
        // Se os arquivos não têm cabeçalho, inclui todo o conteúdo
        conteudoCombinado += conteudo;
      }
    }

    this.juntarArquivos(conteudoCombinado);
  }

  async lerConteudo(filePath) {
    try {
      const data = await fs.readFile(filePath, "utf8");
      return data;
    } catch (error) {
      console.error("Erro ao ler o arquivo:", error.message);
    }
  }

  async juntarArquivos(conteudo) {
    const caminhoDeSaida = path.join(directoryPath, outputFileName);

    try {
      await fs.writeFile(caminhoDeSaida, conteudo, "utf8");
      console.log(`Conteúdo combinado gravado em: ${caminhoDeSaida}`);
    } catch (error) {
      console.error("Erro ao gravar o arquivo:", error.message);
    }
  }
}

// Executa o processo
const classs = new MergeFiles().lerArquivos(directoryPath);
