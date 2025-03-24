# Instruções para o Repositório Git

## Configuração com Token de Autenticação

1. Configuração já realizada:
   - Usuário: jmurilobr
   - Email: jmurilobr@hotmail.com
   - Repositório: https://github.com/jmurilobr/IMOBILIZADO.git

2. Para utilizar um token de autenticação:
   - Após gerar o token no GitHub, use o seguinte formato para push:
   ```
   git remote set-url origin https://[SEU_TOKEN]@github.com/jmurilobr/IMOBILIZADO.git
   ```
   - Substitua [SEU_TOKEN] pelo token gerado no GitHub

## Branches

- `main` - Versão estável da aplicação
- `desenvolvimento` - Branch para novas funcionalidades

## Comandos Úteis

### Para salvar alterações:
```
git add .
git commit -m "Descrição das alterações"
```

### Para alternar entre branches:
```
git checkout main
git checkout desenvolvimento
```

### Para sincronizar com GitHub:
```
git push origin main
git push origin desenvolvimento
```

### Para buscar atualizações:
```
git pull origin main
git pull origin desenvolvimento
```

## Configuração de repositório remoto

Para configurar um repositório remoto privado no GitHub ou similar:

1. Crie um repositório privado no GitHub com o nome "IMOBILIZADO-ABC"
2. Siga as instruções fornecidas pelo GitHub para adicionar um repositório remoto:
   ```
   git remote add origin https://github.com/jmurilobr/IMOBILIZADO-ABC.git
   git push -u origin main
   ```

## Mantendo o repositório privado

Este projeto está configurado como um repositório privado. Para manter essa configuração ao usar serviços como GitHub ou GitLab, certifique-se de que a opção "Privado" esteja selecionada ao criar o repositório remoto. 