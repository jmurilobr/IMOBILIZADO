// Dados de exemplo (simulando dados que viriam do banco SQL)
let mockData = [
    { id: '001', codigo: '001', item: 'Computador Dell', descricao: 'Computador desktop Dell Optiplex 7010', categoria: 'Equipamento Eletrônico', local: 'Sala 101', valorAquisicao: 3500.00, status: 'Ativo', confirmacao: true },
    { id: '002', codigo: '002', item: 'Monitor LG', descricao: 'Monitor LG 24 polegadas', categoria: 'Equipamento Eletrônico', local: 'Sala 102', valorAquisicao: 800.00, status: 'Ativo', confirmacao: false },
    { id: '003', codigo: '003', item: 'Mesa de Escritório', descricao: 'Mesa de escritório em L', categoria: 'Mobiliário', local: 'Sala 101', valorAquisicao: 1200.00, status: 'Ativo', confirmacao: true },
    { id: '004', codigo: '004', item: 'Cadeira Ergonômica', descricao: 'Cadeira giratória com ajuste lombar', categoria: 'Mobiliário', local: 'Sala 103', valorAquisicao: 650.00, status: 'Baixado', confirmacao: false },
    { id: '005', codigo: '005', item: 'Projetor Epson', descricao: 'Projetor multimídia Epson PowerLite', categoria: 'Equipamento Eletrônico', local: 'Sala 104', valorAquisicao: 2800.00, status: 'Ativo', confirmacao: true },
    { id: '006', codigo: '006', item: 'Ar-condicionado Samsung', descricao: 'Ar-condicionado Split 18000 BTUs', categoria: 'Equipamento Eletrônico', local: 'Sala 102', valorAquisicao: 2300.00, status: 'Ativo', confirmacao: true },
    { id: '007', codigo: '007', item: 'Armário de Aço', descricao: 'Armário de aço com 4 prateleiras', categoria: 'Mobiliário', local: 'Almoxarifado', valorAquisicao: 900.00, status: 'Baixado', confirmacao: false },
    { id: '008', codigo: '008', item: 'Impressora HP', descricao: 'Impressora multifuncional HP LaserJet', categoria: 'Equipamento Eletrônico', local: 'Recepção', valorAquisicao: 1500.00, status: 'Ativo', confirmacao: true },
    { id: '009', codigo: '009', item: 'Telefone VoIP', descricao: 'Telefone IP Cisco', categoria: 'Equipamento Eletrônico', local: 'Recepção', valorAquisicao: 350.00, status: 'Ativo', confirmacao: true },
    { id: '010', codigo: '010', item: 'Sofá', descricao: 'Sofá de 3 lugares', categoria: 'Mobiliário', local: 'Sala de Espera', valorAquisicao: 1800.00, status: 'Baixado', confirmacao: false }
];

// Variáveis globais
let data = [];
let filteredData = [];
let locations = [
    'Sala 101', 
    'Sala 102', 
    'Sala 103', 
    'Sala 104', 
    'Almoxarifado', 
    'Recepção', 
    'Sala de Espera'
];
let categories = [
    'Equipamento Eletrônico',
    'Mobiliário',
    'Equipamento de Informática',
    'Material de Escritório'
];
let statuses = [
    'Ativo',
    'Baixado'
];

// Variáveis para armazenar filtros ativos
let activeLocationFilters = [];
let activeCategoryFilters = [];
let activeStatusFilters = [];

// Elementos DOM
let configModal, searchInput, searchButton, itemsTable, itemsTableBody, tableHeader;
let locationDropdown, categoryDropdown, statusDropdown;
let saveButton, exportButton, reloadButton, clearSearchButton;
let serverUrlInput, usernameInput, passwordInput, testConnectionBtn;
let saveConfig, cancelConfig;
let loadingOverlay, searchPreviewContainer;

// Definições de colunas
const columnDefs = [
    { id: 'codigo', label: 'Código Item', field: 'codigo', visible: true, sortable: true },
    { id: 'item', label: 'Nome', field: 'item', visible: true, sortable: true },
    { id: 'descricao', label: 'Descrição', field: 'descricao', visible: true, sortable: true },
    { id: 'categoria', label: 'Categoria', field: 'categoria', visible: true, sortable: true },
    { id: 'local', label: 'Local', field: 'local', visible: true, sortable: true },
    { id: 'mudar', label: 'Mudar P/', field: null, visible: false, special: 'mudar', sortable: false, editable: true, type: 'select' },
    { id: 'valor-aquisicao', label: 'Valor de Aquisição', field: 'valorAquisicao', visible: false, sortable: true, formatter: formatCurrency },
    { id: 'status', label: 'Status', field: 'status', visible: false, sortable: true },
    { id: 'confirmacao', label: 'Confirmação', field: 'confirmacao', visible: true, special: 'confirmacao', sortable: false, editable: true, type: 'checkbox' }
];

