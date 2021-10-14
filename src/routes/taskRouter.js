const express = require('express');
const { Task } = require('../db/models');
const auth = require('../middleware/auth')


const taskRoute = new express.Router();

taskRoute.post("/tasks", auth,async(req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        });
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send({ status: "failed" });
    }
})

taskRoute.get("/tasks", auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = req.query.completed === "true"
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'asc' ? 1 : -1;
    }
    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        });
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send({ status: "failed" });
    }
})


taskRoute.get("/tasks/:id",auth, (req, res) => {
    const _id = req.params.id;
    Task.findByOne({_id, owner:req.user._id}).then(task => {
        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    }).catch((err) => {
        if (err.reason instanceof TypeError) {
            return res.status(404).send();
        }
        res.status(500).send();
    })
})


taskRoute.patch("/tasks/:id",auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send();
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id });

        if (!task) {
            return res.status(404).send();
        }
        updates.forEach((update) => {task[update] = req.body[update]})

        await task.save();
        res.send(task);
    } catch (err){
        if (err.name === "CastError") {
            return res.status(404).send();
        }
        if (err.name === "ValidationError") {
            return res.status(400).send();
        }

        res.status(500).send();

    }
})

taskRoute.delete("/tasks/:id",auth, async (req, res) => {
    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if (!task) {
            return res.status(404).send();
        }
        await task.remove();
        res.send(task);
    } catch (e) {
        if (e.name === "CastError") {
            return res.status(404).send();
        }

        res.status(500).send();
    }
})


module.exports = taskRoute;