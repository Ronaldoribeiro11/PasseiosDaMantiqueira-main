const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log(`Iniciando o processo de seeding...`);

  const categorias = [
    { nome: 'Aventura', slug: 'aventura', icone: 'fa-hiking' },
    { nome: 'Cultural', slug: 'cultural', icone: 'fa-landmark' },
    { nome: 'Gastronomia', slug: 'gastronomia', icone: 'fa-utensils' },
    { nome: 'Natureza', slug: 'natureza', icone: 'fa-leaf' },
    { nome: 'Família', slug: 'familia', icone: 'fa-users' },
  ];

  for (const cat of categorias) {
    const categoria = await prisma.categoria.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    console.log(`Categoria '${categoria.nome}' criada/confirmada com ID: ${categoria.id}`);
  }

  console.log(`Seeding finalizado com sucesso.`);
}

main()
  .catch((e) => {
    console.error("Ocorreu um erro durante o seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });