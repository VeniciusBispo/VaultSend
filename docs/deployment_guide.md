# Guia de Deploy — VaultSend

Siga estes passos para colocar seu sistema E2EE online.

## 1. Subir para o GitHub
Abra um terminal na pasta raiz (`VaultSend`) e execute:

```powershell
git init
git add .
git commit -m "feat: setup production and E2EE multipart"
# Crie um repositório no GitHub e cole os comandos abaixo:
git remote add origin https://github.com/seu-usuario/vaultsend.git
git branch -M main
git push -u origin main
```

---

## 2. Deploy do Backend (API)
**Recomendação: [Render.com](https://render.com)**

1.  Crie uma conta na Render e conecte seu GitHub.
2.  Escolha **"New Web Service"** e selecione o repositório `vaultsend`.
3.  Configure:
    -   **Root Directory**: `api`
    -   **Build Command**: `npm install && npm run build`
    -   **Start Command**: `npm run start:prod`
4.  **Environment Variables (CRÍTICO)**:
    -   `MONGODB_URI`: Cole sua string do MongoDB Atlas aqui.
    -   `JWT_SECRET`: Crie uma senha longa e aleatória.
    -   `PORT`: `3001`

---

## 3. Deploy do Frontend (Web)
**Plataforma: [Netlify](https://netlify.com)**

1.  Conecte seu GitHub no Netlify.
2.  Escolha o repositório `vaultsend`.
3.  Configure:
    -   **Base directory**: `web`
    -   **Build command**: `next build`
    -   **Publish directory**: `.next`
4.  **Environment Variables**:
    -   `NEXT_PUBLIC_API_URL`: A URL que a Render te deu (ex: `https://api-vaultsend.onrender.com/api`).

---

## 4. Ajuste de CORS (Importante)
Após o deploy, você precisará atualizar o [main.ts](file:///c:/Users/vinic/Desktop/VaultSend/api/src/main.ts) da API para permitir requisições do seu novo domínio do Netlify:

```typescript
// No main.ts
app.enableCors({
  origin: ['http://localhost:3000', 'https://seu-site.netlify.app'],
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
});
```

---

## 5. Checklist Final
- [ ] O banco de dados Atlas está com o IP `0.0.0.0/0` permitido (ou o IP da Render).
- [ ] A URL da API no Frontend termina em `/api`.
- [ ] O site está usando HTTPS (Netlify e Render dão isso de graça).
