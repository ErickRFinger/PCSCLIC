# PCs CLIC - Site de Catálogo de Produtos

## Descrição
Site de catálogo de produtos para PCs CLIC, desenvolvido com integração automática ao Google Sheets para sincronização de produtos em tempo real.

## Características
- **Design Moderno**: Interface com tema escuro usando cores laranja (#ff6b35) e azul escuro (#2c5aa0)
- **Integração Google Sheets**: Sincronização automática com planilha de produtos
- **Responsivo**: Adaptável para dispositivos móveis e desktop
- **Tempo Real**: Atualização automática dos produtos a cada 5 minutos
- **WhatsApp Integration**: Botões de compra direcionam para WhatsApp
- **Deploy Automático**: Configurado para GitHub + Render.com

## Estrutura de Arquivos
```
PCSCLIC-main/
├── index.html          # Página principal
├── styles.css          # Estilos CSS com tema laranja/azul escuro
├── script.js           # JavaScript com integração Google Sheets
├── package.json        # Configuração do projeto Node.js
├── render.yaml         # Configuração para deploy no Render.com
├── .gitignore          # Arquivos ignorados pelo Git
├── LOGOS/
│   └── logo.png        # Logo laranja da empresa
└── README.md           # Este arquivo
```

## Funcionalidades

### 1. Integração com Google Sheets
- Busca automática de produtos da planilha
- Sincronização em tempo real (a cada 5 minutos)
- Suporte a múltiplos proxies para contornar CORS
- Fallback para dados locais em caso de erro

### 2. Sistema de Produtos
- Exibição de produtos em grid responsivo
- Informações: nome, descrição, preço, categoria, estoque
- Imagens com fallback automático
- Botões de compra via WhatsApp

### 3. Design e UX
- Tema escuro moderno
- Gradientes laranja e azul escuro
- Animações suaves e efeitos hover
- Design responsivo para mobile

## Configuração

### 1. URL da Planilha
A URL da planilha Google Sheets está configurada no arquivo `script.js`:
```javascript
const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1b-5Azi9M7ySzPGj0vnyBWL5jdRpKMIhGyH5455B0S0g/edit?usp=sharing';
```

### 2. Estrutura da Planilha
A planilha deve conter as seguintes colunas:
- **NOME DO PRODUTO**: Nome do produto
- **ID DO PRODUTO**: ID único do produto
- **DESCRIÇÃO**: Descrição detalhada
- **FOTO**: URL da imagem do produto
- **ESTOQUE**: Quantidade em estoque
- **VALOR**: Preço do produto (formato: R$ 1.000,00)
- **CATEGORIA**: Categoria do produto

### 3. Contato WhatsApp
Para alterar o número do WhatsApp, edite no arquivo `script.js`:
```javascript
const phoneNumber = '5549999999999'; // Substitua pelo número correto
```

## Cores do Tema
- **Laranja Principal**: #ff6b35
- **Laranja Claro**: #ff8c42
- **Azul Escuro**: #2c5aa0
- **Azul Claro**: #4a90e2
- **Fundo Escuro**: #1a1a2e
- **Fundo Secundário**: #16213e

## Como Usar

### 1. Executar Localmente
1. Abra o arquivo `index.html` em um navegador
2. O site carregará automaticamente os produtos da planilha
3. Use os botões de compra para contatar via WhatsApp

### 2. Deploy
1. Faça upload dos arquivos para um servidor web
2. Certifique-se de que a planilha Google Sheets está pública
3. O site funcionará automaticamente

## Funcionalidades Avançadas

### Sincronização Manual
Para forçar atualização imediata da planilha, execute no console do navegador:
```javascript
forcarAtualizacaoImediata();
```

### Debug
O sistema possui logs detalhados no console para debug:
- Carregamento de produtos
- Erros de sincronização
- Status de imagens
- Processamento de dados

## Tecnologias Utilizadas
- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos com variáveis CSS
- **JavaScript ES6+**: Funcionalidades dinâmicas
- **Google Sheets API**: Integração de dados
- **Font Awesome**: Ícones
- **Proxies CORS**: Para acesso à planilha

## Suporte
Para suporte ou dúvidas sobre o sistema, verifique:
1. Console do navegador para logs de erro
2. Status de sincronização na página
3. Conectividade com a planilha Google Sheets

## 🚀 Deploy no GitHub + Render.com

### Passo 1: Preparar o Repositório GitHub

1. **Criar repositório no GitHub:**
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

2. **Configurar repositório público:**
   - Certifique-se de que o repositório está público
   - Adicione uma descrição: "Catálogo de produtos PCs CLIC"

### Passo 2: Deploy no Render.com

1. **Acesse [Render.com](https://render.com) e faça login**

2. **Criar novo serviço:**
   - Clique em "New +"
   - Selecione "Web Service"
   - Conecte sua conta GitHub

3. **Configurar o serviço:**
   ```
   Name: pcs-clic-catalog
   Environment: Static Site
   Build Command: npm install && npm run build
   Start Command: npx http-server . -p $PORT
   ```

4. **Configurações avançadas:**
   - **Branch:** main
   - **Root Directory:** (deixe vazio)
   - **Environment:** Node
   - **Node Version:** 18.x

5. **Variáveis de ambiente (opcional):**
   ```
   NODE_ENV=production
   ```

6. **Deploy:**
   - Clique em "Create Web Service"
   - Aguarde o build (2-3 minutos)
   - Seu site estará disponível em: `https://pcs-clic-catalog.onrender.com`

### Passo 3: Configurações Pós-Deploy

1. **Atualizar URLs no código (se necessário):**
   - Edite `script.js` se precisar alterar URLs de API
   - Edite `package.json` com a URL correta do seu repositório

2. **Configurar domínio personalizado (opcional):**
   - No Render.com, vá em Settings > Custom Domains
   - Adicione seu domínio personalizado

### Passo 4: Monitoramento

1. **Logs do Render:**
   - Acesse a aba "Logs" no dashboard do Render
   - Monitore erros e performance

2. **Atualizações automáticas:**
   - Cada push no GitHub aciona novo deploy
   - O site atualiza automaticamente

## 🔧 Comandos Úteis

### Desenvolvimento Local
```bash
# Instalar dependências
npm install

# Executar localmente
npm start

# Modo desenvolvimento
npm run dev
```

### Git Workflow
```bash
# Fazer alterações e enviar
git add .
git commit -m "Descrição das alterações"
git push origin main
```

### Verificar Deploy
```bash
# Verificar status do site
curl -I https://pcs-clic-catalog.onrender.com

# Testar funcionalidades
# Acesse o site e teste:
# - Carregamento de produtos
# - Botões de WhatsApp
# - Responsividade mobile
```

## 📱 Teste de Funcionalidades

Após o deploy, teste:

1. **✅ Carregamento da página**
2. **✅ Exibição dos produtos da planilha**
3. **✅ Botões de compra WhatsApp**
4. **✅ Responsividade mobile**
5. **✅ Sincronização automática (aguarde 5 minutos)**

## 🆘 Solução de Problemas

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

## 📞 Suporte

Para suporte técnico:
1. Verifique os logs do Render.com
2. Console do navegador (F12)
3. Status da planilha Google Sheets
4. Conectividade de rede

## Licença
© 2024 PCs CLIC. Todos os direitos reservados.
