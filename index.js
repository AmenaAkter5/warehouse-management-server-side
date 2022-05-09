
// require express, cors, mongodb, jwt and dotenv to secure database pass
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const jwt = require('jsonwebtoken');



// declare app and port
const app = express();
const port = process.env.PORT || 5000;



// use middleware
app.use(cors());
app.use(express.json());



// verify jwt

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}



// connect with mongo database

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pcp7m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



// set connection function

async function run() {
    try {
        await client.connect();

        // fruits collection
        const fruitsCollection = client.db("warehouse").collection("fruits");



        // Authentication : JWT issue

        app.post('/login', (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })




        // fruits collection API 

        // Make API : get all fruit data from server
        app.get('/fruits', async (req, res) => {
            const query = {};
            const cursor = fruitsCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        })



        // get data : get a specific fruit item data
        app.get('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const fruit = await fruitsCollection.findOne(query);
            res.send(fruit);
        })



        // POST item : add a new fruit item
        app.post('/fruits', async (req, res) => {
            const newItem = req.body;
            const result = await fruitsCollection.insertOne(newItem);
            res.send(result);
        })



        // update data : update a fruit item's quantity
        app.put('/fruits/:id', async (req, res) => {

            const id = req.params.id;
            const updatedItem = req.body;

            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updatedDoc = {
                $set: {
                    quantity: updatedItem.quantity,
                }
            };
            const result = await fruitsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })



        // delete data : delete a specific fruit item
        app.delete('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitsCollection.deleteOne(query);
            res.send(result);
        })



        // get My Items API

        // Make API : get specific fruit items for unique user from server
        app.get('/items', verifyJWT, async (req, res) => {

            const decodedEmail = req.decoded.email;
            const email = req.query.email;

            if (email === decodedEmail) {
                const query = { email };
                const cursor = fruitsCollection.find(query);
                const myItems = await cursor.toArray();
                res.send(myItems);
            }
            else {
                res.status(403).send({ message: 'Forbidden access' });
            }
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