const express = require('express');
const app = express();
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    },
    useNewUrlParser:true,
    useUnifiedTopology:true,
    maxPoolSize:10,
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
         client.connect((err)=>{
            if(err){
                console.log(err);
                return;
            }
        });

        const galleryCollection = client.db("carToysDB").collection("ToyGallery");
        const toyCollection = client.db("carToysDB").collection("addToy");


        const indexKeys = { name: 1 };
        const indexOptions = { toy_name: "toy_name" };
        const result = await toyCollection.createIndex(indexKeys, indexOptions);
        console.log(result)

        app.get('/toySearchByName/:text', async (req, res) => {
            const searchText = req.params.text;
            const result = await toyCollection.find({
                "data.name": { $regex: searchText, $options: "i" }
            }).toArray();
            res.send(result);
        });


        app.get('/myToys/:email', async (req, res) => {
            const { sortBy, sortOrder } = req.query;
            const sortOptions = {};

            if (sortBy === "price") {
                sortOptions["data.price"] = sortOrder === 'desc' ? -1 : 1;
            }

            try {
                const result = await toyCollection
                    .find({ 'data.sellerEmail': req.params.email })
                    .toArray();

                // Convert price from string to number
                result.forEach(toy => {
                    toy.data.price = parseInt(toy.data.price);
                });

                // Sort the result based on numeric price
                if (sortBy === "price") {
                    result.sort((a, b) => {
                        return sortOrder === 'desc' ? b.data.price - a.data.price : a.data.price - b.data.price;
                    });
                }
                res.send(result);
            } catch (error) {
                console.error('Error retrieving toys:', error);
                res.status(500).send('Internal Server Error');
            }
        });



        app.get('/gallery', async (req, res) => {
            console.log(req.query);
            const result = await galleryCollection.find({}).toArray();
            res.send(result);
        });

        app.get('/allToys', async (req, res) => {
            const limit = parseInt(req.query.limit);
            const result = await toyCollection.find({}).limit(limit).toArray();
            res.send(result);
        });

        app.get('/ToyViewDetails/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toyCollection.findOne(query);
            res.send(result);
        })

        app.post('/createToy', async (req, res) => {
            console.log(req.body)
            const addToy = req.body;
            const result = await toyCollection.insertOne(addToy);
            res.send(result);
        });


        app.put('/updateMyToy/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const body = req.body;
            console.log(body)
            const filter = { _id: new ObjectId(id) };
            const updateMyToy = {
                $set: {
                    "data.price": body.price,
                    "data.quantity": body.quantity,
                    "data.description": body.description,
                }
            };
            const result = await toyCollection.updateOne(filter, updateMyToy);
            res.send(result);
        })

        app.delete('/myToys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await toyCollection.deleteOne(query);
            res.send(result);
        });


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