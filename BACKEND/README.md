# Backend para Sistema de Conferência de Imobilizado

Este é um servidor backend Node.js que conecta o aplicativo de conferência de imobilizado ao banco de dados SQL Server.

## Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Acesso ao SQL Server

## Instalação

1. Navegue até a pasta BACKEND:
   ```
   cd BACKEND
   ```

2. Instale as dependências:
   ```
   npm install
   ```
   ou
   ```
   yarn install
   ```

3. Configure as variáveis de ambiente:
   - Edite o arquivo `.env` com suas credenciais do SQL Server
   ```
   SQL_USER=seu_usuario
   SQL_PASSWORD=sua_senha
   SQL_SERVER=10.142.111.2
   SQL_DATABASE=seu_banco
   ```

## Executando o Servidor

### Desenvolvimento

Para executar o servidor em modo de desenvolvimento (com reinicialização automática):

```
npm run dev
```

### Produção

Para executar o servidor em modo de produção:

```
npm start
```

O servidor será iniciado em http://localhost:3000 (ou na porta definida no arquivo .env).

## Rotas da API

### Testar Conexão
- **URL**: `/api/test`
- **Método**: POST
- **Corpo**:
  ```json
  {
    "username": "seu_usuario",
    "password": "sua_senha"
  }
  ```
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "message": "Conexão bem sucedida!"
  }
  ```

### Buscar Dados do Imobilizado
- **URL**: `/api/imobilizado/getData`
- **Método**: POST
- **Corpo**:
  ```json
  {
    "username": "seu_usuario",
    "password": "sua_senha",
    "sqlQuery": "SELECT * FROM SuaTabelaDeImobilizado" // Opcional
  }
  ```
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "items": [
      {
        "codigo": "001",
        "item": "Computador Dell",
        "descricao": "Computador desktop Dell Optiplex 7010",
        "categoria": "Equipamento Eletrônico",
        "local": "Sala 101",
        "valorAquisicao": 3500.00,
        "status": "Ativo"
      },
      // ... mais itens
    ]
  }
  ```

### Atualizar Dados do Imobilizado
- **URL**: `/api/imobilizado/update`
- **Método**: POST
- **Corpo**:
  ```json
  {
    "id": "001",
    "novoLocal": "Sala 102",    // Opcional
    "confirmacao": true        // Opcional
  }
  ```
- **Resposta de Sucesso**:
  ```json
  {
    "success": true,
    "message": "Item atualizado com sucesso"
  }
  ```

## Adaptação ao Seu Banco de Dados

Você provavelmente precisará adaptar as consultas SQL no arquivo `server.js` para corresponder à estrutura do seu banco de dados. Procure por:

1. A consulta na rota `/api/imobilizado/getData`
2. O nome da tabela `SuaTabelaDeImobilizado` 
3. Os nomes de colunas nas consultas

## Integração com o Frontend

No frontend, atualize as configurações para apontar para este backend:

```javascript
// No arquivo script.js do frontend
appConfig.server.url = 'http://localhost:3000';
```

## Solução de Problemas

Se encontrar erros ao conectar ao SQL Server:

1. Verifique se o SQL Server está acessível a partir da máquina que executa o backend
2. Confirme se as credenciais no arquivo `.env` estão corretas
3. Verifique os logs do console para mensagens de erro detalhadas
4. Garanta que o usuário tem permissão para acessar o banco de dados especificado 