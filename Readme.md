# Comandos para Rodar Arquivos e Merge

## Instalação do Projeto

Para instalar o projeto, siga estes passos:

1. Clone o repositório usando o comando:

   ```bash
   git clone https://github.com/DevJoaoPeu/manipula-o-de-planilhas
   ```

2. Navegue para o diretório do projeto:

   ```bash
   cd manipula-o-de-planilhas
   ```

3. Instale as dependências usando o comando:

   ```bash
   npm i
   ```

## Arquivo Beneficiário Samel

Para rodar o arquivo de beneficiário Samel, use o comando:

```bash
npm run "nome da empresa"

------- Qual o diretório? "caminho do arquivo"
```

**Observação:** Para a tectoy, rodar o seguinte comando:

```bash
npm run tectoy

------- Qual o diretório? "caminho do arquivo"

------- Qual nome do arquivo?  "nome do arquivo"
```

**Observação:** Lembre-se de alterar a data de processamento na variável `defaultValues`.

## Arquivo de Utilização Samel

Para rodar o arquivo de utilização Samel, use o comando:

```bash
npm run util

------- Qual o diretório? "caminho do arquivo"

------- Qual nome do arquivo?  "nome do arquivo"

------- Qual o index da aba?  "index da aba"
```

**Observação:** Lembre-se de alterar a data de processamento na variável `defaultValues`.

## Arquivos Sinistro/Beneficiario GNDI

Para rodar o arquivo de Sinistro/Beneficiario GNDI, use o comando:

```bash
npm run gndi "mm/aaaa" "caminho do arquivo"
```

## Merge de Arquivos `.txt`

Para mesclar arquivos `.txt`, use o comando:

```bash
npm run merge "true - se o arquivo tiver cabeçalho, false - se não tiver" "caminho do arquivo"
```

## Contato

Você pode me encontrar no LinkedIn: [João Pedro](https://www.linkedin.com/in/joao-pedro-pereira-/)
