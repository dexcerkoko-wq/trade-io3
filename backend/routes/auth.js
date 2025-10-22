const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        // Verificar se usuário existe
        const existingUser = await User.findByEmailOrUsername(email, username);
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Usuário ou email já cadastrado' 
            });
        }

        // Criar usuário
        const user = await User.create({
            name,
            username,
            email,
            password
        });

        // Gerar token
        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET || 'tradeio_secret',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'Usuário criado com sucesso',
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Erro no registro:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Encontrar usuário
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        // Verificar senha
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciais inválidas' });
        }

        // Gerar token
        const token = jwt.sign(
            { userId: user.id }, 
            process.env.JWT_SECRET || 'tradeio_secret',
            { expiresIn: '24h' 
        });

        res.json({
            message: 'Login realizado com sucesso',
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Verificar token
router.get('/verify', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;