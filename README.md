# Sistema de Conferência de Imobilizado

Um aplicativo simples para conferência de imobilizado (inventário de ativos fixos) desenvolvido com HTML, CSS e JavaScript.

## Funcionalidades

- Busca por nome de item
- Filtros por local, categoria e status
- Visualização de itens em formato de tabela
- Possibilidade de alterar o local de um item
- Marcação de status (confirmação) de cada item
- Exportação dos dados
- Configuração de colunas visíveis

## Como Usar

1. Abra o arquivo `index.html` em qualquer navegador web moderno
2. Configure a conexão com o servidor clicando no ícone de engrenagem
3. Utilize a barra de busca para encontrar itens por nome
4. Use os filtros para restringir a visualização por local, categoria ou status
5. Para mudar um item de local, selecione o novo local na coluna "Mudar P/"
6. Marque ou desmarque os checkboxes na coluna "Confirmação" para confirmar a conferência
7. Clique em "Salvar Alterações" para registrar as mudanças feitas
8. Use o botão "Exportar Dados" para copiar os dados em formato JSON

## Conexão com Banco de Dados SQL Server

### Importante: Restrição CORS em Navegadores Web

Navegadores web têm uma restrição de segurança chamada CORS (Cross-Origin Resource Sharing) que impede que páginas web acessem diretamente bancos de dados ou APIs em outros domínios/servidores sem a configuração adequada.

Para fazer sua aplicação funcionar com um SQL Server na rede local (como o 10.142.111.2), você precisa de uma das seguintes soluções:

### Opção 1: Configurar um Backend (Recomendado)

1. Crie um servidor web simples usando Node.js, PHP, ASP.NET ou outra tecnologia de sua preferência
2. Implemente endpoints API REST para:
   - Autenticação de usuários
   - Buscar dados do SQL Server
   - Salvar alterações no SQL Server
3. Configure o CORS no seu backend para permitir requisições do seu aplicativo

Exemplo de código para um backend Node.js simples que se conecta ao SQL Server:

```javascript
// api-server.js - Exemplo de um backend Node.js simples
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const app = express();
const port = 3000;

// Configurar CORS para permitir acesso da aplicação
app.use(cors());
app.use(express.json());

// Configuração de conexão com o SQL Server
const sqlConfig = {
  user: 'seu_usuario',
  password: 'sua_senha',
  server: '10.142.111.2', // IP do seu servidor SQL
  database: 'seu_banco',
  options: {
    trustServerCertificate: true // Para desenvolvimento local
  }
};

// Endpoint para testar conexão
app.post('/api/test', async (req, res) => {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query`SELECT 1 as teste`;
    await sql.close();
    res.json({ success: true, message: 'Conexão bem sucedida!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint para buscar dados de imobilizado
app.post('/api/imobilizado/getData', async (req, res) => {
  try {
    await sql.connect(sqlConfig);
    // Você pode usar a consulta enviada pelo cliente ou uma consulta fixa
    const query = req.body.sqlQuery || `SELECT * FROM SuaTabelaDeImobilizado`;
    const result = await sql.query(query);
    await sql.close();
    res.json({ success: true, items: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});
```

Para executar este backend:
1. Instale o Node.js
2. Crie um diretório para o servidor
3. Execute `npm init -y`
4. Instale as dependências: `npm install express cors mssql`
5. Salve o código acima como `api-server.js`
6. Execute `node api-server.js`
7. Configure o aplicativo para usar a URL `http://localhost:3000` como servidor

### Opção 2: Usar um Servidor Web Local com sua Aplicação

1. Configure um servidor web local (como Apache, IIS, etc.)
2. Coloque sua aplicação HTML/JS/CSS neste servidor
3. Configure o mesmo servidor para ter endpoints de API que se comunicam com o SQL Server
4. Como o frontend e backend estão no mesmo servidor, não haverá problema de CORS

### Opção 3: Modo de Simulação (Atual)

A aplicação atualmente tem um modo de simulação para o IP 10.142.111.2 que:
1. Carrega dados de exemplo quando você configura a conexão
2. Simula o comportamento da aplicação sem conexão real com o banco

Este modo é útil para demonstração, mas não reflete dados reais do SQL Server.

## Compilação para Aplicativo Nativo

Para compilar este aplicativo web em um aplicativo nativo, recomenda-se utilizar:

- [Electron](https://www.electronjs.org/) - Para criar aplicativos desktop para Windows, Mac e Linux
- [Capacitor](https://capacitorjs.com/) ou [Cordova](https://cordova.apache.org/) - Para criar aplicativos móveis

Um aplicativo nativo em Electron pode acessar diretamente o SQL Server sem as restrições de CORS que existem em navegadores.

## Requisitos do Sistema

- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Para conexão real com banco de dados: um servidor web com API REST que se conecte ao SQL Server

## Próximos Passos

- Implementar um backend para conexão real com o banco de dados SQL
- Adicionar autenticação de usuários
- Desenvolver funcionalidade de geração de relatórios
- Compilar para uso como aplicativo nativo usando Electron 