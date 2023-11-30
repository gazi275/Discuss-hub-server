
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
    
    await client.connect();
    const postCollection=client.db("PostDB").collection("posts");

    app.post("/posts", async (req, res) => {
        const posts = req.body;
        console.log(posts);
        const result = await postCollection.insertOne(posts);
        
        res.send(result);
      });

      app.get("/post", async (req, res) => {
        const result = await postCollection.find().toArray();
        res.send(result);
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

     



    
    await client.db("admin").command({ ping: 1 });
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
  
  