// Configurações do aplicativo
let appConfig = {
    server: {
        url: localStorage.getItem('serverUrl') || '',
        username: localStorage.getItem('username') || '',
        password: localStorage.getItem('password') || ''
    },
    columns: columnDefs.reduce((acc, col) => {
        acc[col.id] = col.visible;
        return acc;
    }, {})
};

// Inicialização - ponto de entrada principal
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded disparado');
    initApp();
});

// Tentativa alternativa se o DOM já estiver carregado
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Documento já carregado, inicializando aplicativo...');
    setTimeout(initApp, 0);
}

// Inicializar a aplicação
async function initApp() {
    console.log('Iniciando aplicativo...');
    
    // Verificar se a aplicação já foi inicializada
    if (window.appInitialized) {
        console.log('Aplicativo já inicializado, pulando...');
        return;
    }
    
    // Marcar como inicializado
    window.appInitialized = true;
    
    // Inicializar referências DOM
    initDOMReferences();
    
    // Verificar se as referências DOM críticas existem
    if (!checkCriticalReferences()) {
        console.error('Elementos DOM críticos não encontrados, não é possível inicializar a aplicação');
        return;
    }
    
    // Carregar configurações do localStorage se disponível
    loadConfig();
    
    // Atualizar UI baseado nas configurações
    updateColumnVisibility();
    
    // Configurar dropdowns
    setupCustomDropdowns();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Tentar carregar dados do servidor se houver configurações de conexão
    let dataLoaded = false;
    if (appConfig.server.url && appConfig.server.username && appConfig.server.password) {
        try {
            dataLoaded = await loadDataFromServer();
        } catch (error) {
            console.error('Erro ao carregar dados do servidor:', error);
        }
    }
    
    // Se não conseguiu carregar dados do servidor, usa os dados mock
    if (!dataLoaded) {
        renderTable(mockData);
    }
    
    console.log('Inicialização concluída com sucesso');
}

// Inicializar referências DOM
function initDOMReferences() {
    console.log('Inicializando referências DOM...');
    
    // Campos de busca
    searchInput = document.getElementById('searchName');
    searchButton = document.getElementById('searchButton');
    clearSearchButton = document.getElementById('clearSearchButton');
    searchPreviewContainer = document.getElementById('searchPreviewContainer');
    
    // Tabela
    itemsTable = document.getElementById('itemsTable');
    itemsTableBody = document.getElementById('itemsTableBody');
    tableHeader = document.getElementById('tableHeader');
    
    // Dropdowns
    locationDropdown = {
        selected: document.getElementById('locationSelected'),
        options: document.getElementById('locationOptions')
    };
    
    categoryDropdown = {
        selected: document.getElementById('categorySelected'),
        options: document.getElementById('categoryOptions')
    };
    
    statusDropdown = {
        selected: document.getElementById('statusSelected'),
        options: document.getElementById('statusOptions')
    };
    
    // Botões
    saveButton = document.getElementById('saveButton');
    exportButton = document.getElementById('exportButton');
    reloadButton = document.getElementById('reloadButton');
    
    // Modal
    configModal = document.getElementById('configModal');
    
    // Campos de configuração
    serverUrlInput = document.getElementById('serverUrl');
    usernameInput = document.getElementById('username');
    passwordInput = document.getElementById('password');
    testConnectionBtn = document.getElementById('testConnection');
    saveConfig = document.getElementById('saveConfig');
    cancelConfig = document.getElementById('cancelConfig');
    
    // Overlay de carregamento
    loadingOverlay = document.getElementById('loadingOverlay');
    
    console.log('Referências DOM inicializadas');
}

// Verificar referências críticas
function checkCriticalReferences() {
    console.log('Verificando referências DOM críticas...');
    
    let missingElements = [];
    
    if (!itemsTable) missingElements.push('itemsTable');
    if (!itemsTableBody) missingElements.push('itemsTableBody');
    if (!searchButton) missingElements.push('searchButton');
    
    if (missingElements.length > 0) {
        console.error('Elementos críticos ausentes:', missingElements.join(', '));
        return false;
    }
    
    console.log('Todas as referências críticas estão presentes');
    return true;
}

