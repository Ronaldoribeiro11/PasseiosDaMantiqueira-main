// ARQUIVO: backend/server.js

// 1. CARREGA AS VARIÁVEIS DE AMBIENTE DO ARQUIVO .env
require('dotenv').config();

// 2. IMPORTAÇÃO DAS BIBLIOTECAS
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const cors = require('cors');
const authMiddleware = require('./middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 3. INICIALIZAÇÃO
const app = express();
const prisma = new PrismaClient();
const port = 3000;

// Correção para o erro de serialização do BigInt
BigInt.prototype.toJSON = function() {
    return this.toString();
};

// 4. MIDDLEWARES GLOBAIS
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 5. CONFIGURAÇÃO DO MULTER (UPLOAD DE ARQUIVOS)
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// --- ROTAS DA API ---

app.get('/', (req, res) => {
    res.send('Servidor do Passeios da Serra está no ar!');
});

// Rota de Cadastro de Usuários (PÚBLICA)
app.post('/api/usuarios', async (req, res) => {
    try {
        const { nome_completo, email, senha } = req.body;
        
        if (!nome_completo || !email || !senha) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }
        if (senha.length < 8) {
            return res.status(400).json({ message: 'A senha deve ter no mínimo 8 caracteres.' });
        }

        const saltRounds = 10;
        const senha_hash = await bcrypt.hash(senha, saltRounds);
        const novoUsuario = await prisma.usuario.create({
            data: { nome_completo, email, senha_hash },
        });
        const { senha_hash: _, ...usuarioSemSenha } = novoUsuario;
        res.status(201).json(usuarioSemSenha);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(400).json({ message: 'O e-mail fornecido já está em uso.' });
        }
        console.error("Erro no cadastro:", error);
        res.status(500).json({ message: 'Não foi possível criar o usuário.' });
    }
});

// Rota de Login (PÚBLICA)
app.post('/api/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        const usuario = await prisma.usuario.findUnique({ where: { email } });
        if (!usuario) {
            return res.status(401).json({ message: "Email ou senha inválidos." });
        }
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ message: "Email ou senha inválidos." });
        }
        
        const token = jwt.sign(
            { userId: usuario.id.toString() },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({ message: "Login bem-sucedido!", token: token });
    } catch (error) {
        console.error('Erro na rota de login:', error); 
        res.status(500).json({ message: "Ocorreu um erro no servidor." });
    }
});

// Rota para um usuário se candidatar a ser guia
app.post('/api/candidatar-guia', authMiddleware, upload.fields([
  { name: 'docIdFront', maxCount: 1 },
  { name: 'docIdBack', maxCount: 1 },
  { name: 'docProofAddress', maxCount: 1 },
  { name: 'docSelfie', maxCount: 1 },
  { name: 'docCertificates', maxCount: 10 }
]), async (req, res) => {
    res.status(200).json({ message: "Candidatura recebida! (Rota em construção)"});
});

