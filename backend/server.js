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

// 3. CONFIGURAÇÃO DO MULTER (UPLOAD DE ARQUIVOS)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 4. INICIALIZAÇÃO
const app = express();
const prisma = new PrismaClient();
const port = 3000;

// Correção para o erro de serialização do BigInt
BigInt.prototype.toJSON = function() {
    return this.toString();
};

// 5. MIDDLEWARES GLOBAIS
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    // ... (seu código de candidatura aqui)
});

// Rota para um guia criar um novo passeio (PROTEGIDA E COM LOGS)
app.post('/api/passeios', authMiddleware, upload.fields([
    { name: 'mainImageFile', maxCount: 1 },
    { name: 'galleryImageFiles', maxCount: 5 },
]), async (req, res) => {
    // ... (seu código de criação de passeio aqui)
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

// =================================================================
// NOVA ROTA PARA BUSCAR TODOS OS PASSEIOS (PÚBLICA)
// =================================================================
app.get('/api/passeios', async (req, res) => {
    try {
        const passeios = await prisma.passeio.findMany({
            where: {
                status: 'ativo' // Apenas passeios aprovados e ativos
            },
            include: {
                categoria: { select: { nome: true, slug: true } },
                guia: { select: { nome_publico: true } },
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

// =================================================================
// NOVA ROTA PARA BUSCAR UM PASSEIO ESPECÍFICO POR ID (PÚBLICA)
// =================================================================
app.get('/api/passeios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const passeio = await prisma.passeio.findUnique({
            where: { id: BigInt(id) },
            include: {
                categoria: { select: { nome: true, slug: true } },
                guia: { 
                    select: { 
                        id: true,
                        nome_publico: true,
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
                 tags: { include: { tag: true } }
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

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});