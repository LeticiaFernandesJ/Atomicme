import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log("Seeding badges...");

  const badges = [
    { slug: "7-days",        name: "Primeira semana",     description: "7 dias consecutivos",            daysRequired: 7,    xpRequired: 0 },
    { slug: "21-days",       name: "Habito formado",      description: "21 dias consecutivos",           daysRequired: 21,   xpRequired: 0 },
    { slug: "66-days",       name: "Automatismo",         description: "66 dias consecutivos",           daysRequired: 66,   xpRequired: 0 },
    { slug: "100-days",      name: "Consistencia",        description: "100 dias consecutivos",          daysRequired: 100,  xpRequired: 0 },
    { slug: "early-bird",    name: "Madrugador",          description: "30 dias acordando antes das 7h", daysRequired: 30,   xpRequired: 0 },
    { slug: "reader",        name: "Leitor",              description: "Habito de leitura por 20 dias",  daysRequired: 20,   xpRequired: 0 },
    { slug: "no-miss-twice", name: "Nunca dois seguidos", description: "Retomou apos uma falta 5 vezes", daysRequired: null, xpRequired: 0 },
    { slug: "full-stack",    name: "Corrente completa",   description: "Stacking completo por 14 dias",  daysRequired: 14,   xpRequired: 0 },
    { slug: "multi-identity",name: "Multipotente",        description: "4 identidades ativas",           daysRequired: null, xpRequired: 0 },
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
