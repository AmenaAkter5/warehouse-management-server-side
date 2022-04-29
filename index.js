
// require express, cors
const express = require('express');
const cors = require('cors');


// declare app and port
const app = express();
const port = process.env.PORT || 5000;


// use middleware
app.use(cors());
app.use(express.json());


// Make API : check server root
app.get('/', (req, res) => {
    res.send('Warehouse server is running');
})


// listening port
app.listen(port, () => {
    console.log('port is listening', port);
})