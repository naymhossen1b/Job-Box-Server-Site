const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//////// Middle Ware \\\\\\\\

app.use(cors());
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_KEY}@firstpractice.poejscf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const tabCategoryCollection = client.db("JobBox").collection("tabsDB");
    const categoryCollection = client.db("JobBox").collection("categoryDB")

    /// 3 Tab Name Category;
    app.get('/api/allTabs', async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    /// Tabs Data GetOne
    app.get("/api/v1/tabs", async (req, res) => {
      const cursor = tabCategoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/api/v1/tabs/:category", async (req, res) => {
      const tabs = req.params.category;
      const result = await tabCategoryCollection.find({ category: tabs }).toArray();
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

app.get("/", (req, res) => {
  res.send("JobBox project Start!");
});

app.listen(port, () => {
  console.log(`JobBox  Server Is Start ${port}`);
});
