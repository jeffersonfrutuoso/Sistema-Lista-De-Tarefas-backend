const express = require('express');
const Tarefa = require('../models/Tarefa');
const router = express.Router();
const { Op } = require('sequelize');


router.get('/', async (req, res) => {
  try {
    const tasks = await Tarefa.findAll({ order: [['order', 'ASC']] });
    res.json(tasks);
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error);
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
    console.error('Erro ao adicionar tarefa:', error);
    res.status(500).json({ error: 'Erro ao adicionar tarefa' });
  }
});

router.put('/reorder', async (req, res) => {
  const { reorderedTasks } = req.body;

  try {
    
    for (let index = 0; index < reorderedTasks.length; index++) {
      const task = reorderedTasks[index];
      const newOrder = index + 1;

      
      const existingTask = await Tarefa.findOne({ where: { order: newOrder } });
      if (existingTask) {
        
        let newOrderAdjusted = newOrder;
        while (await Tarefa.findOne({ where: { order: newOrderAdjusted } })) {
          newOrderAdjusted++; 
        }

        
        await Tarefa.update(
          { order: newOrderAdjusted },
          { where: { id: task.id } }
        );
      } else {
        
        await Tarefa.update(
          { order: newOrder },
          { where: { id: task.id } }
        );
      }
    }

    res.status(200).json({ message: 'Ordem atualizada com sucesso.' });
  } catch (error) {
    console.error('Erro ao reordenar tarefas:', error);
    res.status(500).json({ error: 'Erro ao reordenar tarefas.' });
  }
});



router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, cost, dueDate } = req.body;

  try {
    const existingTask = await Tarefa.findOne({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Tarefa não encontrada.' });
    }

    const existingTaskWithName = await Tarefa.findOne({
      where: { name, id: { [Op.ne]: id } }
    });
    if (existingTaskWithName) {
      return res.status(400).json({ error: 'Uma tarefa com esse nome já existe.' });
    }

    await Tarefa.update({ name, cost, dueDate }, { where: { id } });
    const updatedTask = await Tarefa.findOne({ where: { id } });
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
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
    console.error('Erro ao excluir tarefa:', error);
    res.status(500).json({ error: 'Erro ao excluir tarefa.' });
  }
});

module.exports = router;
