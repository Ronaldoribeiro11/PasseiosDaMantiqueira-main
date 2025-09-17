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
        
        // Validação básica
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
  try {
    const usuarioId = req.usuario.id;

    const { creatorFullname, creatorCpf, creatorBirthdate, creatorPhone, creatorCep, creatorStreet, creatorNumber, creatorComplement, creatorNeighborhood, creatorCity, creatorState, creatorExperience, creatorCadastur } = req.body;

    // Atualiza os dados pessoais do usuário (já existente)
    await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        nome_completo: creatorFullname,
        cpf: creatorCpf,
        telefone: creatorPhone,
        data_nascimento: creatorBirthdate ? new Date(creatorBirthdate) : null,
        endereco_cep: creatorCep,
        endereco_logradouro: creatorStreet,
        endereco_numero: creatorNumber,
        endereco_complemento: creatorComplement,
        endereco_bairro: creatorNeighborhood,
        endereco_cidade: creatorCity,
        endereco_estado: creatorState,
        tipo_de_usuario: 'guia',
      },
    });

    const perfilExistente = await prisma.perfilDeGuia.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (perfilExistente) {
      return res.status(409).json({ message: 'Você já se candidou para ser um guia.' });
    }

    const novoPerfil = await prisma.perfilDeGuia.create({
      data: {
        usuario_id: usuarioId,
        nome_publico: creatorFullname,
        tagline: "Anfitrião de Passeios na Serra",
        bio_publica: creatorExperience,
        numero_cadastur: creatorCadastur || null,
        status_verificacao: 'pendente',
      },
    });

    const documentos = [];
    const files = req.files;

    // Adiciona o caminho de cada arquivo à lista de documentos
    if (files.docIdFront) documentos.push({ tipo_documento: 'RG_FRENTE', url_arquivo: files.docIdFront[0].path });
    if (files.docIdBack) documentos.push({ tipo_documento: 'RG_VERSO', url_arquivo: files.docIdBack[0].path });
    if (files.docProofAddress) documentos.push({ tipo_documento: 'COMPROVANTE_RESIDENCIA', url_arquivo: files.docProofAddress[0].path });
    if (files.docSelfie) documentos.push({ tipo_documento: 'SELFIE_COM_DOC', url_arquivo: files.docSelfie[0].path });
    if (files.docCertificates) {
        files.docCertificates.forEach(file => {
            documentos.push({ tipo_documento: 'CERTIFICADO_CURSO', url_arquivo: file.path });
        });
    }

    // Cria os registros de Documento no banco
    if (documentos.length > 0) {
      await prisma.documento.createMany({
        data: documentos.map(doc => ({
          ...doc,
          perfil_de_guia_id: novoPerfil.id,
        })),
      });
    }

    res.status(201).json({ message: 'Candidatura enviada com sucesso!', perfil: novoPerfil });
  } catch (error) {
    console.error("Erro ao processar candidatura de guia:", error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// Rota para um guia criar um novo passeio (PROTEGIDA)
app.post('/api/passeios', authMiddleware, upload.fields([
    { name: 'mainImageFile', maxCount: 1 },
    { name: 'galleryImageFiles', maxCount: 5 },
]), async (req, res) => {
    try {
        const perfilGuia = await prisma.perfilDeGuia.findUnique({
            where: { usuario_id: req.usuario.id }
        });

        if (!perfilGuia) {
            return res.status(403).json({ message: 'Apenas guias podem criar passeios.' });
        }
        
        const guiaId = perfilGuia.id;

        const {
            title, category, shortDesc, longDesc, requirements,
            locationDetailed, mapsLink, locationInstructions,
            duration, difficulty, price, maxParticipants,
            cancelationPolicy, tags, includedItems, datesAvailability,
            status
        } = req.body;
        
        if (!title || !category || !shortDesc || !longDesc || !price || !duration || !difficulty || !maxParticipants || !cancelationPolicy) {
            return res.status(400).json({ message: 'Todos os campos obrigatórios precisam ser preenchidos.' });
        }

        const categoriaDoPasseio = await prisma.categoria.findUnique({ where: { slug: category } });
        if (!categoriaDoPasseio) {
            return res.status(400).json({ message: `Categoria '${category}' inválida.` });
        }

        const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(t => t) : [];
        const parsedIncludedItems = includedItems ? (Array.isArray(includedItems) ? includedItems : [includedItems]) : [];
        const parsedDatesAvailability = datesAvailability ? JSON.parse(datesAvailability) : [];

        const mainImageFile = req.files['mainImageFile'] ? req.files['mainImageFile'][0] : null;
        const galleryImageFiles = req.files['galleryImageFiles'] || [];

        const novoPasseio = await prisma.passeio.create({
            data: {
                guia_id: guiaId,
                titulo: title,
                categoria_id: categoriaDoPasseio.id,
                descricao_curta: shortDesc,
                descricao_longa: longDesc,
                preco: parseFloat(price),
                duracao_horas: parseFloat(duration),
                dificuldade: difficulty,
                localizacao_geral: req.usuario.endereco_cidade || 'Serra da Mantiqueira',
                localizacao_detalhada: locationDetailed,
                link_Maps: mapsLink || null,
                politica_cancelamento: cancelationPolicy,
                status: status || 'pendente_aprovacao',
                itens_inclusos: parsedIncludedItems,
                requisitos: requirements || null,
                imagem_principal_url: mainImageFile ? mainImageFile.path : null,
                galeria_imagens_urls: galleryImageFiles.map(file => file.path),
                tags: {
                    create: parsedTags.map(tagNome => ({
                        tag: {
                            connectOrCreate: {
                                where: { nome: tagNome },
                                create: { nome: tagNome, slug: tagNome.toLowerCase().replace(/\s+/g, '-') }
                            }
                        }
                    }))
                },
                datas_disponiveis: {
                    create: parsedDatesAvailability.map(date => ({
                        data_hora_inicio: new Date(`${date.date}T${date.time}:00`),
                        vagas_maximas: parseInt(maxParticipants)
                    }))
                }
            }
        });

        res.status(201).json({ message: 'Passeio criado com sucesso!', passeio: novoPasseio });
    } catch (error) {
        console.error('Erro ao criar passeio:', error);
        res.status(500).json({ message: 'Erro interno no servidor ao criar o passeio.' });
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

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});