# 🔒 VaultSend — Zero-Knowledge File Sharing

O VaultSend é uma plataforma de compartilhamento de arquivos focada em privacidade absoluta. Utilizando criptografia de ponta-a-ponta (E2EE) diretamente no navegador, garantimos que nem mesmo os administradores do servidor possam acessar seus dados.

## 🌟 Destaques
- **Privacidade Total**: Arquivos são criptografados com AES-GCM 256 bits antes de saírem do seu computador.
- **Multipart Upload**: Suporte para arquivos grandes via fatiamento (chunks) de 5MB.
- **Zero-Knowledge**: As chaves de descriptografia nunca tocam o servidor (ficam no fragmento `#` da URL).
- **Design Premium**: Interface moderna com Dark Mode e animações dinâmicas.

## 🏗️ Arquitetura
O projeto é dividido em dois módulos principais:
- **/web**: Frontend Next.js que realiza toda a lógica criptográfica via Web Crypto API.
- **/api**: Backend NestJS (Fastify) responsável pela orquestração e metadados.

## 🚀 Como Iniciar

### Pré-requisitos
- Node.js v20+
- MongoDB Atlas (ou local)

### Instalação e Execução
Na raiz do projeto, instale as dependências:
```bash
npm install
```

Para rodar ambos (Frontend e Backend) em modo desenvolvimento:
```bash
npm run dev
```

## 🛡️ Segurança e Testes
- **Auditoria**: Veja nossa [Auditoria de Segurança](./docs/security_audit.md).
- **Testes**: Rode `npm test` na pasta `/api` para validar a integridade.

## 📄 Licença
Distribuído sob a licença MIT. Veja `LICENSE` para mais informações.
