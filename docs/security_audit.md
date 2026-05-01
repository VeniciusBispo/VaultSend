# VaultSend — Auditoria de Segurança Completa

Esta auditoria analisa a arquitetura E2EE do VaultSend sob a ótica de um atacante (Red Teaming) e propõe defesas (Blue Teaming).

---

## 1. Riscos Críticos (Prioridade Máxima)

### 🚨 1.1 XSS (Cross-Site Scripting)
*   **Vulnerabilidade**: Se um atacante injetar um script no frontend (ex: via nome de arquivo malicioso ou vulnerabilidade em biblioteca de terceiros), ele pode ler o `#fragment` da URL ou a `MasterKey` da memória/localStorage.
*   **Ataque**: Exfiltração da chave de criptografia do usuário.
*   **Mitigação**: 
    -   Implementar **CSP (Content Security Policy)** rigorosa proibindo `eval()` e restringindo domínios de script.
    -   Higienizar rigorosamente todos os outputs (nomes de arquivos, e-mails).
    -   Usar `HttpOnly Cookies` para tokens de sessão (embora não proteja a chave E2EE).

### 🚨 1.2 MITM (Man-in-the-Middle)
*   **Vulnerabilidade**: Se o tráfego não for criptografado ou o certificado for inválido, o atacante pode interceptar o código JS e injetar um backdoor que envia as chaves em texto claro.
*   **Ataque**: Substituição do código de criptografia original por uma versão maliciosa.
*   **Mitigação**:
    -   **HTTPS Obrigatório** com certificados válidos (Let's Encrypt).
    -   Implementar **HSTS (HTTP Strict Transport Security)** para forçar conexões seguras.
    -   **Subresource Integrity (SRI)** para garantir que as bibliotecas carregadas de CDNs não foram alteradas.

### 🚨 1.3 Força Bruta no Login (Brute Force)
*   **Vulnerabilidade**: Atacantes podem tentar milhares de senhas por segundo se não houver limites.
*   **Ataque**: Acesso à conta do usuário e download dos arquivos criptografados (embora ainda precisem da senha para descriptografar, eles podem tentar quebrar o PBKDF2 offline).
*   **Mitigação**:
    -   **Rate Limiting** agressivo no backend (NestJS Throttler).
    -   Bloqueio temporário de conta após X tentativas falhas.
    -   Incentivar o uso de **2FA (MFA)**.

---

## 2. Vulnerabilidades de Criptografia

### 🔐 2.1 Reuso de IV (Nonce Reuse)
*   **Vulnerabilidade**: Se o sistema gerar o mesmo IV para a mesma chave em arquivos diferentes.
*   **Ataque**: Ataque de "XOR" que permite recuperar o conteúdo original sem a chave.
*   **Mitigação**: 
    -   Uso de `window.crypto.getRandomValues()` para garantir alta entropia.
    -   No multipart, usamos derivação determinística (`BaseIV + PartNumber`) para evitar colisões.

### 🔐 2.2 Side-Channel Attacks (Timing)
*   **Vulnerabilidade**: O tempo de execução de certas operações criptográficas pode revelar bits da chave.
*   **Ataque**: Recuperação parcial de chaves através de análise estatística de tempo de resposta.
*   **Mitigação**:
    -   Utilizar a **Web Crypto API** nativa, que é implementada em código C++ altamente otimizado e resistente a ataques de timing (ao contrário de implementações puras em JS).

---

## 3. Riscos de Infraestrutura e API

### 🌐 3.1 IDOR (Insecure Direct Object Reference)
*   **Vulnerabilidade**: Um usuário autenticado tenta acessar o `fileId` de outro usuário mudando o ID na URL.
*   **Ataque**: Acesso não autorizado a metadados ou download de ciphertext alheio.
*   **Mitigação**:
    -   Sempre validar o `ownerId` no MongoDB em cada query (já implementado no `FilesService`).
    -   Usar **UUIDs (v4)** ou **ObjectIDs** longos em vez de IDs incrementais.

### 🌐 3.2 S3 Bucket Exposure
*   **Vulnerabilidade**: Permissões incorretas no bucket de armazenamento.
*   **Ataque**: Listagem de todos os arquivos ou download direto do ciphertext sem passar pela API.
*   **Mitigação**:
    -   Configurar o Bucket como **Privado**.
    -   Apenas a API/Service Role deve ter permissão de leitura/escrita.
    -   Gerar apenas **URLs Assinadas (Presigned URLs)** com tempo de vida curto (ex: 15 min).

---

## 4. Tabela de Riscos vs Defesas

| Ameaça | Impacto | Probabilidade | Defesa |
|---|---|---|---|
| **XSS** | Crítico | Média | CSP + Sanitização |
| **MITM** | Crítico | Baixa | HSTS + TLS 1.3 |
| **Brute Force** | Alto | Alta | Rate Limit + PBKDF2 |
| **IDOR** | Médio | Baixa | Validação de Ownership |
| **DDoS** | Médio | Média | Cloudflare / WAF |

---

## 5. Recomendações de Hardening (Próximos Passos)

1.  **Security Headers**: Configurar `Helmet` no NestJS para adicionar headers como `X-Content-Type-Options: nosniff` e `X-Frame-Options: DENY`.
2.  **Audit Logs**: Registrar todas as tentativas de acesso a chaves e arquivos (sem logar dados sensíveis).
3.  **Secret Management**: Não deixar chaves de API da AWS ou MongoDB no código. Usar segredos de ambiente (AWS Secrets Manager ou `.env` seguro).
4.  **Penetration Testing**: Realizar testes manuais de injeção e manipulação de estado.
