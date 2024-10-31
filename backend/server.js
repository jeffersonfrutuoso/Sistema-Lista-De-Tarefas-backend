const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const taskRoutes = require('./routes/tarefa');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: 'https://sistema-lista-de-tarefas-frontend.vercel.app', 
  methods: 'GET,POST,PUT,DELETE',
};

app.use(cors(corsOptions));
app.use(express.json()); 

app.get('/SistemaDeTarefas', (req, res) => {
  res.status(200).send('OK');
});

app.use('/api/tarefas', taskRoutes);


sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em ${process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`}`);

  });
}).catch(err => console.error('Erro ao sincronizar com o banco de dados:', err));
