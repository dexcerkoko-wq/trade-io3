const express = require('express');
const auth = require('../middleware/auth');
const { User } = require('../models/User');

const router = express.Router();

// Buscar perfil do usuário
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        // Remover senha da resposta
        const { password, ...userData } = user;
        res.json(userData);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Estatísticas do usuário
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = await User.getStats(req.userId);
        res.json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Atualizar perfil
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, bio, avatar } = req.body;
        await User.updateProfile(req.userId, { name, bio, avatar });
        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

module.exports = router;