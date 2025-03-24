// Importar dependências
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const path = require('path');
const queries = require('./queries');

// Criar aplicação Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração da conexão com o SQL Server
const sqlConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: process.env.SQL_ENCRYPT === 'true',
    trustServerCertificate: process.env.SQL_TRUST_SERVER_CERTIFICATE === 'true'
  }
};

// Servir arquivos estáticos do frontend (opcional)
const frontendPath = path.join(__dirname, '..');
app.use(express.static(frontendPath));

// Rota para teste de conexão
app.post('/api/test', async (req, res) => {
  try {
    console.log('Testando conexão com o SQL Server...');
    await sql.connect(sqlConfig);
    const result = await sql.query(queries.testConnectionQuery);
    await sql.close();
    console.log('Conexão bem sucedida!');
    res.json({ success: true, message: 'Conexão bem sucedida!' });
  } catch (err) {
    console.error('Erro na conexão:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rota para buscar dados do imobilizado
app.post('/api/imobilizado/getData', async (req, res) => {
  try {
    console.log('Conectando ao SQL Server para buscar dados...');
    await sql.connect(sqlConfig);
    
    // Usar a consulta enviada pelo cliente ou a consulta padrão do arquivo queries.js
    const queryText = req.body.sqlQuery || queries.getImobilizadoQuery;
    
    console.log('Executando consulta para obter dados de imobilizado');
    const result = await sql.query(queryText);
    await sql.close();
    
    console.log(`Encontrados ${result.recordset.length} registros`);
    res.json({ 
      success: true, 
      items: result.recordset
    });
  } catch (err) {
    console.error('Erro ao buscar dados:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rota para atualizar dados (local e confirmação)
app.post('/api/imobilizado/update', async (req, res) => {
  try {
    const { id, novoLocal, confirmacao } = req.body;
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'ID do item não fornecido' });
    }
    
    console.log(`Atualizando item ${id}: NovoLocal=${novoLocal}, Confirmacao=${confirmacao}`);
    
    await sql.connect(sqlConfig);
    
    // Realizar atualizações separadamente
    if (novoLocal !== undefined) {
      const request = new sql.Request();
      request.input('id', id);
      request.input('local', novoLocal);
      
      console.log('Atualizando local do item');
      await request.query(queries.updateLocalQuery);
    }
    
    if (confirmacao !== undefined) {
      const request = new sql.Request();
      request.input('id', id);
      request.input('confirmacao', confirmacao);
      
      console.log('Atualizando confirmação do item');
      await request.query(queries.updateConfirmacaoQuery);
    }
    
    await sql.close();
    
    res.json({ success: true, message: 'Item atualizado com sucesso' });
  } catch (err) {
    console.error('Erro ao atualizar dados:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rota para verificar status do servidor
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE
  });
});

// Rota para a raiz (redirecionamento para o frontend)
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Configurado para conectar ao SQL Server em ${process.env.SQL_SERVER}`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição não tratada em:', promise, 'motivo:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Exceção não capturada:', error);
}); 