import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("Seeding badges...");

  const badges = [
    // Streaks
    { slug: "7-days",          name: "Primeira semana",       description: "7 dias consecutivos",             daysRequired: 7,    xpRequired: 0 },
    { slug: "21-days",         name: "Habito formado",        description: "21 dias consecutivos",            daysRequired: 21,   xpRequired: 0 },
    { slug: "66-days",         name: "Automatismo",           description: "66 dias consecutivos",            daysRequired: 66,   xpRequired: 0 },
    { slug: "100-days",        name: "Consistencia",          description: "100 dias consecutivos",           daysRequired: 100,  xpRequired: 0 },
    { slug: "early-bird",      name: "Madrugador",            description: "30 dias acordando antes das 7h",  daysRequired: 30,   xpRequired: 0 },
    { slug: "reader",          name: "Leitor",                description: "Habito de leitura por 20 dias",   daysRequired: 20,   xpRequired: 0 },
    { slug: "no-miss-twice",   name: "Nunca dois seguidos",   description: "Retomou apos uma falta 5 vezes",  daysRequired: null, xpRequired: 0 },
    { slug: "full-stack",      name: "Corrente completa",     description: "Stacking completo por 14 dias",   daysRequired: 14,   xpRequired: 0 },
    { slug: "multi-identity",  name: "Multipotente",          description: "4 identidades ativas",            daysRequired: null, xpRequired: 0 },
    // Novos — Habitos
    { slug: "first-habit",     name: "Primeiro passo",        description: "Criou seu primeiro habito",       daysRequired: null, xpRequired: 0 },
    { slug: "3-habits",        name: "Trilogia",              description: "3 habitos ativos ao mesmo tempo", daysRequired: null, xpRequired: 0 },
    { slug: "5-habits",        name: "Maquina de habitos",    description: "5 habitos ativos ao mesmo tempo", daysRequired: null, xpRequired: 0 },
    { slug: "all-done",        name: "Dia perfeito",          description: "Completou todos habitos em um dia",daysRequired: null, xpRequired: 0 },
    { slug: "30-days",         name: "Um mes inteiro",        description: "30 dias consecutivos",            daysRequired: 30,   xpRequired: 0 },
    { slug: "3-days",          name: "Comecando",             description: "3 dias consecutivos",             daysRequired: 3,    xpRequired: 0 },
    // Novos — XP e nivel
    { slug: "level-5",         name: "Em ascensao",           description: "Alcancou o nivel 5",              daysRequired: null, xpRequired: 0 },
    { slug: "level-10",        name: "Dedicado",              description: "Alcancou o nivel 10",             daysRequired: null, xpRequired: 0 },
    { slug: "xp-500",          name: "Acumulador",            description: "500 XP acumulados",               daysRequired: null, xpRequired: 500 },
    { slug: "xp-1000",         name: "Mil pontos",            description: "1000 XP acumulados",              daysRequired: null, xpRequired: 1000 },
    // Novos — Emocoes
    { slug: "first-checkin",   name: "Autoconhecimento",      description: "Primeiro check-in emocional",     daysRequired: null, xpRequired: 0 },
    { slug: "7-checkins",      name: "Diario fiel",           description: "7 dias de check-in emocional",    daysRequired: 7,    xpRequired: 0 },
    { slug: "first-schema",    name: "Mapeado",               description: "Completou o quiz de esquemas",    daysRequired: null, xpRequired: 0 },
    { slug: "5-thoughts",      name: "Pensador critico",      description: "5 Thought Records completados",   daysRequired: null, xpRequired: 0 },
    { slug: "10-strategies",   name: "Mestre emocional",      description: "Explorou 10 estrategias",         daysRequired: null, xpRequired: 0 },
    { slug: "emotion-habit",   name: "Mente integrada",       description: "Vinculou emocao a 3 habitos",     daysRequired: null, xpRequired: 0 },
    // Novos — Stacking
    { slug: "first-stack",     name: "Encadeado",             description: "Criou sua primeira corrente",     daysRequired: null, xpRequired: 0 },
    { slug: "stack-5",         name: "Corrente longa",        description: "Corrente com 5+ habitos",         daysRequired: null, xpRequired: 0 },
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { slug: badge.slug },
      update: {},
      create: badge,
    });
  }

  console.log("Seeded " + badges.length + " badges.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