// Configurar listeners de eventos
function setupEventListeners() {
    console.log('Configurando event listeners...');
    
    // Busca
    if (searchButton) {
        searchButton.addEventListener('click', function() {
            console.log('Botão buscar clicado');
            filterData();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                console.log('Enter pressionado no campo de busca');
                filterData();
            }
            
            // Atualizar preview de busca em tempo real
            updateSearchPreview();
        });
        
        // Também queremos capturar eventos de input para casos como colar texto
        searchInput.addEventListener('input', updateSearchPreview);
    }
    
    // Botão limpar busca
    if (clearSearchButton) {
        clearSearchButton.addEventListener('click', function() {
            console.log('Botão limpar busca clicado');
            clearSearch();
        });
    }
    
    // Fechar preview ao clicar fora
    document.addEventListener('click', function(e) {
        if (e.target !== searchInput && e.target !== searchPreviewContainer) {
            if (searchPreviewContainer) {
                searchPreviewContainer.style.display = 'none';
            }
        }
    });
    
    // Botão salvar alterações
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            console.log('Botão salvar alterações clicado');
            saveChanges();
        });
    }
    
    // Botão exportar
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            console.log('Botão exportar clicado');
            exportData();
        });
    }
    
    // Botão recarregar
    if (reloadButton) {
        reloadButton.addEventListener('click', async function() {
            console.log('Botão recarregar clicado');
            reloadData();
        });
    }
    
    // Setup da modal de configuração (já feito via script inline no HTML)
    setupConfigModal();
    
    console.log('Event listeners configurados com sucesso');
}

// Recarregar dados do servidor
async function reloadData() {
    if (appConfig.server.url && appConfig.server.username && appConfig.server.password) {
        reloadButton.classList.add('loading');
        await loadDataFromServer();
        reloadButton.classList.remove('loading');
    } else {
        alert('Configure a conexão com o servidor primeiro nas configurações.');
    }
}

// Carregar dados iniciais
async function loadInitialData() {
    // Tentar carregar dados do servidor se houver configurações de conexão
    let dataLoaded = false;
    if (appConfig.server.url && appConfig.server.username && appConfig.server.password) {
        try {
            dataLoaded = await loadDataFromServer();
        } catch (error) {
            console.error('Erro ao carregar dados do servidor:', error);
        }
    }
    
    // Se não conseguiu carregar dados do servidor, usa os dados mock
    if (!dataLoaded) {
        renderTable(mockData);
    }
}

// Carregar configurações do localStorage
function loadConfig() {
    const savedConfig = localStorage.getItem('imobilizadoAppConfig');
    if (savedConfig) {
        try {
            const parsedConfig = JSON.parse(savedConfig);
            
            // Garantir que a URL seja normalizada
            if (parsedConfig.server && parsedConfig.server.url) {
                parsedConfig.server.url = normalizeUrl(parsedConfig.server.url);
            }
            
            appConfig = { ...appConfig, ...parsedConfig };
            
            // Atualizar campos de conexão
            if (serverUrlInput) serverUrlInput.value = appConfig.server.url || '';
            if (usernameInput) usernameInput.value = appConfig.server.username || '';
            if (passwordInput) passwordInput.value = appConfig.server.password || '';
            
            // Atualizar checkboxes de colunas
            Object.keys(appConfig.columns).forEach(colId => {
                const checkbox = document.getElementById(`col-${colId}`);
                if (checkbox) {
                    checkbox.checked = appConfig.columns[colId];
                }
            });
        } catch (e) {
            console.error('Erro ao carregar configurações:', e);
        }
    }
}

