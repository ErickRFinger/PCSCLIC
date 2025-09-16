// Sistema Clic Sistemas - Integração com Google Sheets
// URL da planilha fornecida pelo usuário
const GOOGLE_SHEETS_URL = 'https://docs.google.com/spreadsheets/d/1b-5Azi9M7ySzPGj0vnyBWL5jdRpKMIhGyH5455B0S0g/edit?usp=sharing';

// Configurações de produção
const CONFIG = {
    SYNC_INTERVAL: 300000, // 5 minutos
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    CACHE_DURATION: 60000, // 1 minuto
    WHATSAPP_NUMBER: '5549920014159'
};

// Variáveis globais
let products = [];
let lastCheckedFiles = new Set();
let autoSyncInterval = null;
let cache = {
    data: null,
    timestamp: null,
    isValid: () => {
        if (!cache.data || !cache.timestamp) return false;
        return (Date.now() - cache.timestamp) < CONFIG.CACHE_DURATION;
    }
};

// Elementos DOM - inicializados após DOM carregar
let productsGrid, productModal, closeModal, modalBuyButton, mobileMenuToggle, nav;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeDOM();
    initializeApp();
});

// Inicializar elementos DOM
function initializeDOM() {
    productsGrid = document.getElementById('productsGrid');
    productModal = document.getElementById('productModal');
    closeModal = document.getElementById('closeModal');
    modalBuyButton = document.getElementById('modalBuyButton');
    mobileMenuToggle = document.getElementById('mobileMenuToggle');
    nav = document.getElementById('nav');
    
    console.log('Elementos DOM inicializados:', {
        productsGrid: !!productsGrid,
        productModal: !!productModal,
        mobileMenuToggle: !!mobileMenuToggle
    });
    
    // Event listeners do modal
    if (closeModal) {
        closeModal.addEventListener('click', closeProductModal);
    }
    
    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === productModal) {
                closeProductModal();
            }
        });
    }

    // Event listener do menu mobile
    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        
        // Fechar menu ao clicar em um link
        const navLinks = nav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
        
        // Fechar menu ao clicar fora dele
        document.addEventListener('click', function(e) {
            if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });
    }
}