// Rota para um guia criar um novo passeio (PROTEGIDA E COM LOGS)
app.post('/api/passeios', authMiddleware, upload.fields([
    { name: 'mainImageFile', maxCount: 1 },
    { name: 'galleryImageFiles', maxCount: 5 },
]), async (req, res) => {
    try {
        const guia = await prisma.perfilDeGuia.findUnique({
            where: { usuario_id: req.usuario.id }
        });

        if (!guia) {
            return res.status(403).json({ message: 'Acesso negado. Perfil de guia não encontrado.' });
        }

        const {
            title, category, shortDesc, tags, longDesc, requirements,
            locationDetailed, mapsLink, locationInstructions, duration,
            difficulty, // Variável `difficulty` agora está aqui
            price, maxParticipants, cancelationPolicy,
            status, datesAvailability
        } = req.body;

        const includedItems = req.body.includedItems ? (Array.isArray(req.body.includedItems) ? req.body.includedItems : [req.body.includedItems]) : [];

        const categoriaPasseio = await prisma.categoria.findUnique({
            where: { slug: category }
        });
        if (!categoriaPasseio) {
            return res.status(400).json({ message: 'Categoria inválida.' });
        }

        let imagemPrincipalUrl = null;
        if (req.files && req.files.mainImageFile) {
            imagemPrincipalUrl = req.files.mainImageFile[0].path;
        }

        let galeriaImagensUrls = [];
        if (req.files && req.files.galleryImageFiles) {
            galeriaImagensUrls = req.files.galleryImageFiles.map(file => file.path);
        }
        
        const novoPasseio = await prisma.passeio.create({
            data: {
                guia_id: guia.id,
                categoria_id: categoriaPasseio.id,
                titulo: title,
                descricao_curta: shortDesc,
                descricao_longa: longDesc,
                preco: parseFloat(price),
                duracao_horas: parseFloat(duration),
                dificuldade: difficulty, // Agora a variável existe
                localizacao_geral: locationDetailed.split(',')[0],
                localizacao_detalhada: locationDetailed,
                link_Maps: mapsLink || null,
                politica_cancelamento: cancelationPolicy,
                status: status,
                itens_inclusos: includedItems,
                requisitos: requirements || null,
                imagem_principal_url: imagemPrincipalUrl,
                galeria_imagens_urls: galeriaImagensUrls,
            }
        });

        if (tags && tags.length > 0) {
            const tagsArray = tags.split(',');
            for (const tagName of tagsArray) {
                const slug = tagName.trim().toLowerCase().replace(/\s+/g, '-');
                const tag = await prisma.tag.upsert({
                    where: { slug: slug },
                    update: {},
                    create: { nome: tagName.trim(), slug: slug }
                });
                await prisma.passeioTag.create({
                    data: {
                        passeio_id: novoPasseio.id,
                        tag_id: tag.id
                    }
                });
            }
        }

        if (datesAvailability) {
            const dates = JSON.parse(datesAvailability);
            for (const item of dates) {
                await prisma.dataDisponivel.create({
                    data: {
                        passeio_id: novoPasseio.id,
                        data_hora_inicio: new Date(`${item.date}T${item.time}`),
                        vagas_maximas: parseInt(maxParticipants),
                        vagas_ocupadas: 0
                    }
                });
            }
        }

        console.log(`Passeio '${novoPasseio.titulo}' criado com sucesso pelo guia ID: ${guia.id}.`);
        res.status(201).json({ message: 'Passeio criado com sucesso!', passeio: novoPasseio });

    } catch (error) {
        console.error("Erro ao criar passeio:", error);
        if (req.files) {
            if (req.files.mainImageFile) fs.unlinkSync(req.files.mainImageFile[0].path);
            if (req.files.galleryImageFiles) req.files.galleryImageFiles.forEach(f => fs.unlinkSync(f.path));
        }
        res.status(500).json({ message: 'Erro interno ao criar o passeio.' });
    }
});

// Rota de Perfil (PROTEGIDA)
app.get('/api/perfil', authMiddleware, async (req, res) => {
    try {
        const { senha_hash: _, ...perfil } = req.usuario;
        res.status(200).json(perfil);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar perfil.' });
    }
});

// ROTA PARA BUSCAR TODOS OS PASSEIOS (PÚBLICA)
app.get('/api/passeios', async (req, res) => {
    try {
        const passeios = await prisma.passeio.findMany({
            where: {
                status: {
                    in: ['ativo', 'pendente_aprovacao']
                }
            },
            include: {
                categoria: { select: { nome: true, slug: true } },
                avaliacoes: { select: { nota: true } }
            }
        });

        const passeiosComAvaliacao = passeios.map(passeio => {
            const totalAvaliacoes = passeio.avaliacoes.length;
            const somaNotas = passeio.avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.nota, 0);
            const media = totalAvaliacoes > 0 ? (somaNotas / totalAvaliacoes) : 0;
            const { avaliacoes, ...restoDoPasseio } = passeio;
            return {
                ...restoDoPasseio,
                rating: parseFloat(media.toFixed(1)),
                reviews: totalAvaliacoes
            };
        });

        res.status(200).json(passeiosComAvaliacao);
    } catch (error) {
        console.error("Erro ao buscar passeios:", error);
        res.status(500).json({ message: 'Erro interno ao buscar os passeios.' });
    }
});