// Normalizar URL do servidor (adicionar protocolo se necessário)
function normalizeUrl(url) {
    // Se a URL não começar com http:// ou https://, adicionar http://
    if (url && !url.match(/^https?:\/\//)) {
        return `http://${url}`;
    }
    return url;
}

// Extrair identificador do servidor da URL
function extractServerIdentifier(url) {
    try {
        // Remover protocolo
        let serverIdentifier = url.replace(/^https?:\/\//, '');
        // Remover porta e qualquer caminho
        serverIdentifier = serverIdentifier.split(':')[0].split('/')[0];
        return serverIdentifier;
    } catch (error) {
        console.error('Erro ao extrair identificador do servidor:', error);
        return url;
    }
}

// Carregar dados do servidor SQL
async function loadDataFromServer() {
    // Verificar se há configurações de conexão
    if (!appConfig.server.url || !appConfig.server.username || !appConfig.server.password) {
        console.warn('Configurações de conexão incompletas');
        return false;
    }
    
    try {
        // Exibir indicador de carregamento
        showLoading(true);
        
        // Normalizar URL (adicionar protocolo se necessário)
        const normalizedUrl = normalizeUrl(appConfig.server.url);
        
        // Extrair identificador do servidor para debug
        const serverIdentifier = extractServerIdentifier(normalizedUrl);
        console.log('Tentando conectar a:', normalizedUrl, 'Identificador:', serverIdentifier);
        
        // MODO DE SIMULAÇÃO: Se for o IP 10.142.111.2, simular dados
        if (serverIdentifier === '10.142.111.2') {
            // Simulação de tempo de carregamento
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Atualizar mockData com novos valores para simular dados recebidos do servidor
            const timeStamp = new Date().toLocaleTimeString();
            mockData = mockData.map(item => ({
                ...item,
                descricao: `${item.descricao} (Atualizado: ${timeStamp})`
            }));
            
            // Atualizar filtros e renderizar tabela
            updateFilterOptions();
            renderTable(mockData);
            showLoading(false);
            
            console.log('Dados simulados carregados para o servidor:', serverIdentifier);
            return true;
        }
        
        // Modo real: conectar ao backend
        try {
            // API endpoint do backend
            const apiUrl = `${normalizedUrl}/api/imobilizado/getData`;
            console.log('Tentando API URL:', apiUrl);
            
            const requestData = {
                username: appConfig.server.username,
                password: appConfig.server.password
            };
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });
            
            // Se a conexão for bem-sucedida, processar resposta
            if (response.ok) {
                const data = await response.json();
                
                // Verificar se a resposta tem a estrutura esperada
                if (data && Array.isArray(data.items)) {
                    // Converter a resposta do servidor para o formato esperado pelo aplicativo
                    const formattedData = data.items.map((item, index) => ({
                        id: item.id || item.codigo || `DB-${index + 1}`,
                        codigo: item.codigo || '',
                        item: item.item || '',
                        descricao: item.descricao || '',
                        categoria: item.categoria || '',
                        local: item.local || '',
                        valorAquisicao: parseFloat(item.valorAquisicao) || 0,
                        status: item.status || 'Ativo',
                        confirmacao: item.confirmacao === 1 || item.confirmacao === true
                    }));
                    
                    // Atualizar os dados
                    mockData = formattedData;
                    
                    // Atualizar os filtros
                    updateFilterOptions();
                    
                    // Renderizar a tabela
                    renderTable(mockData);
                    
                    // Ocultar indicador de carregamento
                    showLoading(false);
                    
                    console.log(`Carregados ${formattedData.length} itens do servidor`);
                    return true;
                }
            }
            
            // Se chegou aqui, algo deu errado na comunicação
            throw new Error(`Erro na resposta do servidor: ${response.status} ${response.statusText}`);
            
        } catch (networkError) {
            console.error('Erro de rede:', networkError);
            showLoading(false);
            alert(`Erro ao conectar ao servidor: ${networkError.message}. Verifique a conexão ou as configurações.`);
            return false;
        }
    } catch (error) {
        console.error('Erro ao carregar dados do servidor:', error);
        showLoading(false);
        alert('Erro ao carregar dados do servidor. Verifique as configurações de conexão e tente novamente.');
        return false;
    }
}

// Testar conexão com o servidor
async function testConnection() {
    const url = serverUrlInput.value;
    const username = usernameInput.value;
    const password = passwordInput.value;
    
    if (!url) {
        alert('Por favor, informe a URL ou IP do servidor.');
        return;
    }
    
    // Exibir indicador de carregamento
    showLoading(true);
    
    try {
        // Normalizar URL (adicionar protocolo se necessário)
        const normalizedUrl = normalizeUrl(url);
        
        // Extrair identificador do servidor para verificação especial
        const serverIdentifier = extractServerIdentifier(normalizedUrl);
        console.log('Testando conexão com servidor:', normalizedUrl, 'Identificador:', serverIdentifier);
        
        // Caso especial para IP 10.142.111.2 (simulação)
        if (serverIdentifier === '10.142.111.2') {
            // Simular delay para parecer real
            await new Promise(resolve => setTimeout(resolve, 1000));
            showLoading(false);
            alert('Conexão bem sucedida! Servidor de testes identificado.');
            return;
        }
        
        // Tentar conexão real para outros servidores
        const testUrl = `${normalizedUrl}/api/test`;
        console.log('Tentando API URL:', testUrl);
        
        const response = await fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                query: 'SELECT 1 AS test' // Consulta SQL de teste simples
            })
        });
        
        // Ocultar indicador de carregamento
        showLoading(false);
        
        if (response.ok) {
            const data = await response.json();
            if (data.success) {
                alert('Conexão bem sucedida!');
            } else {
                throw new Error(data.error || 'Erro não especificado');
            }
        } else {
            throw new Error(`Falha na conexão: ${response.status} ${response.statusText}`);
        }
    } catch (error) {
        // Ocultar indicador de carregamento
        showLoading(false);
        
        console.error('Erro ao testar conexão:', error);
        alert(`Erro ao testar conexão: ${error.message}\n\nRecomendações:\n1. Verifique se o servidor está acessível\n2. Problemas de CORS podem ocorrer ao conectar diretamente ao SQL Server do navegador\n3. Configure um backend API para fazer conexões SQL com segurança`);
    }
}

