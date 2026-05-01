# VaultSend — Estratégia de Testes

Como este é um sistema de segurança crítica, a pirâmide de testes foca em garantir a integridade da criptografia e a resiliência da API.

---

## 1. Testes Unitários (Jest)

Foco: Lógica de criptografia no frontend e regras de negócio no backend.

### 1.1 Frontend: Criptografia (`crypto.spec.ts`)
```typescript
import { generateFileKey, encryptFile, decryptFile } from './crypto';

describe('Crypto Library', () => {
  it('deve descriptografar um arquivo para o conteúdo original', async () => {
    const key = await generateFileKey();
    const mockFile = new File(['conteúdo secreto'], 'test.txt');
    
    const { ciphertext, iv } = await encryptFile(mockFile, key);
    const decryptedBlob = await decryptFile(
      await ciphertext.arrayBuffer(), 
      key, 
      Uint8Array.from(atob(iv), c => c.charCodeAt(0))
    );
    
    const text = await decryptedBlob.text();
    expect(text).toBe('conteúdo secreto');
  });
});
```

### 1.2 Backend: Regras de Negócio (`files.service.spec.ts`)
```typescript
describe('FilesService', () => {
  it('deve gerar um ID anônimo se o userId for inválido', async () => {
    const result = await service.initUpload('anonymous', mockDto);
    expect(result.ownerId.toString()).toBe('000000000000000000000000');
  });
});
```

---

## 2. Testes de Integração (Supertest)

Foco: Fluxo completo de API e persistência no MongoDB.

```typescript
import * as request from 'supertest';

describe('Files Flow (e2e)', () => {
  it('/POST files/init deve retornar uploadUrl', () => {
    return request(app.getHttpServer())
      .post('/api/files/init')
      .send({ encryptedName: '...', sizeBytes: 1024, wrappedDek: '...', iv: '...' })
      .expect(201)
      .then(res => {
        expect(res.body.uploadUrl).toBeDefined();
      });
  });
});
```

---

## 3. Testes de Segurança

### 3.1 Teste de Rate Limiting
-   **Objetivo**: Tentar 100 requisições seguidas no `/auth/login`.
-   **Esperado**: O servidor deve retornar `429 Too Many Requests`.

### 3.2 Teste de Acesso não Autorizado
-   **Objetivo**: Tentar baixar um arquivo sem o Token JWT.
-   **Esperado**: `401 Unauthorized`.

---

## 4. Testes de Performance (k6)

Foco: Latência de upload e concorrência.

```javascript
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 50, // 50 usuários simultâneos
  duration: '30s',
};

export default function () {
  const payload = JSON.stringify({
    encryptedName: 'YmFzZTY0LW5hbWU=',
    sizeBytes: 1024 * 1024,
    wrappedDek: '...',
    iv: '...'
  });

  const params = { headers: { 'Content-Type': 'application/json' } };
  http.post('http://localhost:3001/api/files/init', payload, params);
  sleep(1);
}
```

---

## 5. Plano de Execução

1.  **CI/CD**: Rodar Testes Unitários e Integração em cada `Push`.
2.  **Sanity Check**: Testar a criptografia em diferentes navegadores (Chrome, Firefox, Safari) para garantir compatibilidade da Web Crypto API.
3.  **Audit Anual**: Revisão manual do código criptográfico por um terceiro.

---

## 6. Ferramentas Recomendadas

| Categoria | Ferramenta |
|---|---|
| **Runner** | Jest |
| **Integração** | Supertest |
| **Performance** | k6 ou JMeter |
| **Carga** | Artillery |
| **Estático** | ESLint + SonarQube |
