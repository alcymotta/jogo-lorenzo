# 🌐 Hospedagem no GitHub Pages - Guia Completo

## Passo 1: Criar Repositório no GitHub

1. Acesse [github.com](https://github.com) e faça login
2. Clique em **"+"** (canto superior direito) → **"New repository"**
3. **Nome do repositório:** `lorenzo` (ou `jogo-lorenzo`)
4. **Descrição:** "Ilha de Capibara - 3D Browser Game"
5. **Selecione:** Public (importante para GitHub Pages gratuito)
6. **Clique:** "Create repository"

---

## Passo 2: Inicializar Git Localmente

Abra o **PowerShell** na pasta do jogo:

```powershell
cd "c:\Users\Alcy Motta\Documents\Jogo Lorenzo"

# Iniciar repositório git
git init

# Configurar seu nome e email (use os do GitHub)
git config user.name "Seu Nome"
git config user.email "seu-email@github.com"

# Adicionar todos os arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit: Ilha de Capibara 3D Game"
```

---

## Passo 3: Conectar com GitHub

No PowerShell, execute:

```powershell
# Adicionar remote (substitua USERNAME pelo seu usuário GitHub)
git remote add origin https://github.com/USERNAME/lorenzo.git

# Rebatizar branch para 'main' (padrão do GitHub)
git branch -M main

# Fazer push para GitHub
git push -u origin main
```

**Será solicitada autenticação:**
- Username: seu usuário do GitHub
- Password: [gera um token](https://github.com/settings/tokens/new?scopes=repo)
  - Ou use sua senha se 2FA não estiver ativado

---

## Passo 4: Ativar GitHub Pages

1. Vá ao seu repositório no GitHub
2. Clique em **Settings** (engrenagem, à direita)
3. Na barra lateral, selecione **"Pages"**
4. Em **"Source", selecione:**
   - Branch: `main`
   - Folder: `/ (root)`
5. Clique **"Save"**
6. Aguarde 2-3 minutos
7. A URL aparecerá em azul: `https://USERNAME.github.io/lorenzo`

---

## Passo 5: Acessar seu Jogo!

Após a ativação, acesse:
```
https://USERNAME.github.io/lorenzo
```

---

## 📌 Alternativa: Usar com Seu Domíno (ottagames.com.br)

Se quer usar seu domínio existente ao invés do github.io:

### Opção A: CNAME (Recomendado)

1. No repositório Settings → Pages
2. Em "Custom domain", adicione: `lorenzo.ottagames.com.br`
3. Clique "Save"
4. GitHub criará um arquivo `CNAME` automaticamente
5. **No seu provedor de domínio** (onde registrou ottagames.com.br):
   - Vá às configurações DNS
   - Adicione um registro **CNAME**:
     ```
     Nome: lorenzo
     Valor: USERNAME.github.io
     ```
   - Ou use **ALIAS/ANAME** se o provedor suportar:
     ```
     Nome: ricardo.ottagames.com.br
     Valor: USERNAME.github.io
     ```

6. Aguarde propagação DNS (5-48 horas)
7. Acesse: `https://lorenzo.ottagames.com.br`

### Opção B: Usar Subpasta (Mais Fácil)

Se quer manter `www.ottagames.com.br/lorenzo`:

1. Mantenha o jogo no GitHub Pages em: `https://USERNAME.github.io/lorenzo`
2. **No seu site principal** (onde ottagames.com.br está hospedado):
   - Crie um iframe ou um link que redirecione para:
   ```html
   <a href="https://USERNAME.github.io/lorenzo">Jogar Ilha de Capibara</a>
   ```

---

## 🔄 Atualizar o Jogo (Depois de Mudanças)

Sempre que fizer alterações locais:

```powershell
cd "c:\Users\Alcy Motta\Documents\Jogo Lorenzo"

# Ver status
git status

# Adicionar alterações
git add .

# Fazer commit
git commit -m "Descrição da mudança"

# Enviar para GitHub
git push origin main
```

GitHub Pages atualiza automaticamente em 1-2 minutos.

---

## 🐛 Troubleshooting

### GitHub Pages não aparece
- Verifique se o repositório é **Public**
- Aguarde 5-10 minutos após ativar Pages
- Verifique em Settings → Pages se há erro

### Jogo carrega mas muitos erros no console
- Verifique se todos os arquivos foram enviados: `git status`
- Verifique paths em index.html (devem ser relativos: `js/game.js`)

### Quero usar domínio customizado
- Siga a **Opção A: CNAME** acima
- Consulte seu provedor DNS sobre como adicionar registros

---

## 📊 Resumo Rápido

| Item | Descrição |
|------|-----------|
| **Repositório** | Public no GitHub |
| **Branch** | main |
| **URL Gratuita** | https://USERNAME.github.io/lorenzo |
| **URL Customizada** | lorenzo.ottagames.com.br (com DNS CNAME) |
| **Atualizar** | `git push origin main` |
| **Tempo Deploy** | 1-2 minutos |

---

## ✅ Checklist Final

- [ ] Repositório criado no GitHub (público)
- [ ] Git inicializado localmente (`git init`)
- [ ] Arquivos adicionados (`git add .`)
- [ ] Commit feito (`git commit`)
- [ ] Conectado ao GitHub (`git remote add origin`)
- [ ] Enviado para GitHub (`git push`)
- [ ] Pages ativado em Settings
- [ ] URL disponível e funcionando

---

## 📞 Precisa de Ajuda?

- Dúvidas sobre Git: `git help` ou [github.com/help](https://github.com/help)
- Dúvidas sobre GitHub Pages: [docs.github.com/pages](https://docs.github.com/en/pages)
- Dúvidas sobre DNS: Contate seu provedor de domínio