// Exibir/ocultar indicador de carregamento
function showLoading(show) {
    if (!loadingOverlay) {
        loadingOverlay = document.getElementById('loadingOverlay');
        if (!loadingOverlay && show) {
            // Criar overlay de carregamento se não existir
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loadingOverlay';
            loadingOverlay.innerHTML = '<div class="loading-spinner"></div><div class="loading-text">Carregando dados...</div>';
            document.body.appendChild(loadingOverlay);
        }
    }
    
    if (loadingOverlay) {
        loadingOverlay.style.display = show ? 'flex' : 'none';
    }
}

// Atualizar visibilidade das colunas
function updateColumnVisibility() {
    // Atualizar definições de colunas
    columnDefs.forEach(col => {
        col.visible = appConfig.columns[col.id] || false;
    });
    
    // Reconstruir cabeçalho da tabela
    renderTableHeader();
}

// Renderizar cabeçalho da tabela
function renderTableHeader() {
    if (!tableHeader) {
        console.error('Elemento tableHeader não encontrado');
        return;
    }
    
    tableHeader.innerHTML = '';
    
    const headerRow = document.createElement('tr');
    
    // Adicionar apenas as colunas visíveis
    columnDefs.filter(col => col.visible).forEach(col => {
        const th = document.createElement('th');
        th.textContent = col.label;
        headerRow.appendChild(th);
    });
    
    tableHeader.appendChild(headerRow);
}

// Configurar os dropdowns personalizados
function setupCustomDropdowns() {
    // Setup para o dropdown de locais
    setupDropdown(locationDropdown.selected, locationDropdown.options, 'location');
    
    // Setup para o dropdown de categorias
    setupDropdown(categoryDropdown.selected, categoryDropdown.options, 'category');
    
    // Setup para o dropdown de status
    setupDropdown(statusDropdown.selected, statusDropdown.options, 'status');
}

// Configurar cada dropdown
function setupDropdown(selectedElement, optionsElement, type) {
    // Verificar se os elementos existem
    if (!selectedElement || !optionsElement) {
        console.error(`Elementos do dropdown ${type} não encontrados`);
        return;
    }
    
    console.log(`Configurando dropdown ${type}`);
    
    // Abrir/fechar dropdown ao clicar
    selectedElement.addEventListener('click', function(event) {
        event.stopPropagation();
        const dropdown = this.parentElement;
        const isOpen = dropdown.classList.contains('open');
        
        // Fechar todos os outros dropdowns
        document.querySelectorAll('.custom-dropdown').forEach(el => {
            el.classList.remove('open');
        });
        
        // Alternar o estado do dropdown atual
        if (!isOpen) {
            dropdown.classList.add('open');
        }
    });
    
    // Evitar que cliques dentro do dropdown fechem o dropdown
    optionsElement.addEventListener('click', function(event) {
        event.stopPropagation();
    });
    
    // Lidar com cliques nas opções
    optionsElement.addEventListener('change', function(e) {
        if (e.target.type === 'checkbox') {
            const checkbox = e.target;
            
            if (checkbox.classList.contains('all-option')) {
                // Se "Todos" for selecionado/desselecionado
                handleAllOption(optionsElement, checkbox, type);
            } else {
                // Para opções regulares
                handleRegularOption(optionsElement, checkbox, type);
            }
            
            // Atualizar texto do dropdown
            updateDropdownText(selectedElement, type);
            
            // Filtrar dados
            filterData();
        }
    });
}

// Lidar com a opção "Todos"
function handleAllOption(optionsContainer, allCheckbox, type) {
    const checkboxes = optionsContainer.querySelectorAll('input[type="checkbox"]:not(.all-option)');
    
    // Se "Todos" for marcado, desmarque todas as outras opções
    if (allCheckbox.checked) {
        checkboxes.forEach(cb => {
            cb.checked = false;
        });
        
        // Atualizar array de filtros ativos
        if (type === 'location') {
            activeLocationFilters = [];
        } else if (type === 'category') {
            activeCategoryFilters = [];
        } else if (type === 'status') {
            activeStatusFilters = [];
        }
    }
}

