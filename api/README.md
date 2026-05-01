# VaultSend API

API de Backend para o sistema de compartilhamento de arquivos E2EE.

## Configuração Inicial

Para resolver os erros de "Module not found" e habilitar os decoradores no VS Code:

1.  **Instale as dependências**:
    ```bash
    cd api
    npm install
    ```

2.  **Configuração do Ambiente**:
    Crie um arquivo `.env` na raiz da pasta `api` com:
    ```env
    MONGODB_URI=mongodb://localhost:27017/vaultsend
    JWT_SECRET=sua_chave_secreta_aqui
    ```

3.  **Execução**:
    ```bash
    npm run start:dev
    ```

## Correções Realizadas
-   Implementação completa do `SharesModule` (Service, Controller, DTO, Schema).
-   Criação do `tsconfig.json` para habilitar decoradores (`experimentalDecorators`).
-   Correção de caminhos de importação em múltiplos arquivos.
-   Adição de tipagens para o Node.js.
