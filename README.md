# AtomicMe

AtomicMe é um aplicativo web de rastreamento de hábitos e inteligência emocional. A base vem do livro *Hábitos Atômicos* de James Clear — a ideia de que identidade e comportamento se constroem juntos, hábito por hábito. A expansão emocional é inspirada em *Não Acredite em Tudo Que Você Sente* de Robert L. Leahy, integrando técnicas de Terapia Cognitivo-Comportamental ao dia a dia.

A premissa central: hábitos falham por causa de emoções não gerenciadas. O app cuida do que você **faz** e do que você **sente**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=flat-square)
![PWA](https://img.shields.io/badge/PWA-ready-purple?style=flat-square)

---

## Sobre o projeto

### Hábitos Atômicos
- **Identidade como núcleo** — cada hábito é um voto para o tipo de pessoa que você quer ser
- **As 4 leis do comportamento** — formulário guiado: torne óbvio, atrativo, fácil e satisfatório
- **Habit Stacking** — encadeie hábitos na fórmula *"Depois de X, farei Y"*
- **Regra dos 2 minutos** — campo obrigatório de versão mínima do hábito
- **Nunca perca dois dias seguidos** — alerta visual de recuperação
- **Sistema de XP, níveis e conquistas** — gamificação por consistência

### Mente & Emoções
- **Termômetro emocional** — check-in diário de humor com gráfico de 7 dias
- **Diário emocional** — registro de situações, sentimentos e pensamentos automáticos
- **Quiz de esquemas emocionais** — 28 afirmações avaliando 14 dimensões com histórico
- **Desafio de pensamento** — reestruturação cognitiva em 5 etapas com comparação de intensidade
- **Biblioteca de estratégias** — 15 técnicas de TCC com busca e filtros por emoção

---

## Funcionalidades

### Dashboard
Saudação dinâmica, card de identidade com barra de XP, três métricas do dia, heatmap dos últimos 21 dias e lista de hábitos com checkbox interativo. Alerta automático quando o usuário perde um dia para incentivar a retomada.

### Hábitos
Formulário em duas etapas baseado nas 4 leis. Primeira etapa: gatilho, motivação, versão mínima e recompensa imediata. Segunda etapa: nome do hábito e vínculo com uma identidade. Cada hábito tem página de detalhe com calendário de 30 dias, estatísticas de streak e taxa de conclusão.

### Habit Stacking
Correntes visuais de hábitos encadeados. Reordenação com setas, adição e remoção de nós, conclusão de toda a corrente com bônus de XP e barra de consistência dos últimos 14 dias.

### Identidade
Frases editáveis inline no formato *"Sou uma pessoa que..."*. Cada identidade acumula XP próprio. A página exibe barra de nível segmentada e tabela de regras de XP.

### Conquistas
27 badges organizadas em 6 categorias: Consistência, Hábitos, Stacking, Identidade, XP & Nível e Mente. Cada badge tem barra de progresso colorida por categoria. Badges conquistadas agrupadas por categoria com cores distintas.

### Recompensas
Recompensas pessoais vinculadas a metas de streak. Disponíveis ficam destacadas. Bloqueadas mostram progresso atual com barra fina.

### Mente & Emoções
Seção separada com destaque visual em roxo. Termômetro emocional com 6 emoções e intensidade 1–10. Diário com filtro por emoção e insight automático do Leahy ao salvar. Quiz com histórico de resultados e comparação entre aplicações. Desafio de pensamento com registro de redução de intensidade emocional. Biblioteca com 15 estratégias com passo a passo expansível.

---

## Stack

| Tecnologia | Uso |
|---|---|
| Next.js 14 | App Router, Server Components, Server Actions |
| TypeScript | Tipagem estrita em todo o projeto |
| Prisma ORM | Acesso ao banco PostgreSQL via Supabase |
| NextAuth.js | Autenticação com e-mail/senha, reset por código e Google OAuth |
| bcrypt | Hash de senhas |
| nodemailer | Envio de e-mail para reset de senha |
| Tailwind CSS | Estilização com design system em CSS variables |
| Zod | Validação de formulários e Server Actions |
| @ducanh2912/next-pwa | Service worker e suporte a instalação como PWA |

---

## Pré-requisitos

- Node.js 18 ou superior
- npm 9 ou superior
- Conta no [Supabase](https://supabase.com) para o banco de dados

---

## Instalação e execução local

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

Crie um arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://postgres:[senha]@db.[projeto].supabase.co:5432/postgres"
NEXTAUTH_SECRET="uma-string-longa-e-aleatoria-aqui"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

Para gerar um `NEXTAUTH_SECRET` seguro:
```bash
openssl rand -base64 32
```

O Google OAuth é opcional. O login com e-mail e senha funciona sem ele.

**4. Crie as tabelas no banco**

```bash
npx prisma migrate dev --name init
```

**5. Popule os badges**

```bash
npm run db:seed
```

**6. Inicie o servidor**

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (inclui prisma generate) |
| `npm run start` | Iniciar em modo produção |
| `npm run db:migrate` | Rodar migrations pendentes |
| `npm run db:seed` | Popular badges no banco |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:reset` | Resetar banco + re-seed |

---

## Estrutura de arquivos

```
atomicme/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/
    │   │   └── reset-senha/
    │   ├── (app)/
    │   │   ├── layout.tsx
    │   │   ├── dashboard/
    │   │   ├── habitos/
    │   │   ├── stacking/
    │   │   ├── identidade/
    │   │   ├── recompensas/
    │   │   ├── conquistas/
    │   │   └── emocoes/
    │   │       ├── diario/
    │   │       ├── quiz/
    │   │       ├── thought/
    │   │       └── estrategias/
    │   └── api/
    │       ├── auth/
    │       ├── habits/
    │       ├── logs/
    │       └── badges/
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   ├── dashboard/
    │   ├── habits/
    │   ├── stacking/
    │   ├── identidade/
    │   ├── recompensas/
    │   └── emocoes/
    └── lib/
        ├── prisma.ts
        ├── auth.ts
        ├── email.ts
        ├── streak.ts
        ├── xp.ts
        ├── badges.ts
        └── emotions.ts
```

---

## Banco de dados

O projeto usa PostgreSQL via Supabase em produção. Em desenvolvimento pode usar a mesma string de conexão do Supabase ou um banco local.

**Modelos principais:**

- `User` — usuário com XP, nível e senha com hash bcrypt
- `Habit` — hábito com os campos das 4 leis
- `HabitLog` — registro diário de cada hábito
- `Identity` — identidade vinculada a hábitos
- `Stack` / `StackItem` — correntes de habit stacking
- `Badge` / `UserBadge` — sistema de conquistas
- `Reward` — recompensas pessoais por streak
- `PasswordReset` — tokens de redefinição de senha
- `EmotionalLog` — registros do diário emocional
- `EmotionalSchema` — resultados do quiz de esquemas
- `ThoughtRecord` — registros de reestruturação cognitiva
- `HabitEmotionLink` — vínculo entre hábito e emoção

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
| Check-in emocional diário | +10 |
| Completar quiz de esquemas (1ª vez) | +50 |
| Completar Thought Record | +25 |

Os níveis progridem a cada 200 XP, com o limiar aumentando 50 XP por nível.

---

## Conquistas — 27 badges

**Consistência**
| Badge | Critério |
|---|---|
| ✨ Começando | 3 dias consecutivos |
| 🌱 Primeira semana | 7 dias consecutivos |
| 🔥 Hábito formado | 21 dias consecutivos |
| 📅 Um mês inteiro | 30 dias consecutivos |
| ⚡ Automatismo | 66 dias consecutivos |
| 🏆 Consistência | 100 dias consecutivos |
| 🌅 Madrugador | 30 dias com hábito matinal |
| 📖 Leitor | Hábito de leitura por 20 dias |
| 💪 Nunca dois seguidos | Retomou após falta 5 vezes |

**Hábitos**
| Badge | Critério |
|---|---|
| 🌟 Primeiro passo | Criou o primeiro hábito |
| 🎯 Trilogia | 3 hábitos ativos ao mesmo tempo |
| ⚙️ Máquina de hábitos | 5 hábitos ativos ao mesmo tempo |
| ✅ Dia perfeito | Completou todos os hábitos em um dia |
| 🎭 Multipotente | 4 identidades ativas |

**Stacking**
| Badge | Critério |
|---|---|
| 🔗 Encadeado | Criou a primeira corrente |
| ⛓️ Corrente longa | Corrente com 5 ou mais hábitos |
| 🔗 Corrente completa | Stacking completo por 14 dias |

**XP & Nível**
| Badge | Critério |
|---|---|
| 🚀 Em ascensão | Alcançou o nível 5 |
| 💎 Dedicado | Alcançou o nível 10 |
| 🪙 Acumulador | 500 XP acumulados |
| 👑 Mil pontos | 1000 XP acumulados |

**Mente & Emoções**
| Badge | Critério |
|---|---|
| 🧠 Autoconhecimento | Primeiro check-in emocional |
| 📓 Diário fiel | 7 dias de check-in emocional |
| 🧭 Mapeado | Completou o quiz de esquemas |
| 💭 Pensador crítico | 5 Thought Records completados |
| 🧰 Mestre emocional | Explorou 10 estratégias |
| 🤝 Mente integrada | Vinculou emoção a 3 hábitos |

---

## PWA

O AtomicMe pode ser instalado diretamente pelo navegador como um app nativo.

**Android (Chrome):** acesse o site → menu ⋮ → Adicionar à tela inicial

**iOS (Safari):** acesse o site → botão compartilhar → Adicionar à Tela de Início

O service worker é gerado automaticamente durante o build de produção via `@ducanh2912/next-pwa`. Em desenvolvimento o PWA fica desativado.

---

## Reset de senha

O fluxo de redefinição usa código de 6 dígitos enviado por e-mail. O código expira em 15 minutos. Contas criadas via Google não têm senha local e usam o fluxo OAuth para autenticação.

---

## Design

Design system próprio com CSS variables. Paleta em tons de navy escuro, caramelo para elementos de progresso e streak, e roxo/lilás para a seção de emoções.

| Variável | Cor | Aplicação |
|---|---|---|
| `--navy-deep` | `#111E36` | Sidebar, cards de destaque |
| `--navy` | `#1B2B4B` | Botão primário, rings completos |
| `--caramel` | `#C4884A` | Streaks, XP, badges |
| `--caramel-pale` | `#F2E4D0` | Citações, recompensas |
| `--offwhite` | `#FAF7F2` | Fundo principal |
| `--offwhite-2` | `#F0EBE1` | Cards e inputs |
| `--brown` | `#6B4226` | Texto em citações |
| `#7c3aed` | roxo | Seção Mente & Emoções |

Fonte: **DM Sans** (Google Fonts), pesos 400 e 500.

**Layout responsivo:**
- Desktop: sidebar fixa lateral com duas seções (Hábitos e Mente & Emoções)
- Mobile: header fixo com menu hambúrguer deslizante

---

## Deploy

O projeto está configurado para deploy no Vercel com banco PostgreSQL no Supabase. As variáveis de ambiente necessárias no painel do Vercel são `DATABASE_URL`, `NEXTAUTH_SECRET` e `NEXTAUTH_URL`. O comando de build já inclui `prisma generate` automaticamente.

---

## Licença

MIT