// ROTA PARA BUSCAR UM PASSEIO ESPECÍFICO POR ID (PÚBLICA)
app.get('/api/passeios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ message: 'ID de passeio inválido.' });
        }

        const passeio = await prisma.passeio.findUnique({
            where: { id: BigInt(id) },
            include: {
                categoria: { select: { nome: true, slug: true } },
                guia: { 
                    select: { 
                        id: true,
                        nome_publico: true,
                        bio_publica: true,
                        tagline: true,
                        usuario: {
                            select: {
                                avatar_url: true
                            }
                        }
                    } 
                },
                avaliacoes: {
                     select: {
                        nota: true,
                        titulo: true,
                        comentario: true,
                        data_avaliacao: true,
                        usuario: {
                            select: {
                                nome_completo: true,
                                avatar_url: true
                            }
                        }
                    },
                    orderBy: {
                        data_avaliacao: 'desc'
                    }
                },
                tags: { include: { tag: true } },
                datas_disponiveis: {
                    select: {
                        data_hora_inicio: true,
                        vagas_maximas: true,
                        vagas_ocupadas: true
                    },
                    orderBy: {
                        data_hora_inicio: 'asc'
                    }
                }
            }
        });

        if (!passeio) {
            return res.status(404).json({ message: 'Passeio não encontrado.' });
        }

        const totalAvaliacoes = passeio.avaliacoes.length;
        const somaNotas = passeio.avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.nota, 0);
        const media = totalAvaliacoes > 0 ? (somaNotas / totalAvaliacoes) : 0;

        const passeioFinal = {
            ...passeio,
            rating: parseFloat(media.toFixed(1)),
            reviews: totalAvaliacoes,
            tags: passeio.tags.map(t => t.tag.nome)
        };
        
        res.status(200).json(passeioFinal);
    } catch (error) {
        console.error(`Erro ao buscar passeio com ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Erro interno ao buscar o passeio.' });
    }
});

// ROTA PARA CRIAR UMA NOVA RESERVA (PROTEGIDA)
app.post('/api/reservas', authMiddleware, async (req, res) => {
    const { passeioId, dataDisponivelId, participantes, valorTotal, observacoesCliente } = req.body;
    const usuarioId = req.usuario.id;

    if (!passeioId || !dataDisponivelId || !participantes || !valorTotal) {
        return res.status(400).json({ message: 'Dados da reserva incompletos.' });
    }

    try {
        const resultado = await prisma.$transaction(async (tx) => {
            const dataDisponivel = await tx.dataDisponivel.findFirst({
                where: {
                    id: BigInt(dataDisponivelId),
                    passeio_id: BigInt(passeioId)
                },
            });
            if (!dataDisponivel) {
                throw new Error('Data ou horário não disponível para este passeio.');
            }
            const vagasDisponiveis = dataDisponivel.vagas_maximas - dataDisponivel.vagas_ocupadas;
            if (vagasDisponiveis < participantes) {
                throw new Error(`Não há vagas suficientes. Apenas ${vagasDisponiveis} disponíveis.`);
            }
            await tx.dataDisponivel.update({
                where: {
                    id: BigInt(dataDisponivelId),
                },
                data: {
                    vagas_ocupadas: {
                        increment: participantes
                    }
                }
            });
            const novaReserva = await tx.reserva.create({
                data: {
                    codigo_reserva: `PSR-${Date.now().toString().slice(-8)}`,
                    usuario_id: BigInt(usuarioId),
                    passeio_id: BigInt(passeioId),
                    data_disponivel_id: BigInt(dataDisponivelId),
                    valor_total: parseFloat(valorTotal),
                    status_reserva: 'confirmada',
                    observacoes_cliente: observacoesCliente || null,
                }
            });
            return novaReserva;
        });

        res.status(201).json({ message: 'Reserva criada com sucesso!', reserva: resultado });

    } catch (error) {
        console.error("Erro ao criar reserva:", error);
        res.status(400).json({ message: error.message || 'Não foi possível completar a reserva.' });
    }
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});