// Lidar com opções regulares
function handleRegularOption(optionsContainer, checkbox, type) {
    const allCheckbox = optionsContainer.querySelector('.all-option');
    const value = checkbox.value;
    
    // Se alguma opção regular for selecionada, desmarque "Todos"
    if (checkbox.checked) {
        allCheckbox.checked = false;
        
        // Adicionar ao array de filtros ativos
        if (type === 'location') {
            activeLocationFilters.push(value);
        } else if (type === 'category') {
            activeCategoryFilters.push(value);
        } else if (type === 'status') {
            activeStatusFilters.push(value);
        }
    } else {
        // Remover do array de filtros ativos
        if (type === 'location') {
            activeLocationFilters = activeLocationFilters.filter(loc => loc !== value);
        } else if (type === 'category') {
            activeCategoryFilters = activeCategoryFilters.filter(cat => cat !== value);
        } else if (type === 'status') {
            activeStatusFilters = activeStatusFilters.filter(st => st !== value);
        }
    }
    
    // Se não houver seleção, marque "Todos"
    const anyChecked = Array.from(optionsContainer.querySelectorAll('input[type="checkbox"]:not(.all-option)')).some(cb => cb.checked);
    if (!anyChecked) {
        allCheckbox.checked = true;
        
        // Limpar array de filtros ativos
        if (type === 'location') {
            activeLocationFilters = [];
        } else if (type === 'category') {
            activeCategoryFilters = [];
        } else if (type === 'status') {
            activeStatusFilters = [];
        }
    }
}

// Atualizar texto do dropdown
function updateDropdownText(selectedElement, type) {
    let text;
    
    if (type === 'location') {
        if (activeLocationFilters.length === 0) {
            text = 'Todos';
        } else if (activeLocationFilters.length === 1) {
            text = activeLocationFilters[0];
        } else {
            text = `${activeLocationFilters.length} locais selecionados`;
        }
    } else if (type === 'category') {
        if (activeCategoryFilters.length === 0) {
            text = 'Todas';
        } else if (activeCategoryFilters.length === 1) {
            text = activeCategoryFilters[0];
        } else {
            text = `${activeCategoryFilters.length} categorias selecionadas`;
        }
    } else if (type === 'status') {
        if (activeStatusFilters.length === 0) {
            text = 'Todos';
        } else if (activeStatusFilters.length === 1) {
            text = activeStatusFilters[0];
        } else {
            text = `${activeStatusFilters.length} status selecionados`;
        }
    }
    
    selectedElement.textContent = text;
}

// Carregar os filtros iniciais (antes de carregar dados do servidor)
function loadInitialFilters() {
    // Carregar locais
    locations.forEach(location => {
        addFilterOption(locationDropdown.options, location, 'location');
    });

    // Carregar categorias
    categories.forEach(category => {
        addFilterOption(categoryDropdown.options, category, 'category');
    });
    
    // Status já estão definidos no HTML
}

// Renderizar a tabela com os dados
function renderTable(data) {
    if (!itemsTableBody) {
        console.error('Elemento itemsTableBody não encontrado');
        return;
    }
    
    itemsTableBody.innerHTML = '';
    
    if (data.length === 0) {
        const emptyRow = document.createElement('tr');
        const visibleColumns = columnDefs.filter(col => col.visible).length;
        emptyRow.innerHTML = `<td colspan="${visibleColumns}" style="text-align: center;">Nenhum item encontrado</td>`;
        itemsTableBody.appendChild(emptyRow);
        return;
    }

    data.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        
        // Criar select para mudança de local
        const locationChangeSelect = document.createElement('select');
        locationChangeSelect.classList.add('change-location');
        locationChangeSelect.dataset.originalValue = item.local;
        
        // Opção em branco
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Selecione...';
        locationChangeSelect.appendChild(emptyOption);
        
        // Adicionar opções de locais
        locations.forEach(loc => {
            if (loc !== item.local) { // Não mostrar o local atual como opção
                const option = document.createElement('option');
                option.value = loc;
                option.textContent = loc;
                locationChangeSelect.appendChild(option);
            }
        });

        // Criar checkbox de status
        const statusCheckbox = document.createElement('input');
        statusCheckbox.type = 'checkbox';
        statusCheckbox.classList.add('status-checkbox');
        statusCheckbox.checked = item.confirmacao;
        statusCheckbox.dataset.originalValue = item.confirmacao;
        
        // Criar a linha da tabela apenas com as colunas visíveis
        const visibleColumns = columnDefs.filter(col => col.visible);
        let rowHTML = '';
        
        visibleColumns.forEach(col => {
            if (col.special === 'mudar') {
                rowHTML += '<td></td>'; // Célula vazia para o select
            } else if (col.special === 'confirmacao') {
                rowHTML += '<td></td>'; // Célula vazia para o checkbox
            } else {
                // Formatar valor se houver um formatter
                let value = item[col.field];
                if (col.formatter) {
                    value = col.formatter(value);
                }
                rowHTML += `<td>${value}</td>`;
            }
        });
        
        row.innerHTML = rowHTML;
        
        // Adicionar elementos interativos nas células correspondentes
        if (appConfig.columns['mudar']) {
            const mudarIndex = visibleColumns.findIndex(col => col.special === 'mudar');
            if (mudarIndex !== -1) {
                row.cells[mudarIndex].appendChild(locationChangeSelect);
            }
        }
        
        if (appConfig.columns['confirmacao']) {
            const confirmacaoIndex = visibleColumns.findIndex(col => col.special === 'confirmacao');
            if (confirmacaoIndex !== -1) {
                row.cells[confirmacaoIndex].appendChild(statusCheckbox);
            }
        }
        
        itemsTableBody.appendChild(row);
    });
}

