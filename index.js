
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
    console.log('inside verify jwt', authHeader);
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}


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

        // create my items collection in database
        const myItemsCollection = client.db('warehouse').collection('myItems');



        // Authentication : JWT issue
        // link: http://localhost:5000/login

        app.post('/login', (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })



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


        // POST item : add a new item

        // get data from client side
        // post data to server
        // link: http://localhost:5000/fruits

        app.post('/fruits', async (req, res) => {
            const newItem = req.body;
            const result = await fruitsCollection.insertOne(newItem);
            res.send(result);
        })


        // update data : update a user
        // link: http://localhost:5000/fruits/${id}

        app.put('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedItem.quantity
                }
            };
            const result = await fruitsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })


        // delete data : delete a specific fruit item
        // link: http://localhost:5000/fruits/${id}

        app.delete('/fruits/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitsCollection.deleteOne(query);
            res.send(result);
        })



        // My Items collection API

        // Make API : get data from server [get all items]
        // link: http://localhost:5000/items

        app.get('/items', verifyJWT, async (req, res) => {
            // const authHeader = req.headers.authorization;
            // console.log(authHeader);
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            // console.log(email);
            /* 
            const query = { email };
            // const query = { email: email };
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders); 
            */
            if (email === decodedEmail) {
                const query = { email };
                // const query = { email: email };
                const cursor = myItemsCollection.find(query);
                const myItems = await cursor.toArray();
                res.send(myItems);
            }
            else {
                res.status(403).send({ message: 'Forbidden access' });
            }
        })


        /* app.get('/items', async (req, res) => {
            const email = req.query.email;
            const query = { email };
            const cursor = myItemsCollection.find(query);
            const myItems = await cursor.toArray();
            res.send(myItems);
        }) */


        // POST items : add myItemscollection

        // get data from client side
        // post data to server
        // link: http://localhost:5000/items

        app.post('/items', async (req, res) => {
            const myItem = req.body;
            const result = await myItemsCollection.insertOne(myItem);
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