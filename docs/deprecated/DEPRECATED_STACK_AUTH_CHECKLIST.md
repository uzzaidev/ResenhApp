# Checklist de Verificação - Stack Auth

Use este checklist para verificar se a autenticação Stack Auth está funcionando corretamente.

## ✅ Verificações de Build

- [x] `npm run build` executa sem erros
- [x] `npm run lint` executa sem warnings
- [x] Todas as rotas da API foram atualizadas
- [x] Middleware usa Stack Auth
- [x] Layout tem StackProvider

## 📋 Variáveis de Ambiente

Verifique se estas variáveis estão configuradas:

### Local (.env)
```bash
# Stack Auth
NEXT_PUBLIC_STACK_PROJECT_ID=1bc505ea-b01d-44d6-af8d-c1fd464802d0
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_9an479dt7xvdscvay3cqaj8vapewdhcfn7hzw0wq2pagg
STACK_SECRET_SERVER_KEY=ssk_j6g9mqkg2z1yjz8w6nn0sk0frwmt502yeeb4ypwp0bs18

# Database
DATABASE_URL=postgresql://...
```

### Vercel (Production)
- [ ] As mesmas variáveis estão no Vercel Dashboard
- [ ] Environment: Production, Preview e Development

## 🧪 Testes a Fazer

### 1. Login Flow (Local)
```bash
npm run dev
```

- [ ] Acesse http://localhost:3000
- [ ] Tente acessar /dashboard sem estar logado → deve redirecionar para /auth/signin
- [ ] Acesse /auth/signin
- [ ] Insira seu email
- [ ] Verifique se recebe o magic link no email
- [ ] Clique no magic link
- [ ] Deve ser redirecionado para /dashboard autenticado

### 2. Protected Routes
- [ ] Acesse /dashboard → deve mostrar suas informações
- [ ] Tente criar um grupo → deve funcionar
- [ ] Tente criar um evento → deve funcionar
- [ ] Faça logout → deve redirecionar para /auth/signin

### 3. API Routes
```bash
# Teste com curl ou Postman

# Sem autenticação (deve retornar 401)
curl http://localhost:3000/api/groups

# Com autenticação (após login, use o cookie)
curl http://localhost:3000/api/groups \
  -H "Cookie: stack-session=..."
```

### 4. Middleware
- [ ] Páginas públicas (/, /simple-test) acessíveis sem login
- [ ] Páginas protegidas redirecionam para /auth/signin
- [ ] Usuários logados não podem acessar /auth/signin (redirecionam para /dashboard)

## 🚀 Deploy no Vercel

### Pré-Deploy
- [ ] Commit e push das mudanças
- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Build local passa sem erros

### Deploy
```bash
git push origin main
# ou
vercel --prod
```

### Pós-Deploy
- [ ] Deploy bem-sucedido
- [ ] Acesse a URL do Vercel
- [ ] Teste o login flow completo
- [ ] Verifique se o magic link funciona
- [ ] Teste criar grupo/evento
- [ ] Verifique logs no Vercel Dashboard

## 🔍 Troubleshooting

### Erro: "Não autenticado" em todas as rotas
**Causa**: Variáveis de ambiente não configuradas corretamente

**Solução**:
```bash
# Verifique se as variáveis estão no .env
cat .env | grep STACK

# Se não estiverem, copie do .env no repositório
```

### Erro: Magic link não é enviado
**Causa**: Configuração de email no Stack Auth

**Solução**:
1. Acesse o painel do Stack Auth
2. Verifique a configuração de email
3. Teste com um email que você tenha acesso
4. Verifique spam/lixeira

### Erro: "useContext is not exported from 'react'"
**Causa**: Warning do Stack Auth SDK com React 19

**Impacto**: Nenhum - é apenas um warning, não afeta funcionalidade

**Ação**: Pode ignorar - será corrigido em futuras versões do Stack SDK

### Erro: Usuário não é criado no banco
**Causa**: Problema na conexão com o banco ou na tabela users

**Solução**:
```bash
# Verifique a conexão
psql $DATABASE_URL -c "SELECT 1"

# Verifique se a tabela users existe
psql $DATABASE_URL -c "\dt users"

# Se necessário, rode as migrations novamente
psql $DATABASE_URL < src/db/schema.sql
```

## 📊 Métricas de Sucesso

✅ **Build**: Sem erros
✅ **Linting**: Sem warnings
✅ **Login**: Magic link funciona
✅ **Proteção**: Rotas protegidas redirecionam
✅ **API**: Rotas requerem autenticação
✅ **Sincronização**: Usuários são criados no banco

## 📚 Recursos

- [Stack Auth Guide](./STACK_AUTH_GUIDE.md)
- [Migration Summary](./MIGRATION_SUMMARY.md)
- [Stack Auth Docs](https://docs.stack-auth.com/)
- [Neon Auth Guide](https://neon.tech/docs/guides/auth)

## ✉️ Suporte

Se encontrar problemas:
1. Verifique os logs no console do navegador
2. Verifique os logs no Vercel Dashboard
3. Consulte a documentação do Stack Auth
4. Abra uma issue no repositório

## 🎉 Tudo Certo?

Se todos os checks estão ✅:
- Parabéns! A autenticação está funcionando perfeitamente
- Você pode começar a usar o app normalmente
- Considere configurar email templates personalizados no Stack Auth
- (Opcional) Adicione OAuth providers (Google, GitHub)
