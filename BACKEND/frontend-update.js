/**
 * INSTRUÇÕES PARA ATUALIZAR O FRONTEND
 * 
 * Este arquivo contém o código que deve ser modificado no script.js do frontend
 * para utilizar o backend Node.js em vez da simulação atual.
 * 
 * NÃO é necessário executar este arquivo - ele serve apenas como referência.
 */

// 1. Modificar a função loadDataFromServer() para usar o novo backend
// Substitua a implementação atual por esta:

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
        
        console.log('Tentando conectar a:', normalizedUrl);
        
        // Usar o backend Node.js para buscar dados
        try {
            // API endpoint do backend
            const apiUrl = `${normalizedUrl}/api/imobilizado/getData`;
            console.log('Tentando API URL:', apiUrl);
            
            const requestData = {
                username: appConfig.server.username,
                password: appConfig.server.password
                // Não é necessário enviar a consulta SQL, pois o backend já possui uma padrão
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
                        confirmacao: item.confirmacao === 1 || item.confirmacao === true // Converter para booleano
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
            throw networkError; // Propagar o erro para ser tratado acima
        }
    } catch (error) {
        console.error('Erro ao carregar dados do servidor:', error);
        showLoading(false);
        alert('Erro ao carregar dados do servidor. Verifique as configurações de conexão e tente novamente.');
        return false;
    }
}

// 2. Modificar a função testConnection() para usar o novo backend
// Substitua a implementação atual por esta:

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
        
        console.log('Testando conexão com servidor:', normalizedUrl);
        
        // Usar a API de teste do backend
        const testUrl = `${normalizedUrl}/api/test`;
        console.log('Tentando API URL:', testUrl);
        
        const response = await fetch(testUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
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
        alert(`Erro ao testar conexão: ${error.message}`);
    }
}

// 3. Modificar a função saveChanges() para usar o backend
// Substitua a implementação atual por esta:

async function saveChanges() {
    const rows = itemsTableBody.querySelectorAll('tr');
    let changes = false;
    let updatePromises = [];
    
    for (const row of rows) {
        const id = row.dataset.id;
        if (!id) continue; // Pular linhas sem ID
        
        const item = mockData.find(item => item.id === id);
        if (!item) continue;
        
        // Verificar mudança de local
        const locationSelect = row.querySelector('.change-location');
        const newLocation = locationSelect && locationSelect.value ? locationSelect.value : undefined;
        
        // Verificar mudança de status
        const statusCheckbox = row.querySelector('.status-checkbox');
        const newConfirmation = statusCheckbox && 
            statusCheckbox.checked.toString() !== statusCheckbox.dataset.originalValue ? 
            statusCheckbox.checked : undefined;
        
        // Se houver alterações, enviar para o servidor
        if (newLocation !== undefined || newConfirmation !== undefined) {
            changes = true;
            
            // Criar a atualização
            const updateData = {
                id: id,
                novoLocal: newLocation,
                confirmacao: newConfirmation
            };
            
            // Adicionar à lista de promessas de atualização
            const updatePromise = fetch(`${normalizeUrl(appConfig.server.url)}/api/imobilizado/update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            }).then(response => {
                if (!response.ok) {
                    return response.json().then(data => {
                        throw new Error(data.error || `Erro ${response.status}`);
                    });
                }
                return response.json();
            }).then(data => {
                if (data.success) {
                    // Atualizar o item local
                    if (newLocation) {
                        item.local = newLocation;
                        if (locationSelect) {
                            locationSelect.dataset.originalValue = newLocation;
                            locationSelect.value = '';
                        }
                    }
                    
                    if (newConfirmation !== undefined) {
                        item.confirmacao = newConfirmation;
                        if (statusCheckbox) {
                            statusCheckbox.dataset.originalValue = newConfirmation;
                        }
                    }
                    
                    return true;
                } else {
                    throw new Error(data.message || 'Falha na atualização');
                }
            }).catch(error => {
                console.error(`Erro ao atualizar item ${id}:`, error);
                return false;
            });
            
            updatePromises.push(updatePromise);
        }
    }
    
    if (changes) {
        showLoading(true);
        
        // Aguardar todas as atualizações
        const results = await Promise.all(updatePromises);
        
        showLoading(false);
        
        // Verificar se todas as atualizações foram bem-sucedidas
        const allSuccessful = results.every(result => result === true);
        
        if (allSuccessful) {
            alert('Alterações salvas com sucesso!');
        } else {
            alert('Algumas alterações não puderam ser salvas. Verifique o console para mais detalhes.');
        }
        
        // Atualizar a tabela
        filterData();
    } else {
        alert('Nenhuma alteração para salvar.');
    }
} 