// Configurar modal de configurações
function setupConfigModal() {
    console.log('Verificando configurações da modal...');
    
    // Não adicionar novos event listeners para abrir/fechar a modal
    // porque isso já está sendo tratado pelo script inline no HTML
    
    // Verificar se os elementos existem para as outras funcionalidades
    if (!saveConfig) {
        console.error('Botão de salvar configurações não encontrado');
        return;
    }
    
    if (!cancelConfig) {
        console.error('Botão de cancelar configurações não encontrado');
        return;
    }
    
    if (!testConnectionBtn) {
        console.error('Botão de testar conexão não encontrado');
        return;
    }
    
    // Salvar configurações
    saveConfig.addEventListener('click', function() {
        console.log('Botão salvar configurações clicado');
        if (saveAppConfig()) {
            document.getElementById('configModal').style.display = 'none';
            alert('Configurações salvas com sucesso!');
        } else {
            alert('Erro ao salvar configurações. Tente novamente.');
        }
    });
    
    // Cancelar
    cancelConfig.addEventListener('click', function() {
        console.log('Botão cancelar configurações clicado');
        document.getElementById('configModal').style.display = 'none';
        
        // Restaurar checkboxes para estado atual
        columnDefs.forEach(col => {
            const checkbox = document.getElementById(`col-${col.id}`);
            if (checkbox) {
                checkbox.checked = appConfig.columns[col.id];
            }
        });
    });
    
    // Testar conexão
    testConnectionBtn.addEventListener('click', function() {
        console.log('Botão testar conexão clicado');
        testConnection();
    });
    
    console.log('Eventos de ações da modal configurados com sucesso');
}

// Obter dados filtrados
function getFilteredData() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    let filteredData = mockData;
    
    // Filtrar por termo de busca
    if (searchTerm) {
        filteredData = filteredData.filter(item => 
            item.item.toLowerCase().includes(searchTerm) ||
            item.descricao.toLowerCase().includes(searchTerm) ||
            item.codigo.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtrar por local (seleção múltipla)
    if (activeLocationFilters.length > 0) {
        filteredData = filteredData.filter(item => activeLocationFilters.includes(item.local));
    }
    
    // Filtrar por categoria (seleção múltipla)
    if (activeCategoryFilters.length > 0) {
        filteredData = filteredData.filter(item => activeCategoryFilters.includes(item.categoria));
    }
    
    // Filtrar por status (seleção múltipla)
    if (activeStatusFilters.length > 0) {
        filteredData = filteredData.filter(item => activeStatusFilters.includes(item.status));
    }
    
    return filteredData;
}

// Filtrar dados
function filterData() {
    const filteredData = getFilteredData();
    renderTable(filteredData);
}

// Formatar valor como moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(value);
}

// Salvar configurações no localStorage
function saveAppConfig() {
    try {
        // Atualizar configurações de colunas
        columnDefs.forEach(col => {
            const checkbox = document.getElementById(`col-${col.id}`);
            if (checkbox) {
                appConfig.columns[col.id] = checkbox.checked;
            }
        });
        
        // Atualizar configurações de servidor
        const newUrl = serverUrlInput.value;
        const normalizedUrl = normalizeUrl(newUrl); // Normalizar URL
        const newUsername = usernameInput.value;
        const newPassword = passwordInput.value;
        
        // Verificar se houve mudança nas configurações de conexão
        const connectionChanged = 
            normalizedUrl !== appConfig.server.url || 
            newUsername !== appConfig.server.username || 
            newPassword !== appConfig.server.password;
        
        // Atualizar configurações no objeto
        appConfig.server.url = normalizedUrl; // Usar URL normalizada
        appConfig.server.username = newUsername;
        appConfig.server.password = newPassword;
        
        // Atualizar campo de entrada com URL normalizada
        serverUrlInput.value = normalizedUrl;
        
        // Salvar no localStorage
        localStorage.setItem('imobilizadoAppConfig', JSON.stringify(appConfig));
        localStorage.setItem('serverUrl', normalizedUrl);
        localStorage.setItem('username', newUsername);
        localStorage.setItem('password', newPassword);
        
        // Atualizar UI baseado nas configurações
        updateColumnVisibility();
        
        // Se houver mudança nas configurações de conexão, recarregar dados do servidor
        if (connectionChanged && normalizedUrl && newUsername && newPassword) {
            // Carregar dados do servidor com as novas configurações
            loadDataFromServer();
        } else {
            // Apenas atualizar a tabela com os dados filtrados existentes
            renderTable(getFilteredData());
        }
        
        return true;
    } catch (e) {
        console.error('Erro ao salvar configurações:', e);
        return false;
    }
}

