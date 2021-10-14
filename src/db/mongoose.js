const mongoose = require('mongoose');
const {User} = require('./models');

const database = "task-api"

const connectionURL = process.env.DATABASE_URL;

async function main() {
    try {
        await mongoose.connect(connectionURL, { useNewUrlParser: true, useUnifiedTopology:true});

    } catch(error) {
        console.log(error);
    }
    
}

main();

