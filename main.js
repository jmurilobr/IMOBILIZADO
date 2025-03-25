const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const sql = require('mssql');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        icon: path.join(__dirname, 'CONFERÊNCIA-IMOBILIZADO.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: true,
            webSecurity: false,
            allowRunningInsecureContent: true
        }
    });

    // Carrega o arquivo index.html
    mainWindow.loadFile('index.html');

    // Abre as ferramentas de desenvolvedor em modo de desenvolvimento
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// IPC handler para consultas SQL
ipcMain.handle('query-database', async (event, server, username, password, query, database) => {
    try {
        // Configurar a conexão
        const config = {
            user: username,
            password: password,
            server: server,
            database: database || 'CONTROLLER',
            options: {
                encrypt: false,
                trustServerCertificate: true
            }
        };

        // Conectar ao banco
        await sql.connect(config);
        
        // Executar a consulta
        const result = await sql.query(query);
        
        // Fechar a conexão
        await sql.close();
        
        return {
            success: true,
            items: result.recordset
        };
    } catch (error) {
        console.error('Erro na consulta SQL:', error);
        await sql.close();
        return {
            success: false,
            error: error.message
        };
    }
});

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
}); 