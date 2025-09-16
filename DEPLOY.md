# 🚀 Guia de Deploy - Clic Sistemas

## Pré-requisitos
- Conta no GitHub
- Conta no Render.com
- Git instalado no computador

## Passo 1: Preparar o Repositório GitHub

### 1.1 Criar repositório no GitHub
1. Acesse [github.com](https://github.com)
2. Clique em "New repository"
3. Nome: `pcs-clic-catalog`
4. Descrição: `Catálogo de produtos PCs CLIC com integração Google Sheets`
5. Marque como **Público**
6. Clique em "Create repository"

### 1.2 Enviar código para GitHub
```bash
# No terminal, navegue até a pasta do projeto
cd PCSCLIC-main

# Inicializar Git (se ainda não foi feito)
git init

# Adicionar arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit: PCs CLIC catalog with Google Sheets integration"

# Conectar ao repositório GitHub (substitua pela sua URL)
git remote add origin https://github.com/SEU-USUARIO/pcs-clic-catalog.git

# Enviar para GitHub
git push -u origin main
```

## Passo 2: Deploy no Render.com

### 2.1 Acessar Render.com
1. Acesse [render.com](https://render.com)
2. Faça login com sua conta GitHub
3. Clique em "New +"

### 2.2 Criar Web Service
1. Selecione "Web Service"
2. Conecte sua conta GitHub
3. Selecione o repositório `pcs-clic-catalog`

### 2.3 Configurar o serviço
```
Name: pcs-clic-catalog
Environment: Static Site
Build Command: npm install && npm run build
Start Command: npx http-server . -p $PORT
```

### 2.4 Configurações avançadas
- **Branch:** main
- **Root Directory:** (deixe vazio)
- **Environment:** Node
- **Node Version:** 18.x

### 2.5 Variáveis de ambiente
```
NODE_ENV=production
```

### 2.6 Deploy
1. Clique em "Create Web Service"
2. Aguarde o build (2-3 minutos)
3. Seu site estará disponível em: `https://pcs-clic-catalog.onrender.com`

## Passo 3: Verificar Deploy

### 3.1 Testar funcionalidades
1. **✅ Carregamento da página**
2. **✅ Exibição dos produtos da planilha**
3. **✅ Botões de compra WhatsApp**
4. **✅ Responsividade mobile**
5. **✅ Sincronização automática (aguarde 5 minutos)**

### 3.2 Monitorar logs
- Acesse o dashboard do Render.com
- Vá na aba "Logs" para verificar erros
- Monitore performance e uptime

## Passo 4: Atualizações Futuras

### 4.1 Fazer alterações
```bash
# Fazer alterações nos arquivos
# Adicionar ao Git
git add .

# Commit das alterações
git commit -m "Descrição das alterações"

# Enviar para GitHub
git push origin main
```

### 4.2 Deploy automático
- O Render.com detecta automaticamente mudanças no GitHub
- Novo deploy é iniciado automaticamente
- Aguarde 2-3 minutos para o site atualizar

## Solução de Problemas

### Site não carrega
- Verifique os logs no Render.com
- Confirme que o repositório está público
- Verifique se o build foi bem-sucedido

### Produtos não aparecem
- Verifique se a planilha Google Sheets está pública
- Confirme a URL da planilha no `script.js`
- Verifique o console do navegador para erros

### WhatsApp não funciona
- Verifique o número no `script.js`
- Teste em dispositivo móvel
- Confirme formato do número (+55...)

## URLs Importantes

- **GitHub:** https://github.com/SEU-USUARIO/pcs-clic-catalog
- **Render Dashboard:** https://dashboard.render.com
- **Site Deployado:** https://pcs-clic-catalog.onrender.com
- **Planilha:** https://docs.google.com/spreadsheets/d/1b-5Azi9M7ySzPGj0vnyBWL5jdRpKMIhGyH5455B0S0g/edit?usp=sharing

## Suporte

Para suporte técnico:
1. Verifique os logs do Render.com
2. Console do navegador (F12)
3. Status da planilha Google Sheets
4. Conectividade de rede

---
**© 2025 Clic Sistemas. Todos os direitos reservados.**
