# AtomicMe

AtomicMe é um aplicativo web de rastreamento de hábitos construído em cima dos conceitos do livro *Hábitos Atômicos* de James Clear. A ideia central não é contar quantos hábitos você completou — é sobre quem você está se tornando. Cada funcionalidade foi pensada para reforçar a construção de identidade através de pequenas ações diárias.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square)

---

## Sobre o projeto

O AtomicMe traduz os principais conceitos do livro em funcionalidades reais:

- **Identidade como núcleo** — cada hábito é um voto para o tipo de pessoa que você quer ser
- **As 4 leis do comportamento** — formulário guiado: torne óbvio, atrativo, fácil e satisfatório
- **Habit Stacking** — encadeie hábitos na fórmula *"Depois de X, farei Y"*
- **Regra dos 2 minutos** — campo obrigatório de versão mínima do hábito
- **Nunca perca dois dias seguidos** — alerta visual de recuperação
- **Recompensas imediatas** — sistema de XP, níveis e badges por consistência

---

## Funcionalidades

### Dashboard
Visão geral do dia com saudação dinâmica, card de identidade ativa, três métricas principais (hábitos do dia, streak atual e taxa semanal), heatmap dos últimos 21 dias e a lista de hábitos com checkbox interativo. Inclui alerta automático quando o usuário perde um dia para incentivar a retomada imediata.

### Hábitos
Formulário em duas etapas baseado nas 4 leis do comportamento. Na primeira etapa o usuário preenche o gatilho (onde e quando), a motivação (por que importa), a versão mínima (regra dos 2 minutos) e a recompensa imediata. Na segunda etapa define o nome do hábito e vincula a uma identidade existente ou cria uma nova. Cada hábito tem uma página de detalhe com histórico em calendário de 30 dias, estatísticas de streak e taxa de conclusão.

### Habit Stacking
Correntes visuais de hábitos encadeados. O usuário monta sequências de hábitos conectados por linhas e pela fórmula textual. É possível reordenar os elos, adicionar ou remover hábitos, e marcar toda a corrente como completa de uma vez com bônus de XP.

### Identidade
Gerenciamento de identidades pessoais com frases editáveis inline no formato *"Sou uma pessoa que..."*. Cada identidade acumula XP próprio e exibe os hábitos vinculados. A página também mostra a barra de nível geral e a tabela completa de como ganhar XP.

### Conquistas
Grid de badges desbloqueadas e lista de badges em progresso com barras individuais. O card de identidade no topo exibe a barra de XP segmentada em 20 blocos.

### Recompensas
Recompensas pessoais vinculadas a metas de streak. Recompensas disponíveis (streak atingido) são destacadas visualmente. Recompensas bloqueadas mostram o progresso atual em relação à meta.

---

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js 14 | App Router, Server Components, Server Actions |
| TypeScript | Tipagem estrita em todo o projeto |
| Prisma ORM | Acesso ao banco com SQLite local |
| NextAuth.js | Autenticação com e-mail/senha e Google OAuth |
| bcrypt | Hash de senhas |
| Tailwind CSS | Estilização com design system em CSS variables |
| Recharts | Heatmap e gráficos |
| Zod | Validação de formulários e Server Actions |

---

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior

---

## Instalação e execução

**1. Clone o repositório**

```bash
git clone https://github.com/seu-usuario/atomicme.git
cd atomicme
```

**2. Instale as dependências**

```bash
npm install
```

**3. Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="uma-string-longa-e-aleatoria-aqui"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Para gerar um `NEXTAUTH_SECRET` seguro:
```bash
openssl rand -base64 32
```

O Google OAuth é opcional. Para desenvolvimento local, o login com e-mail e senha funciona sem configuração adicional.

**4. Crie o banco de dados**

```bash
npx prisma migrate dev --name init
```

**5. Popule os badges padrão**

```bash
npm run db:seed
```

**6. Inicie o servidor**

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar em modo produção |
| `npm run db:migrate` | Rodar migrations pendentes |
| `npm run db:seed` | Popular badges no banco |
| `npm run db:studio` | Abrir Prisma Studio (interface visual do banco) |
| `npm run db:reset` | Resetar banco completamente e re-seed |

---

## Estrutura de arquivos

