const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para a janela de renderização
contextBridge.exposeInMainWorld('electronAPI', {
    // API para consultar o banco de dados
    queryDatabase: async (serverUrl, username, password, query, database) => {
        return await ipcRenderer.invoke('query-database', serverUrl, username, password, query, database);
    },
    
    // API para atualizar o banco de dados
    updateDatabase: async (serverUrl, username, password, modifiedItems, database) => {
        return await ipcRenderer.invoke('update-database', serverUrl, username, password, modifiedItems, database);
    },
    
    // API para obter o caminho do usuário
    getUserPath: async (type) => {
        return await ipcRenderer.invoke('get-user-path', type);
    },
    
    // Versão da aplicação
    getAppVersion: async () => {
        return await ipcRenderer.invoke('get-app-version');
    }
});

// Adicionar informações de ambiente
window.isElectron = true;
window.electronVersion = process.versions.electron; 