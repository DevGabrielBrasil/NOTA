# 📊 Sistema de Gestão de Notas Fiscais MEI

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?style=for-the-badge&logo=mysql)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)

**Sistema completo para gestão de notas fiscais e cálculo de DAS para MEI**

[🚀 Demo Live](https://seu-projeto.netlify.app) • [📖 Documentação](#-funcionalidades) • [🛠️ Instalação](#-instalação)

</div>

---

## 🎯 Sobre o Projeto

O **Sistema de Gestão de Notas Fiscais MEI** é uma aplicação web completa desenvolvida para microempreendedores individuais (MEI) gerenciarem suas notas fiscais, calcularem o DAS e manterem controle financeiro de forma simples e eficiente.

### ✨ Principais Diferenciais

- 🏠 **100% Local**: Funciona completamente offline após instalação
- 🔒 **Seguro**: Autenticação local com NextAuth.js
- 📱 **Responsivo**: Interface adaptada para desktop e mobile
- 🧮 **Cálculo Automático**: DAS calculado automaticamente por CNPJ
- 📊 **Relatórios**: Geração de PDFs e resumos financeiros
- 🔍 **Busca CNPJ**: Integração com BrasilAPI para dados empresariais

---

## 🚀 Funcionalidades

### 📋 Gestão de Notas Fiscais
- ✅ Criação, edição e exclusão de notas fiscais
- ✅ Cálculo automático de valores (salário, vale-refeição, vale-transporte, DAS)
- ✅ Seleção de período com cálculo de dias úteis
- ✅ Validação de dados com feedback em tempo real

### 💰 Cálculo de DAS
- ✅ Calculadora DAS com valores específicos por CNPJ
- ✅ Valores baseados no tipo de atividade da empresa
- ✅ Histórico de alterações de valores
- ✅ Links diretos para geração oficial do DAS

### 👤 Gestão de Usuários
- ✅ Sistema de registro com validação de CNPJ
- ✅ Autenticação segura com NextAuth.js
- ✅ Perfil de usuário personalizável
- ✅ Sessões locais sem dependência externa

### 📊 Relatórios e Análises
- ✅ Resumo de faturamento mensal/anual
- ✅ Histórico completo de notas fiscais
- ✅ Exportação de dados em PDF
- ✅ Gráficos e métricas visuais

### 🔧 Funcionalidades Administrativas
- ✅ Busca automática de dados por CNPJ (BrasilAPI)
- ✅ Configuração de valores DAS personalizados
- ✅ Backup e restauração de dados
- ✅ Gestão de certidões e documentos

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 15.2.4** - Framework React com SSR
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Shadcn/ui** - Componentes UI modernos
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas

### Backend
- **Next.js API Routes** - APIs serverless
- **NextAuth.js** - Autenticação
- **MySQL** - Banco de dados principal (produção)
- **SQLite** - Banco local para desenvolvimento (arquivo `database.sqlite`)
- **bcryptjs** - Hash de senhas

### Ferramentas de desenvolvimento
- **Beekeeper Studio** - cliente SQL gratuito recomendado para abrir o banco SQLite e inspecionar dados

### Ferramentas
- **Biome** - Linting e formatação
- **jsPDF** - Geração de PDFs
- **date-fns** - Manipulação de datas
- **Recharts** - Gráficos e visualizações

---

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- MySQL 8.0+ (ou XAMPP para desenvolvimento)
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/DevGabrielBrasil/NOTA.git
cd NOTA
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure o banco de dados

#### Opção A: MySQL Local (Recomendado)
```bash
# Inicie o MySQL (XAMPP, WAMP, etc.)
# Crie um banco de dados chamado 'notas_fiscais'
mysql -u root -p
CREATE DATABASE notas_fiscais;
```

#### Opção B: SQLite (Desenvolvimento)
```bash
# O arquivo database.sqlite será criado automaticamente na raiz do projeto
```

> 💡 **Dica:** se estiver usando SQLite e quiser inspecionar ou consultar o banco diretamente, abra o arquivo `database.sqlite` com um cliente SQL como o [Beekeeper Studio](https://www.beekeeperstudio.io/). Ele oferece interface amigável para navegar pelas tabelas, executar queries e visualizar dados.

### 4. Configure as variáveis de ambiente
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
# Banco de dados
DATABASE_URL="mysql://usuario:senha@localhost:3306/notas_fiscais"
# ou para SQLite: DATABASE_URL="file:./database.sqlite"

# NextAuth
NEXTAUTH_SECRET="seu-secret-super-seguro-aqui"
NEXTAUTH_URL="http://localhost:3000"

# APIs Externas (opcional)
BRASIL_API_URL="https://brasilapi.com.br/api"
```

### 5. Execute as migrações
```bash
npm run db:migrate
```

### 6. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) 🎉

---

## 🚀 Deploy

### Netlify (Recomendado)
1. Conecte seu repositório GitHub ao Netlify
2. Configure as variáveis de ambiente no painel do Netlify
3. O deploy será automático a cada push na branch `main`

### Vercel
```bash
npm install -g vercel
vercel --prod
```

### Docker
```bash
docker build -t nota-fiscal-app .
docker run -p 3000:3000 nota-fiscal-app
```

---

## 📖 Como Usar

### 1. Primeiro Acesso
1. Acesse a aplicação
2. Clique em "Registrar"
3. Preencha seus dados (nome, email, CNPJ)
4. Faça login com suas credenciais

### 2. Criando uma Nota Fiscal
1. No dashboard, vá para "Nova Nota"
2. Preencha os dados:
   - Salário base
   - Valor vale-refeição por dia
   - Valor vale-transporte por dia
   - Selecione o período de trabalho
3. O sistema calculará automaticamente:
   - Dias úteis no período
   - Valores totais
   - Valor do DAS baseado no seu CNPJ
4. Clique em "Salvar Nota Fiscal"

### 3. Calculadora DAS
1. Acesse "DAS" no menu
2. Visualize o valor mensal específico do seu CNPJ
3. Use a calculadora para projeções anuais
4. Acesse links diretos para gerar DAS oficial

### 4. Relatórios
1. Vá para "Histórico" para ver todas as notas
2. Use filtros por período
3. Exporte relatórios em PDF
4. Visualize resumos no dashboard

---

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção

# Qualidade de código
npm run lint         # Executa linting
npm run format       # Formata código
npm run check        # Verifica código (lint + format)

# Banco de dados
npm run db:migrate   # Executa migrações
npm run db:seed      # Popula dados iniciais
npm run db:reset     # Reseta banco de dados

# Componentes
npm run shadcn:add   # Adiciona componentes Shadcn/ui
```

---

## 📁 Estrutura do Projeto

```
NOTA/
├── 📁 app/                    # App Router (Next.js 13+)
│   ├── 📁 api/               # API Routes
│   ├── 📁 dashboard/         # Páginas do dashboard
│   ├── 📁 login/            # Página de login
│   └── 📁 registro/         # Página de registro
├── 📁 components/            # Componentes React
│   ├── 📁 ui/               # Componentes base (Shadcn)
│   └── 📄 *.tsx             # Componentes específicos
├── 📁 lib/                   # Utilitários e configurações
│   ├── 📄 database.ts       # Conexão com banco
│   └── 📄 auth-config.ts    # Configuração NextAuth
├── 📁 types/                 # Definições TypeScript
├── 📁 hooks/                 # Custom hooks
├── 📁 contexts/              # Context providers
├── 📁 actions/               # Server actions
├── 📁 utils/                 # Funções utilitárias
└── 📁 .kiro/                 # Especificações técnicas
    └── 📁 specs/            # Documentação de features
```

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### 📋 Diretrizes de Contribuição
- Siga os padrões de código existentes
- Adicione testes para novas funcionalidades
- Atualize a documentação quando necessário
- Use commits semânticos (feat, fix, docs, etc.)

---

## 🐛 Reportar Bugs

Encontrou um bug? Ajude-nos a melhorar!

1. Verifique se o bug já foi reportado nas [Issues](https://github.com/DevGabrielBrasil/NOTA/issues)
2. Se não, crie uma nova issue com:
   - Descrição clara do problema
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Screenshots (se aplicável)
   - Informações do ambiente (OS, browser, etc.)

---

## 📋 Roadmap

### 🚧 Em Desenvolvimento
- [ ] Sistema de backup automático
- [ ] Integração com contadores
- [ ] App mobile (React Native)
- [ ] Dashboard analytics avançado

### 🎯 Próximas Versões
- [ ] Multi-tenancy para contadores
- [ ] Integração com bancos (Open Banking)
- [ ] Relatórios fiscais automatizados
- [ ] Sistema de notificações

### 💡 Ideias Futuras
- [ ] IA para categorização automática
- [ ] Integração com e-commerce
- [ ] API pública para terceiros
- [ ] Módulo de estoque

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

**Gabriel Brasil**
- GitHub: [@DevGabrielBrasil](https://github.com/DevGabrielBrasil)
- LinkedIn: [Gabriel Brasil](https://linkedin.com/in/gabriel-brasil)
- Email: gabriel.f.wlt@gmail.com
---

<div align="center">

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

**📢 Compartilhe com outros MEIs que podem se beneficiar!**

</div>
