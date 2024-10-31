const express = require('express');
const Tarefa = require('../models/Tarefa');
const router = express.Router();
const { Op } = require('sequelize');


router.get('/', async (req, res) => {
  try {
    const tasks = await Tarefa.findAll({ order: [['order', 'ASC']] });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar tarefas' });
  }
});


router.post('/', async (req, res) => {
  const { name, cost, dueDate } = req.body;
  try {
    const existingTask = await Tarefa.findOne({ where: { name } });
    if (existingTask) {
      return res.status(400).json({ error: 'Uma tarefa com esse nome já existe.' });
    }

    
    const lastTask = await Tarefa.findOne({ order: [['order', 'DESC']] });
    const newOrder = lastTask ? lastTask.order + 1 : 1;

    const newTask = await Tarefa.create({ name, cost, dueDate, order: newOrder });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao adicionar tarefa' });
  }
});

// Rota para atualizar uma tarefa existente
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, cost, dueDate } = req.body;

  try {
    const existingTask = await Tarefa.findOne({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const existingTaskWithName = await Tarefa.findOne({ where: { name, id: { [Op.ne]: id } } });
    if (existingTaskWithName) {
      return res.status(400).json({ error: 'Uma tarefa com esse nome já existe.' });
    }

    await Tarefa.update({ name, cost, dueDate }, { where: { id } });
    const updatedTask = await Tarefa.findOne({ where: { id } });
    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar tarefa.' });
  }
});


router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedCount = await Tarefa.destroy({ where: { id } });
    if (deletedCount === 0) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao excluir tarefa.' });
  }
});


router.put('/reorder', async (req, res) => {
  const { reorderedTasks } = req.body;

  if (!Array.isArray(reorderedTasks) || reorderedTasks.length === 0) {
    return res.status(400).json({ error: 'A lista de tarefas está vazia ou inválida.' });
  }

  try {
    // Atualizando a ordem de cada tarefa recebida
    const updatePromises = reorderedTasks.map((task, index) => {
      return Tarefa.update(
        { order: index + 1 }, 
        { where: { id: task.id } } 
      );
    });

    await Promise.all(updatePromises); // Espera todas as atualizações
    res.status(200).json({ message: 'Ordem atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao reordenar tarefas:', error); 
    res.status(500).json({ error: 'Erro ao reordenar tarefas.' });
  }
});




module.exports = router;
