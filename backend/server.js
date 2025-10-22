const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/users', require('./routes/users'));

// Rota de saúde
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Trade.io API está funcionando!' });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({ message: 'Trade.io API Root' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log('✅ Servidor Trade.io rodando na porta ' + PORT);
});

module.exports = app;