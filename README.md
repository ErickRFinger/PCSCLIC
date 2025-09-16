# PCs CLIC - Site de Catálogo de Produtos

## Descrição
Site de catálogo de produtos para PCs CLIC, desenvolvido com integração automática ao Google Sheets para sincronização de produtos em tempo real.

## Características
- **Design Moderno**: Interface com tema escuro usando cores laranja (#ff6b35) e azul escuro (#2c5aa0)
- **Integração Google Sheets**: Sincronização automática com planilha de produtos
- **Responsivo**: Adaptável para dispositivos móveis e desktop
- **Tempo Real**: Atualização automática dos produtos a cada 5 minutos
- **WhatsApp Integration**: Botões de compra direcionam para WhatsApp

## Estrutura de Arquivos
```
SITE CLIC/
├── index.html          # Página principal
├── styles.css          # Estilos CSS com tema laranja/azul escuro
├── script.js           # JavaScript com integração Google Sheets
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

## Licença
© 2024 PCs CLIC. Todos os direitos reservados.
