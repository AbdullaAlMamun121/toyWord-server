const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_NAME}:${process.env.DB_PASS}@cluster0.uetnypa.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
  
    const galleryCollection =  client.db("carToysDB").collection("ToyGallery");
    const toyCollection =  client.db("carToysDB").collection("addToy");

    app.get('/gallery', async(req,res)=>{
        console.log(req.query);
        const result = await galleryCollection.find({}).toArray();
        res.send(result);
    });

    app.get('/allToys', async(req,res)=>{
        const result = await toyCollection.find({}).toArray();
        res.send(result);
    })

    app.post('/createToy', async(req,res)=>{
        console.log(req.body)
        const addToy = req.body;
        const result = await toyCollection.insertOne(addToy);
        res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





app.get('/', (req, res) => {
    res.send('Toy Car is running!');
});
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})