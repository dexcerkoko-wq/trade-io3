const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const { Post } = require('../models/Post');

const router = express.Router();

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error('Apenas imagens e vídeos são permitidos!'), false);
        }
    }
});

// Criar post
router.post('/', auth, upload.single('media'), async (req, res) => {
    try {
        const { content } = req.body;
        const media = req.file ? `/uploads/${req.file.filename}` : null;
        const mediaType = req.file ? (req.file.mimetype.startsWith('image/') ? 'photo' : 'video') : null;

        const post = await Post.create({
            content,
            media,
            mediaType,
            userId: req.userId
        });

        // Buscar post com dados do usuário
        const postWithUser = await Post.findByIdWithUser(post.id);

        res.status(201).json(postWithUser);
    } catch (error) {
        console.error('Erro ao criar post:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Buscar posts
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.findAllWithUsers();
        res.json(posts);
    } catch (error) {
        console.error('Erro ao buscar posts:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Curtir post
router.post('/:id/like', auth, async (req, res) => {
    try {
        const postId = req.params.id;
        await Post.toggleLike(postId, req.userId);
        res.json({ message: 'Like atualizado' });
    } catch (error) {
        console.error('Erro ao curtir post:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Comentar post
router.post('/:id/comment', auth, async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await Post.addComment(req.params.id, req.userId, content);
        res.status(201).json(comment);
    } catch (error) {
        console.error('Erro ao comentar:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;