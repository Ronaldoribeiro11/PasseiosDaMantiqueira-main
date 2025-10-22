// backend/prisma/seed.js
const { PrismaClient, TipoUsuario, DificuldadePasseio, PoliticaCancelamento, StatusPasseio, StatusReserva, StatusAvaliacao } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log(`Iniciando o processo de seeding...`);

  // --- 1. Categorias ---
  const categoriasData = [
    { nome: 'Aventura', slug: 'aventura', icone: 'fa-hiking' },
    { nome: 'Cultural', slug: 'cultural', icone: 'fa-landmark' },
    { nome: 'Gastronomia', slug: 'gastronomia', icone: 'fa-utensils' },
    { nome: 'Natureza', slug: 'natureza', icone: 'fa-leaf' },
    { nome: 'Família', slug: 'familia', icone: 'fa-users' },
  ];
  const categorias = {};
  for (const cat of categoriasData) {
    const categoria = await prisma.categoria.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categorias[cat.slug] = categoria; // Guarda para referência
    console.log(`Categoria '${categoria.nome}' criada/confirmada com ID: ${categoria.id}`);
  }

  // --- 2. Tags ---
  const tagsData = [
    { nome: 'Trilha', slug: 'trilha' },
    { nome: 'Montanha', slug: 'montanha' },
    { nome: 'Vista Panorâmica', slug: 'vista-panoramica' },
    { nome: 'Pôr do Sol', slug: 'por-do-sol' },
    { nome: 'Culinária Local', slug: 'culinaria-local' },
    { nome: 'Degustação', slug: 'degustacao' },
    { nome: 'Histórico', slug: 'historico' },
    { nome: 'Trem', slug: 'trem' },
  ];
  const tags = {};
  for (const tagData of tagsData) {
    const tag = await prisma.tag.upsert({
      where: { slug: tagData.slug },
      update: {},
      create: tagData,
    });
    tags[tagData.slug] = tag;
    console.log(`Tag '${tag.nome}' criada/confirmada com ID: ${tag.id}`);
  }

  // --- 3. Usuários (Cliente e Guia) ---
  const saltRounds = 10;
  const senhaClienteHash = await bcrypt.hash('cliente123', saltRounds);
  const senhaGuiaHash = await bcrypt.hash('guia123', saltRounds);

  const clienteUsuario = await prisma.usuario.upsert({
    where: { email: 'cliente@exemplo.com' },
    update: {},
    create: {
      nome_completo: 'Cliente Exemplo Silva',
      email: 'cliente@exemplo.com',
      senha_hash: senhaClienteHash,
      tipo_de_usuario: TipoUsuario.cliente,
      telefone: '(12) 98888-7777',
      // avatar_url: 'uploads/avatar_cliente.jpg', // Se tiver uma imagem padrão
    },
  });
  console.log(`Usuário Cliente '${clienteUsuario.nome_completo}' criado/confirmado com ID: ${clienteUsuario.id}`);

  const guiaUsuario = await prisma.usuario.upsert({
    where: { email: 'yohan.guia@exemplo.com' },
    update: {},
    create: {
      nome_completo: 'Yohan Montanhista Exemplo',
      email: 'yohan.guia@exemplo.com',
      senha_hash: senhaGuiaHash,
      tipo_de_usuario: TipoUsuario.guia,
      telefone: '(12) 99999-8888',
      cpf: '111.222.333-44', // Exemplo
      data_nascimento: new Date('1990-05-15T00:00:00Z'),
      // avatar_url: 'uploads/avatar_yohan.jpg', // Se tiver uma imagem padrão
    },
  });
  console.log(`Usuário Guia '${guiaUsuario.nome_completo}' criado/confirmado com ID: ${guiaUsuario.id}`);

  // --- 4. Perfil de Guia ---
  const perfilGuia = await prisma.perfilDeGuia.upsert({
    where: { usuario_id: guiaUsuario.id },
    update: {
        // Pode adicionar campos para atualizar aqui se necessário
         status_verificacao: 'verificado', // Marcar como verificado para testes
    },
    create: {
      usuario_id: guiaUsuario.id,
      nome_publico: 'Yohan Montanhista',
      tagline: 'Especialista em Trilhas e Aventuras na Serra da Mantiqueira',
      bio_publica: 'Guia profissional credenciado desde 2015 e apaixonado pela Serra da Mantiqueira. Ofereço experiências autênticas e seguras, revelando os segredos e a beleza única desta região. Especializado em ecoturismo, trilhas de todos os níveis, e conhecimentos sobre flora, fauna e geologia local.',
      numero_cadastur: '12345678901234-5', // Exemplo
      status_verificacao: 'verificado', // Marcar como verificado para testes
    },
  });
  console.log(`Perfil de Guia para '${perfilGuia.nome_publico}' criado/confirmado com ID: ${perfilGuia.id}`);

  // --- 5. Passeios ---
  const passeioPedraBau = await prisma.passeio.upsert({
    where: { titulo: 'Trilha da Pedra do Baú com Pôr do Sol' }, // Usando título como chave única para upsert
    update: {}, // Não atualiza se já existe
    create: {
      guia_id: perfilGuia.id,
      categoria_id: categorias['aventura'].id,
      titulo: 'Trilha da Pedra do Baú com Pôr do Sol',
      descricao_curta: 'Aventura emocionante com escalaminhada e vista inesquecível do pôr do sol no Complexo do Baú.',
      descricao_longa: 'Uma das trilhas mais icônicas da Mantiqueira! Subiremos a Pedra do Baú por sua face sul, utilizando escadas metálicas (via ferrata) para alcançar o cume. A recompensa é uma vista 360º espetacular da região, especialmente durante o pôr do sol. Requer bom condicionamento físico e não ter medo de altura.',
      preco: 135.00,
      duracao_horas: 6.0,
      dificuldade: DificuldadePasseio.dificil,
      localizacao_geral: 'São Bento do Sapucaí, SP',
      localizacao_detalhada: 'Estacionamento do Bauzinho (encontro)',
      link_Maps: 'https://goo.gl/maps/exemploLinkBau',
      politica_cancelamento: PoliticaCancelamento.moderada,
      status: StatusPasseio.ativo,
      itens_inclusos: ['Equipamentos de segurança (capacete, cadeirinha)', 'Seguro Aventura', 'Guia Credenciado'],
      requisitos: 'Idade mínima 12 anos. Obrigatório uso de tênis apropriado. Levar água (mín. 1.5L), lanche, protetor solar e agasalho.',
      imagem_principal_url: 'uploads/pedra_bau_principal.jpeg', // Caminho relativo à pasta de uploads
      galeria_imagens_urls: [
        'uploads/pedra_bau_galeria1.jpeg',
        'uploads/pedra_bau_galeria2.jpeg',
        'uploads/pedra_bau_galeria3.jpeg',
      ],
      tags: {
        create: [
          { tag: { connect: { id: tags['trilha'].id } } },
          { tag: { connect: { id: tags['montanha'].id } } },
          { tag: { connect: { id: tags['vista-panoramica'].id } } },
          { tag: { connect: { id: tags['por-do-sol'].id } } },
        ],
      },
    },
  });
  console.log(`Passeio '${passeioPedraBau.titulo}' criado/confirmado com ID: ${passeioPedraBau.id}`);

  const passeioGastronomico = await prisma.passeio.upsert({
      where: { titulo: 'Tour Gastronômico Sabores da Serra' },
      update: {},
      create: {
          guia_id: perfilGuia.id,
          categoria_id: categorias['gastronomia'].id,
          titulo: 'Tour Gastronômico Sabores da Serra',
          descricao_curta: 'Descubra os sabores autênticos de Campos do Jordão em um roteiro delicioso por produtores locais e restaurantes.',
          descricao_longa: 'Um passeio para aguçar o paladar! Visitaremos uma fábrica de chocolates artesanais, uma pequena produção de queijos e embutidos locais, finalizando com um almoço especial em um restaurante que valoriza ingredientes da Mantiqueira. Inclui degustações e transporte.',
          preco: 190.00,
          duracao_horas: 4.5,
          dificuldade: DificuldadePasseio.facil,
          localizacao_geral: 'Campos do Jordão, SP',
          localizacao_detalhada: 'Praça do Capivari (encontro)',
          politica_cancelamento: PoliticaCancelamento.flexivel,
          status: StatusPasseio.ativo,
          itens_inclusos: ['Transporte entre os locais', 'Degustações', 'Almoço (bebidas à parte)', 'Guia'],
          requisitos: 'Informar restrições alimentares com antecedência.',
          imagem_principal_url: 'uploads/tour_gastronomico.jpeg',
          tags: {
              create: [
                  { tag: { connect: { id: tags['culinaria-local'].id } } },
                  { tag: { connect: { id: tags['degustacao'].id } } },
              ],
          },
      },
  });
  console.log(`Passeio '${passeioGastronomico.titulo}' criado/confirmado com ID: ${passeioGastronomico.id}`);

  const passeioTrem = await prisma.passeio.upsert({
      where: { titulo: 'Passeio de Trem Histórico na Montanha' },
      update: {},
      create: {
          guia_id: perfilGuia.id,
          categoria_id: categorias['cultural'].id,
          titulo: 'Passeio de Trem Histórico na Montanha',
          descricao_curta: 'Viagem nostálgica pela antiga ferrovia de Campos do Jordão, apreciando a história e as paisagens.',
          descricao_longa: 'Embarque em um charmoso trem de época para um passeio tranquilo pela Serra da Mantiqueira. O trajeto percorre belas paisagens, pontes e túneis, enquanto o guia conta histórias sobre a construção da ferrovia e a importância dela para a cidade. Ideal para famílias e amantes da fotografia.',
          preco: 95.00,
          duracao_horas: 2.0,
          dificuldade: DificuldadePasseio.facil,
          localizacao_geral: 'Campos do Jordão, SP',
          localizacao_detalhada: 'Estação Emílio Ribas (Capivari)',
          politica_cancelamento: PoliticaCancelamento.rigorosa,
          status: StatusPasseio.ativo,
          itens_inclusos: ['Bilhete do trem', 'Guia de Bordo'],
          imagem_principal_url: 'uploads/passeio_trem.jpeg',
          tags: {
              create: [
                  { tag: { connect: { id: tags['historico'].id } } },
                  { tag: { connect: { id: tags['trem'].id } } },
              ],
          },
      },
  });
  console.log(`Passeio '${passeioTrem.titulo}' criado/confirmado com ID: ${passeioTrem.id}`);


  // --- 6. Datas Disponíveis ---
  // Adiciona datas para o Passeio da Pedra do Baú
  const datasPedraBau = [
    { data: '2025-11-15', hora: '13:00', vagas: 8 },
    { data: '2025-11-22', hora: '13:00', vagas: 8 },
    { data: '2025-11-29', hora: '13:00', vagas: 10 },
  ];
  for (const d of datasPedraBau) {
    await prisma.dataDisponivel.upsert({
      where: {
        passeio_id_data_hora_inicio: { // Chave única composta
          passeio_id: passeioPedraBau.id,
          data_hora_inicio: new Date(`${d.data}T${d.hora}:00.000Z`),
        }
      },
      update: { vagas_maximas: d.vagas }, // Atualiza vagas se já existir
      create: {
        passeio_id: passeioPedraBau.id,
        data_hora_inicio: new Date(`${d.data}T${d.hora}:00.000Z`), // IMPORTANTE: Usar formato ISO ou objeto Date
        vagas_maximas: d.vagas,
      },
    });
    console.log(`Data ${d.data} ${d.hora} adicionada/confirmada para ${passeioPedraBau.titulo}`);
  }
  // Adiciona datas para o Passeio Gastronômico
  // ... (semelhante ao acima)

  // --- 7. Reservas (Opcional) ---
  // Pega a primeira data disponível da Pedra do Baú para criar uma reserva de exemplo
  const primeiraDataBau = await prisma.dataDisponivel.findFirst({
    where: { passeio_id: passeioPedraBau.id },
    orderBy: { data_hora_inicio: 'asc' },
  });

  if (primeiraDataBau) {
    const reservaExemplo = await prisma.reserva.create({
      data: {
        codigo_reserva: `PSR-SEED${Math.floor(Math.random() * 10000)}`,
        usuario_id: clienteUsuario.id,
        passeio_id: passeioPedraBau.id,
        data_disponivel_id: primeiraDataBau.id,
        valor_total: passeioPedraBau.preco * 2, // Exemplo para 2 participantes
        status_reserva: StatusReserva.confirmada, // Já confirmada para visualização
        participantes: {
          create: [ // Cria os participantes da reserva
            { usuario_id: clienteUsuario.id }, // O próprio cliente
            // { dependente_id: ID_DEPENDENTE }, // Se tivesse dependentes cadastrados
            // { nome_completo_externo: 'Acompanhante Teste' }, // Se permitisse adicionar nomes sem cadastro
          ]
        }
      },
    });
    // Atualiza vagas ocupadas (simulação simplificada, idealmente feito na criação da reserva via API)
    await prisma.dataDisponivel.update({
      where: { id: primeiraDataBau.id },
      data: { vagas_ocupadas: { increment: 2 } }
    });
    console.log(`Reserva de exemplo ${reservaExemplo.codigo_reserva} criada para ${clienteUsuario.nome_completo}`);

    // --- 8. Avaliações (Opcional) ---
    const avaliacaoExemplo = await prisma.avaliacao.create({
      data: {
        usuario_id: clienteUsuario.id,
        passeio_id: passeioPedraBau.id,
        reserva_id: reservaExemplo.id, // Vincula à reserva
        nota: 5,
        titulo: 'Incrível!',
        comentario: 'O passeio da Pedra do Baú com o Yohan foi espetacular. Super recomendo!',
        status: StatusAvaliacao.aprovada, // Já aprovada para visualização
      },
    });
    console.log(`Avaliação de exemplo criada pelo ${clienteUsuario.nome_completo}`);
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