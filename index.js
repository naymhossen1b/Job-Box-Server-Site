const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//////// Middle Ware \\\\\\\\

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));
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


////// Middle Ware \\\\\\\
const logger = (req, res, next) => {
  // console.log("Log Info", req.method, req.url);
  next();
};

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  // console.log('token in the middleware', token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const tabCategoryCollection = client.db("JobBox").collection("tabsDB");
    const postedJobCollection = client.db("JobBox").collection("postJob");



    // User Posted Jobs

    app.delete('/api/v1/userPostJobs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const result = await postedJobCollection.deleteOne(query);
      res.send(result);
    })

    app.get('/api/v1/userPostJobs', async (req, res) => {
      const cursor = postedJobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })
    
    app.post('/api/v1/userPostJobs', async (req, res) => {
      const user = req.body;
      console.log('new user', user);
      const result = await postedJobCollection.insertOne(user);
      res.send(result);
    })

    /// Bids Detail Page
    app.get('/api/v1/tabs/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)};
      const details = await tabCategoryCollection.findOne(query);
      res.send(details);
    })

    // Tabs Data GetOne
    app.get("/api/v1/tabs", async (req, res) => {
      const cursor = tabCategoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


       /// Auth Related API
    //login jwt token
    app.post("/jwt", (req, res) => {
      const user = req.body;
      // console.log("user for tokens", user);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "none",
        })
        .send({ success: true });
    });

    //Logout jwt Token
    app.post("/logout", (req, res) => {
      const user = req.body;
      res.clearCookie("token", { maxAge: 0 }).send({ success: true });
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