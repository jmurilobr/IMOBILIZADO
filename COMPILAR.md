# Instruções para Compilação do Imobilizado ABC

Este documento explica como compilar a aplicação Imobilizado ABC para Windows.

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18 ou superior)
- [Git](https://git-scm.com/) (opcional, mas recomendado)

## Configuração Inicial

1. Clone o repositório ou baixe os arquivos do projeto:
   ```
   git clone https://github.com/jmurilobr/IMOBILIZADO.git
   cd IMOBILIZADO
   ```

2. Instale as dependências necessárias:
   ```
   npm install
   ```

## Compilação para Windows (.exe)

Para criar um aplicativo desktop Windows:

1. Execute o comando de build para Windows:
   ```
   npm run build:win
   ```

2. Após a conclusão, os arquivos de instalação estarão disponíveis na pasta `dist`.

3. Execute o instalador `.exe` na pasta `dist` para instalar a aplicação.

## Funcionalidades da Aplicação

### Conexão direta com SQL Server

- A aplicação se conecta diretamente ao SQL Server dentro da rede corporativa
- Não é necessário backend intermediário
- As configurações de conexão são definidas na interface da aplicação

### Funcionalidade Offline

- A aplicação armazena os dados em cache local automaticamente
- Mesmo sem conexão, todos os dados da última sincronização estão disponíveis
- As alterações feitas offline são salvas no cache local
- Quando a conexão for restabelecida, as alterações são sincronizadas com o servidor

### Configuração de Acesso SQL

1. Clique no ícone de engrenagem no canto superior direito
2. Clique no botão "Configurar Acesso SQL"
3. Informe os dados de conexão:
   - Servidor SQL (padrão: 10.142.111.2)
   - Base de Dados (padrão: CONTROLLER)
   - Usuário (padrão: controllerabc.bi)
   - Senha (padrão: ASp#$I!17QF0)
4. Clique em "Testar Conexão" para verificar
5. Clique em "Salvar" para confirmar

### Armazenamento Local

- As configurações e os dados são salvos no localStorage do navegador
- As alterações locais são mantidas até que possam ser sincronizadas
- A sincronização ocorre automaticamente quando há conexão
- O usuário pode forçar a sincronização manual através do botão "Atualizar"

## Personalização

- A aplicação usa o ícone "CONFERÊNCIA-IMOBILIZADO.ico" como ícone do aplicativo
- O ícone é usado tanto na barra de tarefas quanto no arquivo executável

## Notas Importantes

- A aplicação Windows tem acesso direto ao SQL Server sem problemas de CORS
- Todos os componentes estão incorporados no aplicativo, não há dependências externas
- Para distribuição, use o instalador gerado na pasta `dist`

## Solução de Problemas

### Erros de Compilação Windows
- Verifique se todas as dependências foram instaladas corretamente
- Limpe a pasta `node_modules` e reinstale se necessário
- Verifique a versão do Node.js (recomendamos a versão LTS mais recente)

### Erros de Conexão com SQL Server
- Verifique se o endereço IP do servidor está correto
- Confirme se as credenciais de acesso estão corretas
- Verifique se a base de dados especificada existe e está acessível
- Certifique-se de que seu computador está conectado à rede corporativa

## Suporte

Em caso de problemas ou dúvidas sobre a compilação, entre em contato com o desenvolvedor responsável. 