
// require express, cors, mongodb and dotenv to secure database pass
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();


// declare app and port
const app = express();
const port = process.env.PORT || 5000;


// use middleware
app.use(cors());
app.use(express.json());


// heroku link:
// https://pure-cliffs-64798.herokuapp.com/


// connect with mongo database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pcp7m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// set connection function

async function run() {
    try {
        await client.connect();

        // fruits collection
        const fruitsCollection = client.db("warehouse").collection("fruits");


        // Make API : get data from server [get all fruit data]
        // link: http://localhost:5000/fruits

        app.get('/fruits', async (req, res) => {
            const query = {};
            const cursor = fruitsCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        })


        // get data : get a specific fruit item data
        // link: http://localhost:5000/fruits/${id}

        app.get('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const fruit = await fruitsCollection.findOne(query);
            res.send(fruit);
        })


        // delete data : delete a specific fruit
        // link: http://localhost:5000/fruits/${id}

        app.delete('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitsCollection.deleteOne(query);
            res.send(result);
        })
    }
    finally {
        // client.close();
    }
}


run().catch(console.dir);



// Make API : check server root
app.get('/', (req, res) => {
    res.send('Warehouse server is running');
})


// listening port
app.listen(port, () => {
    console.log('listening port', port);
})