// Funções do menu mobile
function toggleMobileMenu() {
    if (nav && mobileMenuToggle) {
        nav.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        
        // Prevenir scroll do body quando menu estiver aberto
        if (nav.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }
}

function closeMobileMenu() {
    if (nav && mobileMenuToggle) {
        nav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// PROXY PARA CONTORNAR CORS - FUNCIONA EM PRODUÇÃO
const PROXY_URLS = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest='
];

// BUSCAR DADOS DA PLANILHA COM PROXY E RETRY
async function fetchProductsFromGoogleSheetsWithProxy() {
    console.log('📊 Buscando produtos da planilha com proxy...');
    
    const sheetUrl = GOOGLE_SHEETS_URL.replace('/edit?usp=sharing', '/export?format=csv&gid=0');
    
    // Tentar diferentes proxies com retry
    for (let i = 0; i < PROXY_URLS.length; i++) {
        for (let attempt = 1; attempt <= CONFIG.RETRY_ATTEMPTS; attempt++) {
            try {
                const proxyUrl = PROXY_URLS[i] + encodeURIComponent(sheetUrl);
                console.log(`🔄 Tentando proxy ${i + 1}, tentativa ${attempt}: ${PROXY_URLS[i].split('/')[2]}`);
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
                
                const response = await fetch(proxyUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'text/csv',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const csvText = await response.text();
                    console.log('✅ Proxy funcionou! CSV carregado');
                    
                    // Atualizar cache
                    cache.data = csvText;
                    cache.timestamp = Date.now();
                    
                    return parseAndProcessProducts(csvText);
                }
            } catch (error) {
                console.log(`❌ Proxy ${i + 1}, tentativa ${attempt} falhou:`, error.message);
                if (attempt < CONFIG.RETRY_ATTEMPTS) {
                    await new Promise(resolve => setTimeout(resolve, CONFIG.RETRY_DELAY * attempt));
                }
            }
        }
    }
    
    // Se todos os proxies falharem, usar dados locais
    console.log('⚠️ Todos os proxies falharam, usando dados locais');
    return [];
}

// BUSCAR DADOS AUTOMATICAMENTE DA PLANILHA GOOGLE SHEETS
async function fetchProductsFromGoogleSheets() {
    console.log('📊 Buscando produtos da planilha Google Sheets...');
    
    // Verificar cache primeiro
    if (cache.isValid()) {
        console.log('📦 Usando dados do cache');
        return parseAndProcessProducts(cache.data);
    }
    
    // Tentar primeiro sem proxy (funciona em servidores)
    try {
        const sheetUrl = GOOGLE_SHEETS_URL.replace('/edit?usp=sharing', '/export?format=csv&gid=0');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        const response = await fetch(sheetUrl, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
            const csvText = await response.text();
            console.log('✅ Acesso direto funcionou');
            
            // Atualizar cache
            cache.data = csvText;
            cache.timestamp = Date.now();
            
            return parseAndProcessProducts(csvText);
        }
    } catch (error) {
        console.log('⚠️ Acesso direto falhou, tentando proxy:', error.message);
    }
    
    // Se falhar, usar proxy
    return await fetchProductsFromGoogleSheetsWithProxy();
}

// PROCESSAR PRODUTOS DO CSV
function parseAndProcessProducts(csvText) {
    const parsedProducts = parseCSV(csvText);
    
    console.log('📊 Dados brutos da planilha:', parsedProducts);
    
    const productsFromSheet = parsedProducts.map(row => {
        console.log('🔍 Processando linha:', row);
        
        const priceString = row['VALOR'].replace('R$', '').replace('.', '').replace(',', '.').trim();
        const price = parseFloat(priceString);
        
        // Corrigir parsing do estoque
        let stock = parseInt(row['ESTOQUE'], 10);
        
        // Se não conseguir parsear, usar valor padrão
        if (isNaN(stock) || stock === 0) {
            stock = 1; // Valor padrão
        }

        // Converter URL do Imgur para formato direto
        let imageUrl = row['FOTO'];
        if (imageUrl && imageUrl.trim() !== '') {
            // Limpar espaços e caracteres especiais
            imageUrl = imageUrl.trim();
            
            if (imageUrl.includes('imgur.com')) {
                // Converter diferentes formatos do Imgur
                if (imageUrl.includes('/a/')) {
                    // Album: https://imgur.com/a/abc123 -> não pode converter diretamente
                    console.log('⚠️ URL de album do Imgur detectada:', imageUrl);
                    imageUrl = 'https://via.placeholder.com/400x300/ff6b35/ffffff?text=Album+Imgur';
                } else if (imageUrl.includes('i.imgur.com')) {
                    // Já está no formato correto
                    console.log('✅ URL do Imgur já está no formato correto');
                } else {
                    // Converter https://imgur.com/p8jsjyx para https://i.imgur.com/p8jsjyx.jpg
                    const imgurId = imageUrl.split('/').pop().split('?')[0]; // Remove query params
                    imageUrl = `https://i.imgur.com/${imgurId}.jpg`;
                    console.log('🔄 URL do Imgur convertida:', imageUrl);
                }
            } else if (imageUrl.includes('drive.google.com')) {
                // Converter Google Drive para formato direto
                const fileId = imageUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
                if (fileId) {
                    imageUrl = `https://drive.google.com/uc?id=${fileId[1]}`;
                    console.log('🔄 URL do Google Drive convertida:', imageUrl);
                }
            } else if (!imageUrl.startsWith('http')) {
                // Se não começar com http, usar placeholder
                console.log('⚠️ URL inválida, usando placeholder:', imageUrl);
                imageUrl = 'https://via.placeholder.com/400x300/ff6b35/ffffff?text=Imagem+Não+Disponível';
            }
        } else {
            // Se não há URL, usar placeholder
            imageUrl = 'https://via.placeholder.com/400x300/ff6b35/ffffff?text=Sem+Imagem';
        }

        const product = {
            id: row['ID DO PRODUTO'] || Date.now() + Math.random(),
            name: row['NOME DO PRODUTO'],
            description: row['DESCRIÇÃO'],
            price: isNaN(price) ? 0 : price,
            image_url: imageUrl,
            category: (row['CATEGORIA'] && row['CATEGORIA'].trim() !== '') ? row['CATEGORIA'].trim().toUpperCase() : 'PC MONTADO',
            stock: stock,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log(`✅ Produto processado: ${product.name} - R$ ${product.price} (Categoria: ${product.category})`);
        return product;
    }).filter(p => p.name && p.price > 0);
    
    console.log(`✅ ${productsFromSheet.length} produtos processados`);
    return productsFromSheet;
}

// PARSER CSV MELHORADO
function parseCSV(csvString) {
    const lines = csvString.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i];
        const values = [];
        let inQuote = false;
        let currentField = '';

        for (let j = 0; j < currentLine.length; j++) {
            const char = currentLine[j];
            if (char === '"') {
                inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
                values.push(currentField.trim().replace(/"/g, ''));
                currentField = '';
            } else {
                currentField += char;
            }
        }
        values.push(currentField.trim().replace(/"/g, '')); // Add the last field

        if (values.length === headers.length) {
            const rowObject = {};
            headers.forEach((header, index) => {
                rowObject[header] = values[index];
            });
            data.push(rowObject);
        }
    }
    return data;
}

// FORÇAR DADOS DA PLANILHA - BUSCA AUTOMÁTICA
async function forceCorrectData() {
    console.log('🎯 Buscando dados automaticamente da planilha...');
    
    // Buscar dados da planilha
    const productsFromSheet = await fetchProductsFromGoogleSheets();
    
    if (productsFromSheet.length > 0) {
        console.log('📊 DADOS DA PLANILHA CARREGADOS AUTOMATICAMENTE:');
        productsFromSheet.forEach(p => {
            console.log(`   ✅ ${p.name}: R$ ${p.price.toFixed(2)} (Categoria: ${p.category})`);
        });
        
        // Atualizar produtos
        products = productsFromSheet;
        
        // Renderizar produtos
        renderProducts();
        
        console.log('✅ Sistema sincronizado automaticamente com a planilha!');
    } else {
        console.log('⚠️ Não foi possível carregar da planilha, usando dados de exemplo');
        // Dados de exemplo baseados na planilha
        products = [
            {
                id: 1,
                name: 'PC 1 - I3 8100',
                description: 'I3 8100 - 4GB DE MEMÓRIA RAM - SSD DE 120GB',
                price: 1000.00,
                image_url: 'https://via.placeholder.com/400x300/ff6b35/ffffff?text=PC+I3+8100',
                category: 'PC MONTADO',
                stock: 1
            },
            {
                id: 2,
                name: 'PC 2 - I3 8100',
                description: 'I3 8100 - 4GB DE MEMÓRIA RAM - SSD DE 120GB',
                price: 1000.00,
                image_url: 'https://via.placeholder.com/400x300/2c5aa0/ffffff?text=PC+I3+8100',
                category: 'PC MONTADO',
                stock: 1
            },
            {
                id: 3,
                name: 'PC 11 - I3 10100',
                description: 'I3 10100 - 8GB DE MEMÓRIA RAM - SSD DE 240GB',
                price: 1100.00,
                image_url: 'https://via.placeholder.com/400x300/ff6b35/ffffff?text=PC+I3+10100',
                category: 'PC MONTADO',
                stock: 1
            },
            {
                id: 4,
                name: 'PC 15 - RYZEN 3 2200G',
                description: 'RYZEN 3 2200G - 4GB DE MEMÓRIA RAM - SSD DE 120GB',
                price: 1100.00,
                image_url: 'https://via.placeholder.com/400x300/2c5aa0/ffffff?text=PC+RYZEN+3',
                category: 'PC MONTADO',
                stock: 1
            },
            {
                id: 5,
                name: 'PC 17 - RYZEN 5 3400G',
                description: 'RYZEN 5 3400 - 8GB DE MEMÓRIA RAM - SSD DE 120GB (SEM VGA)',
                price: 1400.00,
                image_url: 'https://via.placeholder.com/400x300/ff6b35/ffffff?text=PC+RYZEN+5',
                category: 'PC MONTADO',
                stock: 1
            },
            {
                id: 6,
                name: 'PC 18 - RYZEN 5 3400G',
                description: 'RYZEN 5 3400 - 8GB DE MEMÓRIA RAM - SSD DE 240GB',
                price: 1400.00,
                image_url: 'https://via.placeholder.com/400x300/2c5aa0/ffffff?text=PC+RYZEN+5',
                category: 'PC MONTADO',
                stock: 1
            }
        ];
        renderProducts();
    }
}

// Inicializar aplicação
async function initializeApp() {
    console.log('🚀 Inicializando Clic Sistemas com dados da planilha...');
    
    try {
        // Usar os dados da planilha
        await forceCorrectData();
        
        // Inicializar sincronização automática
        startAutoSync();
        
    } catch (error) {
        console.error('Erro ao inicializar aplicação:', error);
        await forceCorrectData();
    }
}

// Renderizar produtos
function renderProducts() {
    if (!productsGrid) {
        console.error('productsGrid não encontrado');
        return;
    }
    
    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="no-products">
                <i class="fas fa-box-open"></i>
                <h3>Nenhum produto encontrado</h3>
                <p>Os produtos serão carregados automaticamente da planilha Google Sheets.</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image-container" onclick="openProductModal(${product.id})">
                <img src="${product.image_url}" alt="${product.name}" class="product-image"
                     onload="console.log('✅ Imagem carregou:', '${product.name}')"
                     onerror="console.log('❌ Erro ao carregar:', '${product.name}'); this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTI1SDIyNVYxNzVIMTc1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSIxODUiIHk9IjEzNSIgd2lkdGg9IjMwIiBoZWlnaHQ9IjMwIiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJTNi40OCAyMiAxMiAyMiAyMiAxNy41MiAyMiAxMiAxNy41MiAyIDEyIDJaTTEzIDE3SDEwVjE1SDEzVjE3Wk0xMyAxM0gxMFY3SDEzVjEzWiIgZmlsbD0iI0ZGRkZGRiIvPgo8L3N2Zz4KPC9zdmc+'; this.alt='Imagem não disponível';">
            </div>
            <div class="product-info">
                <h3 class="product-name" onclick="openProductModal(${product.id})">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">R$ ${product.price.toFixed(2)}</div>
                <div class="product-category-badge">${product.category.toUpperCase()}</div>
                <button class="btn btn-whatsapp-card" onclick="buyProduct('${product.name}', ${product.price})">
                    <i class="fab fa-whatsapp"></i>
                    COMPRAR AGORA
                </button>
            </div>
        </div>
    `).join('');
}

// Funções auxiliares
function startAutoSync() {
    // Sincronização em tempo real baseada na configuração
    autoSyncInterval = setInterval(async () => {
        console.log('🔄 Sincronização em tempo real da planilha...');
        
        try {
            // Buscar dados frescos da planilha
            const productsFromSheet = await fetchProductsFromGoogleSheets();
            
            if (productsFromSheet.length > 0) {
                // Atualizar produtos
                products = productsFromSheet;
                renderProducts();
                
                console.log('✅ Sincronização concluída - dados atualizados');
            }
            
        } catch (error) {
            console.log('⚠️ Erro na sincronização:', error.message);
        }
    }, CONFIG.SYNC_INTERVAL);
    
    console.log(`⚡ SINCRONIZAÇÃO EM TEMPO REAL ATIVADA - verificando planilha a cada ${CONFIG.SYNC_INTERVAL / 60000} minutos`);
}

// Função para abrir modal do produto
function openProductModal(productId) {
    const product = products.find(p => p.id == productId);
    if (!product || !productModal) return;
    
    // Preencher dados do modal
    document.getElementById('modalProductImage').src = product.image_url;
    document.getElementById('modalProductImage').alt = product.name;
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalProductCategory').textContent = product.category.toUpperCase();
    document.getElementById('modalProductDescription').textContent = product.description;
    document.getElementById('modalProductPrice').textContent = `R$ ${product.price.toFixed(2)}`;
    
    // Configurar botão de compra
    if (modalBuyButton) {
        modalBuyButton.onclick = () => buyProduct(product.name, product.price);
    }
    
    // Mostrar modal
    productModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    console.log('Modal aberto para produto:', product.name);
}

// Função para fechar modal do produto
function closeProductModal() {
    if (productModal) {
        productModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        console.log('Modal fechado');
    }
}

// Função para rolar até os produtos
function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Função para comprar produto via WhatsApp
function buyProduct(productName, productPrice) {
    const phoneNumber = CONFIG.WHATSAPP_NUMBER;
    const message = `Olá! Gostaria de adquirir o computador: *${productName}* por R$ ${productPrice.toFixed(2)}. 

Este computador possui as seguintes especificações:
• ${productName}
• Preço: R$ ${productPrice.toFixed(2)}

Podem me ajudar com mais informações sobre disponibilidade e formas de pagamento?`;
    
    // Codificar a mensagem para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Criar URL do WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp em nova aba
    window.open(whatsappUrl, '_blank');
    
    console.log(`🛒 Compra iniciada: ${productName} - R$ ${productPrice.toFixed(2)}`);
}

// Função para forçar atualização imediata da planilha
async function forcarAtualizacaoImediata() {
    console.log('🔄 FORÇANDO ATUALIZAÇÃO IMEDIATA DA PLANILHA...');
    
    // Mostrar indicador de carregamento
    try {
        // Buscar dados frescos da planilha
        const produtosNovos = await fetchProductsFromGoogleSheets();
        
        if (produtosNovos.length > 0) {
            console.log('✅ DADOS FRESCOS RECEBIDOS:', produtosNovos.length, 'produtos');
            
            // Atualizar produtos
            products = produtosNovos;
            
            // Renderizar imediatamente
            renderProducts();
            
            console.log('✅ ATUALIZAÇÃO IMEDIATA CONCLUÍDA!');
            return produtosNovos;
        } else {
            console.log('❌ Nenhum produto encontrado na planilha');
            return [];
        }
        
    } catch (error) {
        console.error('❌ ERRO na atualização imediata:', error);
        return [];
    }
}

// Tornar funções globais para uso no HTML
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.buyProduct = buyProduct;
window.forcarAtualizacaoImediata = forcarAtualizacaoImediata;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;

// Detectar dispositivo móvel
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           window.innerWidth <= 768;
}

// Melhorar experiência touch
function enhanceTouchExperience() {
    if (isMobileDevice()) {
        // Adicionar classe mobile ao body
        document.body.classList.add('mobile-device');
        
        // Melhorar botões para touch
        const buttons = document.querySelectorAll('.btn, .btn-whatsapp-card, .btn-hero, .btn-whatsapp-contact');
        buttons.forEach(button => {
            button.style.minHeight = '44px'; // Tamanho mínimo recomendado para touch
            button.style.minWidth = '44px';
        });
        
        // Melhorar links de navegação
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.style.minHeight = '44px';
            link.style.display = 'flex';
            link.style.alignItems = 'center';
        });
        
        console.log('📱 Experiência mobile otimizada');
    }
}

// Executar quando a página carregar
window.addEventListener('load', () => {
    console.log('🚀 Clic Sistemas - Sistema carregado!');
    console.log('📊 Integração com Google Sheets ativa');
    console.log('🔗 URL da planilha:', GOOGLE_SHEETS_URL);
    
    // Otimizar para mobile
    enhanceTouchExperience();
    
    // Detectar orientação e redimensionamento
    window.addEventListener('resize', () => {
        enhanceTouchExperience();
    });
    
    // Detectar mudança de orientação
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            enhanceTouchExperience();
        }, 100);
    });
});

console.log('🚀 Clic Sistemas - Sistema de integração com Google Sheets carregado!');
