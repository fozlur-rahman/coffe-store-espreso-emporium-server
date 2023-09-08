const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------------------------------------------------------------------------
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hslh8b3.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        const coffeesCollection = client.db('coffeeDB').collection('coffee');

        // create / write 
        app.post('/coffee', async (req, res) => {
            const coffee = req.body;
            const result = await coffeesCollection.insertOne(coffee);
            res.send(result);
            console.log(coffee)
        })
        //  read multiple 
        app.get('/coffees', async (req, res) => {
            const cousor = coffeesCollection.find();
            const result = await cousor.toArray();
            res.send(result);
        })

        // delete 
        app.delete('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeesCollection.deleteOne(query);
            res.send(result);
            console.log(result);
        })
        // read  single 
        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeesCollection.findOne(query);
            res.send(result);

        })


        // update 
        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const updatedCoffee = req.body;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };

            const updatedDoc = {
                $set: {
                    name: updatedCoffee.name,
                    chef: updatedCoffee.chef,
                    supplier: updatedCoffee.supplier,
                    taste: updatedCoffee.taste,
                    category: updatedCoffee.category,
                    details: updatedCoffee.details,
                    photo: updatedCoffee.photo
                }
            }
            const result = await coffeesCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('coffee making server is running');
})


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})