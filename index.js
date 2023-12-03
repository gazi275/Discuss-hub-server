
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

const port = process.env.PORT || 5001;
app.use(cors());
app.use(express.json());

// qFYo2oloajCP9fNG
// discuss-hubs



const uri = "mongodb+srv://discuss-hubs:qFYo2oloajCP9fNG@cluster0.yv7cgkn.mongodb.net/?retryWrites=true&w=majority";

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


    const postCollection = client.db("PostDB").collection("posts");
    const commentCollection = client.db("PostDB").collection("comment");

    app.post("/posts", async (req, res) => {
      const posts = req.body;
      console.log(posts);
      const result = await postCollection.insertOne(posts);

      res.send(result);
    });

    app.get("/post", async (req, res) => {
      try {
        const querySearch = req.query.search
        const regex = new RegExp(querySearch, 'i');
        console.log(querySearch);
        if (querySearch && querySearch.length>0) {
          const result = await postCollection.find({ tag: regex }).sort({time:1}).toArray()
          res.send(result)
        } else {
          const result = await postCollection.find().sort({time:1}).toArray();
          res.send(result);
        }

      } catch (error) {
        res.status(400).json({ message: error })
      }
    });




    app.delete("/posted/:id", async (req, res) => {
      const id = req.params.id;
      console.log("delete", id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await postCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await postCollection.findOne(query);
      console.log(result);
      res.send(result);
    });

    app.post("/comments", async (req, res) => {
      try {
        const comments = req.body;
        console.log(comments);
        const result = await commentCollection.insertOne(comments);

        res.send(result);
      } catch (error) {
        console.log(error);
      }
    });

    app.get("/comment", async (req, res) => {
      const result = await commentCollection.find().toArray();
      res.send(result);
    });



    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

    // await client.close();
  }
}
run().catch(console.dir);




app.get("/", (req, res) => {
  res.send("Crud is running...");
});


app.listen(port, () => {
  console.log(`Simple Crud is Running on port ${port}`);
});

