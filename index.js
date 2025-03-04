const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// MiddleWear
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.beozs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


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

        const reviewCollection = client.db("reviewDB").collection("review");
        const WatchListCollection = client.db("reviewDB").collection("watchList");

        // added review showing to the clint side on all reviews part

        app.get("/addReview", async (req, res) => {
            const cursor = reviewCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get("/highest", async (req, res) => {
            const cursor = reviewCollection.find().limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        // reviews details data showing to the clint side details page

        app.get("/review/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await reviewCollection.findOne(query);
            res.send(result);
        })

        // showing data to the clint side on my Wishlist by clicking on add to Wishlist

        app.get("/gameWishList/:userEmail", async (req, res) => {
            const userEmail = req.params.userEmail;
            const query = { userEmail: userEmail }; // Filtering by userEmail
            const result = await WatchListCollection.find(query).toArray(); // Retrieve all matching reviews
            res.send(result);
        });

        // my reviews

        app.get("/myReviews/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email }; // Filtering by userEmail
            const result = await reviewCollection.find(query).toArray(); // Retrieve all matching reviews
            res.send(result);
        });

        // delete data from my review

        app.delete("/myReviews/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await reviewCollection.deleteOne(query)
            res.send(result);
        })

        // get data from review collection to server for updateReview section

        app.get('/updateReview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await reviewCollection.findOne(query)
            res.send(result);
        })

        // put updated data to the database

        app.put("/updateReview/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateReview = req.body;
            const review = {
                $set: {
                    photo: updateReview.photo,
                    gameTitle: updateReview.gameTitle,
                    description: updateReview.description,
                    rating: updateReview.rating,
                    published: updateReview.published,
                    genres: updateReview.genres
                }
            }

            const result = await reviewCollection.updateOne(filter, review, options)
            res.send(result);
        })


        // addedReviews data sending to the database

        app.post("/addReview", async (req, res) => {
            const addedReviews = req.body;
            console.log(addedReviews)
            const result = await reviewCollection.insertOne(addedReviews)
            res.send(result)
        })


        // WatchList data sending to the database

        app.post("/review/:id", async (req, res) => {
            const detailsCollections = req.body;
            console.log(detailsCollections);
            const result = await WatchListCollection.insertOne(detailsCollections);
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



app.get("/", (req, res) => {
    res.send("Chill Gamer Server is running")
})

app.listen(port, () => {
    console.log(`Chill Gamer Server is running in Port:${port}`)
})