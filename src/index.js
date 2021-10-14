const express = require('express');
const chalk = require('chalk');
require('./db/mongoose.js');
const userRoute = require('./routes/userRouter');
const taskRoute = require('./routes/taskRouter');
const crypto = require('crypto');



const app = express();
const PORT = process.env.PORT;


app.use(express.json())

app.use(userRoute);
app.use(taskRoute);


app.listen(PORT, () => {
    console.log(chalk.bold.blue("Server listening on port" + PORT));
})

