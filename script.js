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

// Sistema de cache e sincronização
let lastSyncTimestamp = localStorage.getItem('lastSyncTimestamp') || null;
let itemsCache = JSON.parse(localStorage.getItem('itemsCache') || '[]');
let needsSync = false;

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
    sql: {
        server: localStorage.getItem('sqlServer') || '10.142.111.2',
        database: localStorage.getItem('sqlDatabase') || 'CONTROLLER',
        username: localStorage.getItem('sqlUsername') || 'controllerabc.bi',
        password: localStorage.getItem('sqlPassword') || 'ASp#$I!17QF0'
    },
    columns: columnDefs.reduce((acc, col) => {
        acc[col.id] = col.visible;
        return acc;
    }, {})
};

// Elementos DOM adicionais para configuração SQL
let sqlConfigModal, sqlServerInput, sqlDatabaseInput, sqlUsernameInput, sqlPasswordInput;
let testSqlConnectionBtn, saveSqlConfigBtn, cancelSqlConfigBtn, configSqlBtn;

// Inicializar a aplicação
async function initApp() {
    console.log('Iniciando aplicativo...');
    
    // Verificar se a aplicação já foi inicializada
    if (window.appInitialized) {
        console.log('Aplicativo já inicializado, pulando...');
        return;
    }
    
    // Garantir que o DOM esteja completamente carregado
    if (document.readyState !== 'complete') {
        console.log('DOM ainda não está completamente carregado, aguardando...');
        return new Promise(resolve => {
            window.addEventListener('load', () => {
                console.log('DOM carregado, continuando inicialização...');
                setTimeout(() => initApp().then(resolve), 100);
            });
        });
    }
    
    // Marcar como inicializado
    window.appInitialized = true;
    
    // Inicializar referências DOM
    initDOMReferences();
    
    // Verificar se as referências DOM críticas existem
    if (!checkCriticalReferences()) {
        console.error('Elementos DOM críticos não encontrados, não é possível inicializar a aplicação');
        // Tentar novamente em 500ms (pode ser que o DOM ainda esteja sendo renderizado)
        setTimeout(initApp, 500);
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
    if (appConfig.sql.server && appConfig.sql.username && appConfig.sql.password) {
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
    
    // Tabela e elementos relacionados
    itemsTable = document.getElementById('itemsTable');
    itemsTableBody = document.getElementById('itemsTableBody');
    tableHeader = document.getElementById('tableHeader');
    
    // Botões de ação
    saveButton = document.getElementById('saveButton');
    exportButton = document.getElementById('exportButton');
    reloadButton = document.getElementById('reloadButton');
    
    // Configurações
    configModal = document.getElementById('configModal');
    serverUrlInput = document.getElementById('serverUrl');
    usernameInput = document.getElementById('username');
    passwordInput = document.getElementById('password');
    testConnectionBtn = document.getElementById('testConnection');
    saveConfig = document.getElementById('saveConfig');
    cancelConfig = document.getElementById('cancelConfig');
    
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
    
    // Overlay de carregamento
    loadingOverlay = document.getElementById('loadingOverlay');
    
    // Elementos da configuração SQL
    sqlConfigModal = document.getElementById('sqlConfigModal');
    sqlServerInput = document.getElementById('sqlServer');
    sqlDatabaseInput = document.getElementById('sqlDatabase');
    sqlUsernameInput = document.getElementById('sqlUsername');
    sqlPasswordInput = document.getElementById('sqlPassword');
    testSqlConnectionBtn = document.getElementById('testSqlConnection');
    saveSqlConfigBtn = document.getElementById('saveSqlConfig');
    cancelSqlConfigBtn = document.getElementById('cancelSqlConfig');
    configSqlBtn = document.getElementById('configSqlButton');
    
    console.log('Referências DOM inicializadas com sucesso');
}

// Verificar referências críticas
function checkCriticalReferences() {
    console.log('Verificando referências DOM críticas...');
    
    const requiredElements = {
        'searchName': searchInput,
        'searchButton': searchButton,
        'tableHeader': tableHeader,
        'itemsTableBody': itemsTableBody,
        'saveButton': saveButton,
        'exportButton': exportButton,
        'reloadButton': reloadButton,
        'locationSelected': locationDropdown?.selected,
        'locationOptions': locationDropdown?.options,
        'categorySelected': categoryDropdown?.selected,
        'categoryOptions': categoryDropdown?.options,
        'statusSelected': statusDropdown?.selected,
        'statusOptions': statusDropdown?.options,
        'configModal': configModal,
        'saveConfig': saveConfig,
        'cancelConfig': cancelConfig,
        'testConnection': testConnectionBtn
    };
    
    // Se elementos não foram encontrados, tente obtê-los novamente
    if (!searchInput) searchInput = document.getElementById('searchName');
    if (!searchButton) searchButton = document.getElementById('searchButton');
    if (!tableHeader) tableHeader = document.getElementById('tableHeader');
    if (!itemsTableBody) itemsTableBody = document.getElementById('itemsTableBody');
    if (!saveButton) saveButton = document.getElementById('saveButton');
    if (!exportButton) exportButton = document.getElementById('exportButton');
    if (!reloadButton) reloadButton = document.getElementById('reloadButton');
    
    if (!locationDropdown?.selected) {
        if (!locationDropdown) locationDropdown = {};
        locationDropdown.selected = document.getElementById('locationSelected');
    }
    
    if (!locationDropdown?.options) {
        if (!locationDropdown) locationDropdown = {};
        locationDropdown.options = document.getElementById('locationOptions');
    }
    
    if (!categoryDropdown?.selected) {
        if (!categoryDropdown) categoryDropdown = {};
        categoryDropdown.selected = document.getElementById('categorySelected');
    }
    
    if (!categoryDropdown?.options) {
        if (!categoryDropdown) categoryDropdown = {};
        categoryDropdown.options = document.getElementById('categoryOptions');
    }
    
    if (!statusDropdown?.selected) {
        if (!statusDropdown) statusDropdown = {};
        statusDropdown.selected = document.getElementById('statusSelected');
    }
    
    if (!statusDropdown?.options) {
        if (!statusDropdown) statusDropdown = {};
        statusDropdown.options = document.getElementById('statusOptions');
    }
    
    if (!configModal) configModal = document.getElementById('configModal');
    if (!saveConfig) saveConfig = document.getElementById('saveConfig');
    if (!cancelConfig) cancelConfig = document.getElementById('cancelConfig');
    if (!testConnectionBtn) testConnectionBtn = document.getElementById('testConnection');
    
    // Atualizar o objeto requiredElements com os valores atualizados
    requiredElements.searchName = searchInput;
    requiredElements.searchButton = searchButton;
    requiredElements.tableHeader = tableHeader;
    requiredElements.itemsTableBody = itemsTableBody;
    requiredElements.saveButton = saveButton;
    requiredElements.exportButton = exportButton;
    requiredElements.reloadButton = reloadButton;
    requiredElements.locationSelected = locationDropdown?.selected;
    requiredElements.locationOptions = locationDropdown?.options;
    requiredElements.categorySelected = categoryDropdown?.selected;
    requiredElements.categoryOptions = categoryDropdown?.options;
    requiredElements.statusSelected = statusDropdown?.selected;
    requiredElements.statusOptions = statusDropdown?.options;
    requiredElements.configModal = configModal;
    requiredElements.saveConfig = saveConfig;
    requiredElements.cancelConfig = cancelConfig;
    requiredElements.testConnection = testConnectionBtn;

    let missingElements = [];
    for (const [id, element] of Object.entries(requiredElements)) {
        if (!element) {
            missingElements.push(id);
            console.error(`Elemento ${id} não encontrado`);
        }
    }
    
    if (missingElements.length > 0) {
        console.error(`Elementos críticos ausentes: ${missingElements.join(', ')}`);
        
        // Alertar o usuário apenas se faltar algum elemento verdadeiramente crítico
        const trulyCriticalElements = ['tableHeader', 'itemsTableBody'];
        const criticalMissing = missingElements.filter(el => trulyCriticalElements.includes(el));
        
        if (criticalMissing.length > 0) {
            alert(`Erro: Elementos críticos da interface não foram encontrados: ${criticalMissing.join(', ')}`);
            return false;
        }
        
        // Se apenas elementos não críticos estiverem faltando, podemos continuar com aviso no console
        console.warn(`Alguns elementos não críticos estão faltando, a aplicação pode ter funcionalidades limitadas`);
        return true;
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
    
    // Botão para sincronizar manualmente com o servidor
    if (reloadButton) {
        reloadButton.addEventListener('click', function() {
            console.log('Botão recarregar dados clicado');
            forceSyncWithServer();
        });
    }
    
    // Botão salvar alterações
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            console.log('Botão salvar alterações clicado');
            syncLocalChangesToServer();
        });
    }
    
    // Botão exportar
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            console.log('Botão exportar clicado');
            exportData();
        });
    }
    
    // Carregar opções nos dropdowns de filtros
    loadInitialFilters();
    
    // Setup da modal de configuração (já feito via script inline no HTML)
    setupConfigModal();
    
    console.log('Event listeners configurados com sucesso');
}

