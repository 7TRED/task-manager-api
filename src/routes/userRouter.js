
const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../db/models');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendCancellationEmail } = require("../emails/account");


const userRoute = new express.Router();



userRoute.post("/users", async(req, res) => {
    const user = new User(req.body);
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.firstName);
        const token = await user.getAuthToken();
        res.status(201).send({ user: user.getPublicProfile(), token });
    } catch (e) {
        res.status(400).send(e);
    }
})

userRoute.post("/users/login", async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        if (!user) {
            return res.status(400).send();
        }

        const token = await user.getAuthToken();
        res.send({user:user.getPublicProfile(), token});

    } catch (e) {
        res.status(400).send({
            status: "failed"
        });
    }
})

userRoute.post("/users/logout",auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token !== req.token);
        await req.user.save();


        res.send({
            status: 'successfull'
        })
    } catch (e) {
        res.status(500).send({
            status: "failed"
        });
    }
})

userRoute.post("/users/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send({
            status: 'successfull'
        })
    } catch (e) {
        res.status(500).send({ status: "failed" });
    }
})

userRoute.get("/users/me",auth, async(req, res) => {
    res.send({user:req.user.getPublicProfile(), token:req.token});
})

userRoute.patch("/users/me",auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["firstName", "lastName", "email", "password"];
    const isValidOperation = updates.every((update) => (allowedUpdates.includes(update)))
    
    if (!isValidOperation) {
        return res.status(400).send();
    }
    try {
        
        updates.forEach((update) => {
            req.user[update] = req.body[update];
        })
        await req.user.save();
        res.send({user: req.user.getPublicProfile(), token:req.token});
    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).send(err);
        }
    
        res.status(500).send(err);

    }
})


userRoute.delete("/users/me",auth, async(req, res) => {

    try {
        await req.user.remove();
        sendCancellationEmail(req.user.email, req.user.firstName);
        res.send({user: req.user.getPublicProfile(), token:req.token});

    } catch (e) {
        res.status(500).send({status:"failed"});
    }
})


const upload = multer({
    limits: {
        fileSize: 5 * 1000000
    },
    fileFilter(req, file, cb) {

        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new Error("File type not supported"));
        }

        return cb(undefined, true);
    }
})


userRoute.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer =  await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer;
    await req.user.save();
    res.send({ token: req.token });

}, (error, req, res, next) => {
    res.status(400).send({error:error.message});
})

userRoute.delete('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = null;
    await req.user.save();
    res.send({ token: req.token });
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
});

userRoute.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }

        res.set('Content-Type', 'image/png');
        res.send(user.avatar);

    } catch (e) {
        res.status(404).send({error, token:req.token})
    }
})


module.exports = userRoute;