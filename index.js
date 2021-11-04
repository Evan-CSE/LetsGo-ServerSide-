require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const { ObjectID } = require('bson');
const { object } = require('webidl-conversions');

const app = express();
const port = 5000;
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xgoot.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
console.log("Ok");

async function run() {
    try {
        await client.connect();
        const database = client.db('Test');
        const serviceTable = database.collection('TouristServiceList');
        const orderTable = database.collection('Orders');

        //send  6 service from database
        app.get('/limitservice', async (req, res) => {
            console.log("Hitting service")
            const cursor = serviceTable.find({});
            const result = await cursor.limit(6).toArray();
            console.log(result);
            res.send(result);
        })


        //send all services from database
        app.get('/service', async (req, res) => {
            // console.log("Hitting service")
            const page = req.query.page;
            const cursor = serviceTable.find({});
            let result;
            const count =await cursor.count();
            if (page) {
                 result = await cursor.skip(page * 6).limit(6).toArray();
            }
            else {

                 result = await cursor.toArray();
                
            }
            // console.log(result);
            res.send({
                count,
                result
            }
            );
        })


        //send specific service details 
        app.get('/service/:id',async (req,res)=>{
            const id = req.params.id;
            console.log(id);
            const  result =await serviceTable.findOne({ _id: ObjectId(id) });
            console.log(result);
            res.send(result);
        })

        //send agent from database
        app.get('/agent', async (req, res) => {
            console.log('Hitting url');
            const cursor = database.collection('Agents').find({});
            const result = await cursor.toArray();
            // console.log(result);
            res.send(result);
        })


        //send comments from database

        app.get('/comments', async (req, res) => {
            const cursor = database.collection('CommentAboutService').find({});
            const result = await cursor.toArray();
            console.log(result);
            res.send(result);
        })


        //send orders from database
        app.get('/orders',async (req,res)=>{
            const cursor = orderTable.find({});
            const result = await cursor.toArray();
            res.send(result);
        })


        //send orders by user id
        app.get('/order/:id',async (req,res)=>{
            const id = req.params.id;
            console.log(id);
            const cursor = orderTable.find({userId:req.params.id});
            const result = await cursor.toArray();
            res.send(result);
        })


        //Adding services to database
        app.post('/addservice', async (req, res) => {
            const doc = req.body;
            const result = await serviceTable.insertOne(doc);
            console.log(result);
            res.send(result);
        })

        //adding orders
        app.post('/order',async (req,res)=>{
            const doc = req.body;
            const result = await orderTable.insertOne(doc);
            console.log(result);
            res.send(result);
        })


        //update status
        app.put('/updateStatus/:id',async (req,res)=>{
            const id = req.params.id;
            const updateStatus = req.body;
            const filter = {tid:id};
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    PackageName: updateStatus.PackageName,
                    Cutomer: updateStatus.Cutomer,
                    address:updateStatus.address,
                    tid: updateStatus.tid,
                    userId: updateStatus.userId,
                    status:updateStatus.status,
                    orderedBy:updateStatus.orderedBy
                },
            };
            const result = await orderTable.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result)
        })

        //cancel order
        app.delete('/delete/:id',async (req,res)=>{
            const id = req.params.id;
            const query = {tid:id};
            console.log(query);
            const result = await orderTable.deleteOne(query);
            console.log(result);
            res.send(result);
        })

        console.log("Connected successfully to server");
    }
    finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}



run().catch(console.dir)



app.get('/', (req, res) => {
    console.log('running');
    res.send('Listening on port ');
})

app.listen(port, () => {
    console.log('running server');
});