```
atomicme/
├── prisma/
│   ├── schema.prisma       # Modelos do banco de dados
│   └── seed.ts             # Dados iniciais (badges)
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   └── login/      # Tela de login e cadastro
    │   ├── (app)/
    │   │   ├── layout.tsx  # Layout com sidebar e proteção de rota
    │   │   ├── dashboard/  # Página inicial
    │   │   ├── habitos/    # Lista, criação, edição e detalhe
    │   │   ├── stacking/   # Correntes de hábitos
    │   │   ├── identidade/ # Identidades e nível XP
    │   │   ├── recompensas/# Recompensas por streak
    │   │   └── conquistas/ # Badges e progresso
    │   └── api/
    │       ├── auth/       # Handler NextAuth
    │       ├── habits/     # Endpoint de hábitos
    │       ├── logs/       # Endpoint de registros
    │       └── badges/     # Verificação de badges
    ├── components/
    │   ├── ui/             # Button, Input, Card, BookQuote, Skeleton
    │   ├── layout/         # Sidebar, AppBar
    │   ├── dashboard/      # IdentityHero, MetricCard, Heatmap
    │   ├── habits/         # HabitRow, HabitForm, EditHabitForm
    │   ├── stacking/       # StackChain, CreateStackForm
    │   ├── identidade/     # IdentityCard, CreateIdentityForm
    │   └── recompensas/    # RecompensasClient
    ├── lib/
    │   ├── prisma.ts       # Singleton do PrismaClient
    │   ├── auth.ts         # Configuração do NextAuth
    │   ├── streak.ts       # Cálculo de sequências
    │   ├── xp.ts           # Regras e cálculo de XP
    │   └── badges.ts       # Verificação e concessão de badges
    └── types/
        └── next-auth.d.ts  # Extensão de tipos da sessão
```

---

## Banco de dados

O projeto usa SQLite em desenvolvimento, armazenado em `prisma/dev.db`. Nenhuma instalação adicional é necessária — o arquivo é criado automaticamente ao rodar a migration.

**Modelos principais:**

- `User` — usuário com XP, nível e senha com hash bcrypt
- `Habit` — hábito com os campos das 4 leis
- `HabitLog` — registro diário de cada hábito
- `Identity` — identidade vinculada a um conjunto de hábitos
- `Stack` / `StackItem` — correntes de habit stacking
- `Badge` / `UserBadge` — sistema de conquistas
- `Reward` — recompensas pessoais por streak

Para visualizar e editar os dados pelo browser:

```bash
npm run db:studio
```

---

## Sistema de XP e níveis

| Ação | XP ganho |
|---|---|
| Marcar hábito como feito | +10 |
| Completar todos os hábitos do dia | +20 bônus |
| Bônus por semanas de streak | +5 por semana |
| Criar hábito com as 4 leis preenchidas | +15 |
| Completar corrente de stacking | +25 |
| Desbloquear uma conquista | +50 |

Os níveis progridem a cada 200 XP, com o limiar aumentando 50 XP a cada nível.

---

## Conquistas

| Badge | Critério |
|---|---|
| 🌱 Primeira semana | 7 dias consecutivos em qualquer hábito |
| 🔥 Hábito formado | 21 dias consecutivos |
| ⚡ Automatismo | 66 dias consecutivos |
| 🏆 Consistência | 100 dias consecutivos |
| 🌅 Madrugador | 30 dias com hábito matinal |
| 📖 Leitor | Hábito de leitura por 20 dias |
| 💪 Nunca dois seguidos | Retomou após falta 5 vezes |
| 🔗 Corrente completa | Stacking completo por 14 dias |
| 🎭 Multipotente | 4 identidades ativas ao mesmo tempo |

---

## Design

O visual foi construído com um design system próprio baseado em CSS variables. A paleta usa tons de navy escuro para áreas de destaque e caramelo para elementos de progresso, streak e XP, sobre um fundo off-white quente.

| Variável | Cor | Aplicação |
|---|---|---|
| `--navy-deep` | `#111E36` | Sidebar, cards de destaque |
| `--navy` | `#1B2B4B` | Botão primário, rings completos |
| `--caramel` | `#C4884A` | Streaks, XP, badges, destaques |
| `--caramel-pale` | `#F2E4D0` | Citações, recompensas disponíveis |
| `--offwhite` | `#FAF7F2` | Fundo principal |
| `--offwhite-2` | `#F0EBE1` | Cards e inputs |
| `--brown` | `#6B4226` | Texto em blocos de citação |

Fonte: **DM Sans** (Google Fonts), pesos 400 e 500.

---
## Licença

MIT