// Recarregar dados do servidor
async function reloadData() {
    if (appConfig.sql.server && appConfig.sql.username && appConfig.sql.password) {
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
    if (appConfig.sql.server && appConfig.sql.username && appConfig.sql.password) {
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
            if (parsedConfig.sql && parsedConfig.sql.server) {
                parsedConfig.sql.server = normalizeUrl(parsedConfig.sql.server);
            }
            
            appConfig = { ...appConfig, ...parsedConfig };
            
            // Atualizar campos de conexão
            if (sqlServerInput) sqlServerInput.value = appConfig.sql.server || '';
            if (sqlDatabaseInput) sqlDatabaseInput.value = appConfig.sql.database || '';
            if (sqlUsernameInput) sqlUsernameInput.value = appConfig.sql.username || '';
            if (sqlPasswordInput) sqlPasswordInput.value = appConfig.sql.password || '';
            
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
    // Se a URL for vazia ou não informada, use o backend local
    if (!url || url.trim() === '') {
        return 'http://localhost:3000';
    }
    
    // Caso especial para IP da rede corporativa, manter o IP original
    if (url === '10.142.111.2') {
        return url;
    }
    
    // Se a URL não começar com http:// ou https://, adicionar http://
    if (!url.match(/^https?:\/\//)) {
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

// Carregar dados com sistema de cache
async function loadDataFromServer() {
    showLoading();
    
    try {
        // Verificar se temos dados em cache
        if (itemsCache.length > 0) {
            console.log('Carregando dados do cache local...');
            
            // Filtrar apenas itens ativos
            const activeItems = itemsCache.filter(item => item.status !== 'Baixado');
            
            // Renderizar dados do cache enquanto sincroniza em segundo plano
            renderTable(activeItems);
            
            // Mostrar indicador de que estamos usando dados em cache
            if (needsSync) {
                // Remover alertas anteriores antes de criar um novo
                const existingAlerts = document.querySelectorAll('.alert-info');
                existingAlerts.forEach(alert => alert.remove());
                
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert-info';
                alertDiv.textContent = 'Usando dados em cache. Sincronização em andamento...';
                alertDiv.style.position = 'fixed';
                alertDiv.style.top = '10px';
                alertDiv.style.right = '10px';
                alertDiv.style.zIndex = '1000';
                alertDiv.style.padding = '10px';
                alertDiv.style.backgroundColor = '#d4edda';
                alertDiv.style.color = '#155724';
                alertDiv.style.borderRadius = '4px';
                alertDiv.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
                document.body.appendChild(alertDiv);
                
                // Remover alerta após 3 segundos
                setTimeout(() => {
                    if (document.body.contains(alertDiv)) {
                        document.body.removeChild(alertDiv);
                    }
                }, 3000);
            }
            
            // Se precisamos sincronizar, fazemos isso em segundo plano
            if (needsSync) {
                synchronizeWithServer();
            }
            
            hideLoading();
            return;
        }
        
        // Se não temos cache, fazemos uma carga completa
        await synchronizeWithServer();
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        
        // Remover alertas anteriores antes de criar um novo
        const existingAlerts = document.querySelectorAll('.alert-error');
        existingAlerts.forEach(alert => alert.remove());
        
        alert('Erro ao carregar dados: ' + error.message);
        hideLoading();
    }
}

// Sincronizar com o servidor
async function synchronizeWithServer() {
    try {
        console.log('Sincronizando com o servidor...');
        
        // Obter dados da configuração
        if (!appConfig.sql.server || !appConfig.sql.username || !appConfig.sql.password) {
            console.error('Configuração de servidor incompleta');
            needsSync = true;
            return;
        }
        
        // Normalizar a URL do servidor
        const normalizedUrl = normalizeUrl(appConfig.sql.server);
        console.log('URL normalizada:', normalizedUrl);
        
        // Preparar a consulta SQL
        const sqlQuery = `
            WITH BaseData AS (
                SELECT 
                    code       AS Código,
                    name       AS Item,
                    fa_char_1  AS Descrição,
                    chart_name AS Categoria,
                    section_name AS Local,
                    id_entity,
                    id_tag,
                    id_chart
                FROM v_fixed_asset_iud
                WHERE id_entity = '474'
            ),
            AcquisitionData AS (
                SELECT 
                    id_tag, 
                    value      AS Valor_Aquisicao, 
                    date_close AS AcqDate,
                    id_chart  AS Acq_id_chart
                FROM Imobilizado_com_Erro_Contabil
                WHERE id_chart IN ('8036', '9393', '8040', '8042', '8041', '8045', '8049', '8051', '9388')
                
                UNION ALL
                
                SELECT 
                    id_tag, 
                    value      AS Valor_Aquisicao, 
                    datetime_0 AS AcqDate,
                    id_chart  AS Acq_id_chart
                FROM Old_document_item
                WHERE id_chart IN ('8036', '9393', '8040', '8042', '8041', '8045', '8049', '8051', '9388')
                
                UNION ALL
                
                SELECT 
                    id_tag, 
                    value      AS Valor_Aquisicao, 
                    datetime_0 AS AcqDate,
                    id_chart  AS Acq_id_chart
                FROM year_document_item
                WHERE id_chart IN ('8036', '9393', '8040', '8042', '8041', '8045', '8049', '8051', '9388')
            ),
            RankedAcquisition AS (
                SELECT 
                    ad.*,
                    ROW_NUMBER() OVER (PARTITION BY ad.id_tag ORDER BY ad.AcqDate DESC) AS rn
                FROM AcquisitionData ad
            )
            SELECT
                b.Código,
                b.Item,
                b.Descrição,
                b.Categoria,
                b.Local,
                ISNULL(ra.Valor_Aquisicao, 0) AS Valor_de_Aquisicao,
                'Ativo' AS Status
            FROM BaseData b
            LEFT JOIN RankedAcquisition ra 
                ON b.id_tag = ra.id_tag 
                AND ra.rn = 1
            WHERE LEFT(COALESCE(ra.Acq_id_chart, b.id_chart), 4) NOT IN ('8040', '8041', '8042', '8045', '8049', '8051', '9388')
              AND b.Categoria NOT IN ('1232001 - Terrenos', '1233005 - Edifícios', '1236005 - Veículos', 
                      '1239010 - Biblioteca e Videoteca', '1241005 - Direito de Uso e Conc', 
                      '1241010 - Software')
            ORDER BY b.Código ASC
        `;
        
        // Caso especial para IP 10.142.111.2 (conexão direta com SQL Server)
        if (appConfig.sql.server === '10.142.111.2') {
            try {
                const result = await window.electronAPI.queryDatabase(
                    normalizedUrl,
                    appConfig.sql.username || 'controllerabc.bi',
                    appConfig.sql.password || 'ASp#$I!17QF0',
                    sqlQuery,
                    appConfig.sql.database
                );
                
                if (result && result.success) {
                    updateLocalCache(result.items);
                    return true;
                } else {
                    throw new Error('Falha ao carregar dados do SQL Server');
                }
            } catch (error) {
                throw new Error(`Erro na conexão com SQL Server: ${error.message}`);
            }
        }
        
        // Para outros servidores, usar o backend local
        const response = await fetch(`http://localhost:3000/api/imobilizado/getData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: appConfig.sql.username,
                password: appConfig.sql.password,
                sqlQuery: sqlQuery
            }),
        });
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            updateLocalCache(result.items);
            return true;
        } else {
            throw new Error(result.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.error('Erro na sincronização:', error);
        needsSync = true;
        
        if (itemsCache.length > 0) {
            console.log('Usando dados em cache devido a erro na sincronização');
            return false;
        }
        
        console.log('Carregando dados simulados devido a erro na sincronização');
        const serverIdentifier = appConfig?.sql?.server || 'default';
        mockData = generateMockDataForServer(serverIdentifier);
        updateLocalCache(mockData);
        return false;
    }
}

// Atualizar o cache local
function updateLocalCache(items) {
    if (!items || items.length === 0) return;
    
    console.log(`Atualizando cache local com ${items.length} itens`);
    
    // Se já temos cache, fazemos merge dos dados
    if (itemsCache.length > 0) {
        // Criar mapa para busca rápida
        const existingItemsMap = new Map();
        itemsCache.forEach(item => {
            existingItemsMap.set(item.codigo, item);
        });
        
        // Atualizar itens existentes e adicionar novos
        items.forEach(newItem => {
            const existingItem = existingItemsMap.get(newItem.codigo);
            if (existingItem) {
                // Atualizar item existente preservando modificações locais
                Object.assign(existingItem, newItem, {
                    // Preservar status de confirmação local se existir
                    confirmado: existingItem.confirmado !== undefined ? existingItem.confirmado : newItem.confirmado,
                    // Preservar local novo se tiver sido alterado localmente
                    localNovo: existingItem.localNovo || newItem.localNovo
                });
            } else {
                // Adicionar novo item
                itemsCache.push(newItem);
            }
        });
    } else {
        // Primeiro carregamento
        itemsCache = [...items];
    }
    
    // Não precisa mais filtrar, pois a consulta SQL já retorna apenas itens ativos
    const activeItems = itemsCache;
    
    // Salvar no localStorage
    localStorage.setItem('itemsCache', JSON.stringify(itemsCache));
    
    // Atualizar timestamp da última sincronização
    lastSyncTimestamp = new Date().toISOString();
    localStorage.setItem('lastSyncTimestamp', lastSyncTimestamp);
    
    // Resetar flag de sincronização
    needsSync = false;
    
    // Limpar os dados simulados - não usaremos mais o mockData
    // Usar os dados reais do banco em vez dos simulados
    mockData = [...activeItems];
    
    // Atualizar os filtros quando novos dados forem carregados
    loadInitialFilters();
    
    // Renderizar a tabela com os dados atualizados
    renderTable(activeItems);
}

// Forçar sincronização manual
function forceSyncWithServer() {
    // Limpar timestamp para garantir sincronização completa
    lastSyncTimestamp = null;
    localStorage.removeItem('lastSyncTimestamp');
    
    synchronizeWithServer().then(() => {
        alert('Sincronização concluída com sucesso!');
    }).catch(error => {
        alert('Erro na sincronização: ' + error.message);
    });
}

// Verificar se precisamos sincronizar ao iniciar
function checkSyncNeeded() {
    // Se não temos timestamp de última sincronização, precisamos sincronizar
    if (!lastSyncTimestamp) {
        needsSync = true;
        return true;
    }
    
    // Verificar se passou mais de 1 hora desde a última sincronização
    const lastSync = new Date(lastSyncTimestamp).getTime();
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    needsSync = lastSync < oneHourAgo;
    return needsSync;
}

// Adicionar função para exportar alterações locais para o servidor
async function syncLocalChangesToServer() {
    showLoading();
    
    try {
        // Coletar alterações locais
        const modifiedItems = itemsCache.filter(item => 
            item.confirmacao === true || item.localNovo
        );
        
        if (modifiedItems.length === 0) {
            hideLoading();
            alert('Não há alterações locais para salvar');
            return;
        }
        
        // Atualizar o cache local com as alterações
        modifiedItems.forEach(modifiedItem => {
            const existingItem = itemsCache.find(item => item.id === modifiedItem.id);
            if (existingItem) {
                // Preservar apenas as alterações de confirmação e local novo
                existingItem.confirmacao = modifiedItem.confirmacao;
                existingItem.localNovo = modifiedItem.localNovo;
            }
        });
        
        // Salvar no localStorage
        localStorage.setItem('itemsCache', JSON.stringify(itemsCache));
        
        alert(`${modifiedItems.length} alterações salvas com sucesso no cache local!`);
    } catch (error) {
        console.error('Erro ao salvar alterações locais:', error);
        alert('Erro ao salvar alterações: ' + error.message);
    } finally {
        hideLoading();
    }
}

// Testar conexão SQL
async function testSqlConnection() {
    const config = {
        server: sqlServerInput.value,
        database: sqlDatabaseInput.value,
        username: sqlUsernameInput.value,
        password: sqlPasswordInput.value
    };
    
    showLoading();
    
    try {
        const testQuery = 'SELECT 1 AS test';
        const result = await window.electronAPI.queryDatabase(
            config.server,
            config.username,
            config.password,
            testQuery,
            config.database
        );
        
        if (result && result.success) {
            alert('Conexão SQL bem sucedida!');
        } else {
            throw new Error('Falha no teste de conexão');
        }
    } catch (error) {
        console.error('Erro no teste de conexão:', error);
        alert(`Erro ao testar conexão: ${error.message}`);
    } finally {
        hideLoading();
    }
}

// Salvar configurações SQL
function saveSqlConfig() {
    try {
        const config = {
            server: sqlServerInput.value.trim(),
            database: sqlDatabaseInput.value.trim(),
            username: sqlUsernameInput.value.trim(),
            password: sqlPasswordInput.value.trim()
        };
        
        // Validar campos obrigatórios
        if (!config.server || !config.database || !config.username || !config.password) {
            throw new Error('Todos os campos são obrigatórios');
        }
        
        // Salvar no localStorage
        localStorage.setItem('sqlServer', config.server);
        localStorage.setItem('sqlDatabase', config.database);
        localStorage.setItem('sqlUsername', config.username);
        localStorage.setItem('sqlPassword', config.password);
        
        // Atualizar configuração global
        appConfig.sql = config;
        
        // Fechar modal
        sqlConfigModal.style.display = 'none';
        
        // Tentar carregar dados com nova configuração
        loadDataFromServer();
        
        alert('Configurações SQL salvas com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        alert('Erro ao salvar configurações: ' + error.message);
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

// Função para ocultar o indicador de carregamento
function hideLoading() {
    showLoading(false);
}

// Atualizar visibilidade das colunas
function updateColumnVisibility() {
    // Atualizar definições de colunas
    columnDefs.forEach(col => {
        col.visible = appConfig.columns[col.id] || false;
    });
    
    // Reconstruir cabeçalho da tabela
    renderTableHeader();
    
    // Renderizar novamente a tabela para refletir as alterações de colunas
    const dataToRender = itemsCache.length > 0 ? itemsCache : mockData;
    renderTable(dataToRender);
    
    console.log('Visibilidade das colunas atualizada:', appConfig.columns);
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
    
    // Limpar e re-registrar os event listeners para os checkboxes
    const checkboxes = optionsElement.querySelectorAll('input[type="checkbox"]');
    
    console.log(`Registrando eventos para ${checkboxes.length} checkboxes no dropdown ${type}`);
    
    checkboxes.forEach(checkbox => {
        // Remover event listeners antigos (se existirem)
        const newCheckbox = checkbox.cloneNode(true);
        checkbox.parentNode.replaceChild(newCheckbox, checkbox);
        
        // Registrar novo event listener
        newCheckbox.addEventListener('change', function() {
            console.log(`Checkbox ${this.id} alterado para ${this.checked}`);
            
            if (this.classList.contains('all-option')) {
                // Se "Todos" for selecionado/desselecionado
                handleAllOption(optionsElement, this, type);
            } else {
                // Para opções regulares
                handleRegularOption(optionsElement, this, type);
            }
            
            // Atualizar texto do dropdown
            updateDropdownText(selectedElement, type);
            
            // Filtrar dados
            filterData();
        });
    });
    
    // Fechar todos os dropdowns ao clicar fora
    document.addEventListener('click', function() {
        document.querySelectorAll('.custom-dropdown').forEach(el => {
            el.classList.remove('open');
        });
    });
}

// Lidar com a opção "Todos"
function handleAllOption(optionsContainer, allCheckbox, type) {
    console.log(`Opção "Todos" para ${type} alterada para ${allCheckbox.checked}`);
    
    const checkboxes = optionsContainer.querySelectorAll('input[type="checkbox"]:not(.all-option)');
    
    // Se "Todos" for marcado, desmarque todas as outras opções
    if (allCheckbox.checked) {
        checkboxes.forEach(cb => {
            cb.checked = false;
        });
        
        // Limpar array de filtros ativos
        if (type === 'location') {
            activeLocationFilters = [];
            console.log('Filtros de local limpos');
        } else if (type === 'category') {
            activeCategoryFilters = [];
            console.log('Filtros de categoria limpos');
        } else if (type === 'status') {
            activeStatusFilters = [];
            console.log('Filtros de status limpos');
        }
    } else {
        // Se "Todos" for desmarcado mas nenhuma outra opção estiver marcada,
        // marcar "Todos" novamente pois precisa ter pelo menos um filtro ativo
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
        if (!anyChecked) {
            allCheckbox.checked = true;
            console.log(`Opção "Todos" para ${type} remarcada automaticamente`);
        }
    }
}

// Lidar com opções regulares
function handleRegularOption(optionsContainer, checkbox, type) {
    const allCheckbox = optionsContainer.querySelector('.all-option');
    const value = checkbox.value;
    
    console.log(`Opção ${type} alterada: ${value}, Checked: ${checkbox.checked}`);
    
    // Se alguma opção regular for selecionada, desmarque "Todos"
    if (checkbox.checked) {
        if (allCheckbox) {
            allCheckbox.checked = false;
        }
        
        // Adicionar ao array de filtros ativos
        if (type === 'location') {
            // Verificar se já não existe antes de adicionar
            if (!activeLocationFilters.includes(value)) {
                activeLocationFilters.push(value);
            }
        } else if (type === 'category') {
            if (!activeCategoryFilters.includes(value)) {
                activeCategoryFilters.push(value);
            }
        } else if (type === 'status') {
            if (!activeStatusFilters.includes(value)) {
                activeStatusFilters.push(value);
            }
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
    
    console.log(`Filtros de ${type} após alteração:`, 
        type === 'location' ? activeLocationFilters : 
        type === 'category' ? activeCategoryFilters : 
        activeStatusFilters);
    
    // Se não houver seleção, marque "Todos"
    const anyChecked = Array.from(optionsContainer.querySelectorAll('input[type="checkbox"]:not(.all-option)')).some(cb => cb.checked);
    if (!anyChecked && allCheckbox) {
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
    console.log('Carregando filtros iniciais...');
    
    // Verificar se os elementos dos dropdowns existem
    if (!locationDropdown || !locationDropdown.options || !categoryDropdown || !categoryDropdown.options) {
        console.error('Elementos dos dropdowns não encontrados');
        return;
    }
    
    // Limpar opções existentes (exceto a opção "Todos")
    const locationOptions = locationDropdown.options.querySelectorAll('.dropdown-option:not(:first-child)');
    locationOptions.forEach(option => option.remove());
    
    const categoryOptions = categoryDropdown.options.querySelectorAll('.dropdown-option:not(:first-child)');
    categoryOptions.forEach(option => option.remove());
    
    // Determinar se usamos dados do cache ou mock
    const dataSource = itemsCache.length > 0 ? itemsCache : mockData;
    
    // Extrair locais e categorias únicos dos dados
    const uniqueLocations = new Set();
    const uniqueCategories = new Set();
    
    dataSource.forEach(item => {
        // Considerar tanto propriedades em minúsculas quanto maiúsculas
        const itemLocal = item.local || item.Local;
        const itemCategoria = item.categoria || item.Categoria;
        
        if (itemLocal) uniqueLocations.add(itemLocal);
        if (itemCategoria) uniqueCategories.add(itemCategoria);
    });
    
    console.log('Locais únicos encontrados:', [...uniqueLocations]);
    console.log('Categorias únicas encontradas:', [...uniqueCategories]);
    
    // Adicionar locais ao dropdown
    [...uniqueLocations].sort().forEach(location => {
        addFilterOption(locationDropdown.options, location, 'location');
    });
    
    // Adicionar categorias ao dropdown
    [...uniqueCategories].sort().forEach(category => {
        addFilterOption(categoryDropdown.options, category, 'category');
    });
    
    // Re-configurar os dropdowns após adicionar as novas opções
    setupDropdown(locationDropdown.selected, locationDropdown.options, 'location');
    setupDropdown(categoryDropdown.selected, categoryDropdown.options, 'category');
    setupDropdown(statusDropdown.selected, statusDropdown.options, 'status');
    
    console.log('Filtros iniciais carregados com sucesso');
}

// Função para obter locais únicos dos dados
function getUniqueLocations(data) {
    const uniqueLocations = new Set();
    data.forEach(item => {
        const itemLocal = item.local || item.Local;
        if (itemLocal) uniqueLocations.add(itemLocal);
    });
    return [...uniqueLocations].sort();
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

    // Obter lista de locais únicos dos dados atuais
    const availableLocations = getUniqueLocations(data);

    data.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        
        // Criar select para mudança de local
        const locationChangeSelect = document.createElement('select');
        locationChangeSelect.classList.add('change-location');
        const itemLocal = item.local || item.Local;
        locationChangeSelect.dataset.originalValue = itemLocal;
        
        // Opção em branco
        const emptyOption = document.createElement('option');
        emptyOption.value = '';
        emptyOption.textContent = 'Selecione...';
        locationChangeSelect.appendChild(emptyOption);
        
        // Adicionar opções de locais
        availableLocations.forEach(loc => {
            if (loc !== itemLocal) { // Não mostrar o local atual como opção
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
    console.log('Configurando modais...');
    
    // Configurar modal SQL
    if (configSqlBtn) {
        configSqlBtn.addEventListener('click', function() {
            sqlConfigModal.style.display = 'block';
        });
    }
    
    if (sqlConfigModal) {
        // Fechar modal SQL
        document.getElementById('closeSqlConfig').addEventListener('click', function() {
            sqlConfigModal.style.display = 'none';
        });
        
        // Fechar ao clicar fora
        window.addEventListener('click', function(event) {
            if (event.target === sqlConfigModal) {
                sqlConfigModal.style.display = 'none';
            }
        });
        
        // Botão de teste de conexão SQL
        if (testSqlConnectionBtn) {
            testSqlConnectionBtn.addEventListener('click', testSqlConnection);
        }
        
        // Salvar configurações SQL
        if (saveSqlConfigBtn) {
            saveSqlConfigBtn.addEventListener('click', saveSqlConfig);
        }
        
        // Cancelar configurações SQL
        if (cancelSqlConfigBtn) {
            cancelSqlConfigBtn.addEventListener('click', function() {
                sqlConfigModal.style.display = 'none';
            });
        }
        
        // Toggle de visibilidade da senha SQL
        const toggleSqlPasswordBtn = document.getElementById('toggleSqlPassword');
        if (toggleSqlPasswordBtn) {
            toggleSqlPasswordBtn.addEventListener('click', function() {
                const type = sqlPasswordInput.type === 'password' ? 'text' : 'password';
                sqlPasswordInput.type = type;
                toggleSqlPasswordBtn.innerHTML = type === 'password' ? 
                    '<i class="fas fa-eye"></i>' : 
                    '<i class="fas fa-eye-slash"></i>';
            });
        }
    }
    
    // ... rest of existing modal setup code ...
}

// Obter dados filtrados
function getFilteredData() {
    // Usar os dados do cache se disponíveis, caso contrário usar mockData
    const dataToFilter = itemsCache.length > 0 ? itemsCache : mockData;
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    let filteredData = dataToFilter;
    
    // Filtrar por termo de busca
    if (searchTerm) {
        filteredData = filteredData.filter(item => 
            (item.item && item.item.toLowerCase().includes(searchTerm)) ||
            (item.descricao && item.descricao.toLowerCase().includes(searchTerm)) ||
            (item.codigo && item.codigo.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filtrar por local (seleção múltipla)
    if (activeLocationFilters.length > 0) {
        console.log('Filtrando por local:', activeLocationFilters);
        filteredData = filteredData.filter(item => {
            // Verificar tanto item.local quanto item.Local (maiúscula vs. minúscula)
            const itemLocal = item.local || item.Local;
            return activeLocationFilters.includes(itemLocal);
        });
    }
    
    // Filtrar por categoria (seleção múltipla)
    if (activeCategoryFilters.length > 0) {
        console.log('Filtrando por categoria:', activeCategoryFilters);
        filteredData = filteredData.filter(item => {
            // Verificar tanto item.categoria quanto item.Categoria
            const itemCategoria = item.categoria || item.Categoria;
            return activeCategoryFilters.includes(itemCategoria);
        });
    }
    
    // Filtrar por status (seleção múltipla)
    if (activeStatusFilters.length > 0) {
        console.log('Filtrando por status:', activeStatusFilters);
        filteredData = filteredData.filter(item => {
            // Verificar tanto item.status quanto item.Status
            const itemStatus = item.status || item.Status;
            return activeStatusFilters.includes(itemStatus);
        });
    }
    
    console.log(`Filtros aplicados: encontrados ${filteredData.length} itens de ${dataToFilter.length}`);
    return filteredData;
}

// Filtrar dados
function filterData() {
    console.log('Aplicando filtros...');
    console.log('Filtros de local ativos:', activeLocationFilters);
    console.log('Filtros de categoria ativos:', activeCategoryFilters);
    console.log('Filtros de status ativos:', activeStatusFilters);
    
    const filteredData = getFilteredData();
    console.log(`Dados filtrados: ${filteredData.length} itens de ${itemsCache.length > 0 ? itemsCache.length : mockData.length}`);
    
    renderTable(filteredData);
}

// Formatar valor como moeda
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL' 
    }).format(value);
}

// Função para gerar dados mock quando não há conexão com o servidor
function generateMockDataForServer() {
    return mockData.map(item => ({
        ...item,
        localNovo: '',
        confirmacao: false
    }));
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

// Adicionar opção ao filtro dropdown
function addFilterOption(container, value, type) {
    if (!container) return;
    
    const optionId = `${type}-${value.toLowerCase().replace(/\s+/g, '-')}`;
    
    // Verificar se já existe
    if (document.getElementById(optionId)) return;
    
    const optionDiv = document.createElement('div');
    optionDiv.className = 'dropdown-option';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = optionId;
    checkbox.value = value;
    checkbox.className = `${type}-option`;
    
    const label = document.createElement('label');
    label.htmlFor = optionId;
    label.textContent = value;
    
    optionDiv.appendChild(checkbox);
    optionDiv.appendChild(label);
    
    container.appendChild(optionDiv);
}

// Garantia dupla de inicialização (caso o DOMContentLoaded já tenha disparado)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    console.log('Documento já está pronto, inicializando diretamente');
    setTimeout(initApp, 100);
} else {
    console.log('Aguardando carregamento do documento...');
    window.addEventListener('load', function() {
        console.log('Evento load disparado, inicializando aplicação...');
        setTimeout(initApp, 100);
    });
} 