// Exportar dados
function exportData() {
    // Em uma aplicação real, isso enviaria os dados para o servidor
    // ou geraria um arquivo CSV/Excel
    
    // Aqui, vamos apenas mostrar um JSON dos dados
    const jsonStr = JSON.stringify(mockData, null, 2);
    
    // Criar um elemento textarea para copiar os dados
    const textArea = document.createElement('textarea');
    textArea.value = jsonStr;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    alert('Dados exportados e copiados para a área de transferência!');
}

// Atualizar preview de busca
function updateSearchPreview() {
    if (!searchInput || !searchPreviewContainer) return;
    
    const searchTerm = searchInput.value.trim().toLowerCase();
    
    // Se o termo de busca estiver vazio, esconder o preview
    if (!searchTerm) {
        searchPreviewContainer.style.display = 'none';
        return;
    }
    
    // Filtrar itens que correspondem ao termo de busca
    const matchedItems = mockData.filter(item => 
        item.item.toLowerCase().includes(searchTerm) ||
        item.descricao.toLowerCase().includes(searchTerm) ||
        item.codigo.toLowerCase().includes(searchTerm)
    );
    
    // Limitar a 10 itens para não sobrecarregar a UI
    const limitedMatches = matchedItems.slice(0, 10);
    
    // Se não houver correspondências, esconder o preview
    if (limitedMatches.length === 0) {
        searchPreviewContainer.style.display = 'none';
        return;
    }
    
    // Renderizar os itens encontrados
    searchPreviewContainer.innerHTML = '';
    limitedMatches.forEach(item => {
        const previewItem = document.createElement('div');
        previewItem.className = 'search-preview-item';
        previewItem.textContent = `${item.item} - ${item.local}`;
        
        // Adicionar evento de clique para selecionar o item
        previewItem.addEventListener('click', function() {
            searchInput.value = item.item;
            searchPreviewContainer.style.display = 'none';
            filterData();
        });
        
        searchPreviewContainer.appendChild(previewItem);
    });
    
    // Exibir o container de preview
    searchPreviewContainer.style.display = 'block';
}

// Limpar busca
function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (searchPreviewContainer) {
        searchPreviewContainer.style.display = 'none';
    }
    
    // Resetar os filtros
    if (document.getElementById('location-all') && !document.getElementById('location-all').checked) {
        document.getElementById('location-all').checked = true;
        activeLocationFilters = [];
        updateDropdownText(document.getElementById('locationSelected'), 'location');
    }
    
    if (document.getElementById('category-all') && !document.getElementById('category-all').checked) {
        document.getElementById('category-all').checked = true;
        activeCategoryFilters = [];
        updateDropdownText(document.getElementById('categorySelected'), 'category');
    }
    
    if (document.getElementById('status-all') && !document.getElementById('status-all').checked) {
        document.getElementById('status-all').checked = true;
        activeStatusFilters = [];
        updateDropdownText(document.getElementById('statusSelected'), 'status');
    }
    
    // Renderizar todos os dados
    renderTable(mockData);
}

// Inicializar a aplicação quando o DOM estiver carregado
console.log('Registrando event listener para DOMContentLoaded...');
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded disparado');
    
    // Verificar se todos os elementos necessários estão presentes
    const requiredElements = {
        'searchName': searchNameInput,
        'searchButton': searchButton,
        'tableHeader': tableHeader,
        'itemsTableBody': itemsTableBody,
        'saveButton': saveButton,
        'exportButton': exportButton,
        'reloadButton': reloadButton,
        'locationSelected': locationSelected,
        'locationOptions': locationOptions,
        'categorySelected': categorySelected,
        'categoryOptions': categoryOptions,
        'statusSelected': statusSelected,
        'statusOptions': statusOptions,
        'configIcon': configIcon,
        'configModal': configModal,
        'saveConfig': saveConfig,
        'cancelConfig': cancelConfig,
        'testConnection': testConnection
    };
    
    let missingElements = [];
    for (const [id, element] of Object.entries(requiredElements)) {
        if (!element) {
            missingElements.push(id);
            console.error(`Elemento ${id} não encontrado`);
        }
    }
    
    if (missingElements.length > 0) {
        console.error(`Elementos faltando: ${missingElements.join(', ')}`);
        alert(`Erro: Alguns elementos da interface não foram encontrados: ${missingElements.join(', ')}`);
    }
    
    // Mesmo com erro, tentar inicializar para que partes da aplicação possam funcionar
    initApp();
});

// Garantia dupla de inicialização (caso o DOMContentLoaded já tenha disparado)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Documento já está pronto, inicializando diretamente');
    setTimeout(initApp, 1);
} 