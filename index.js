const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

const port = process.env.PORT || 5001;

// Enable CORS for a specific origin (replace 'http://localhost:5173' with your frontend origin)
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

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
    const userCollection = client.db("PostDB").collection("user");
    const postCollection = client.db("PostDB").collection("posts");
    const commentCollection = client.db("PostDB").collection("comment");
    const announcementsCollection = client.db("PostDB").collection("announcements");

    app.post("/posts", async (req, res) => {
      const { title, email, name, upvote, image, time, description, downvote, tag } = req.body;

      const newPost = {
        title,
        email,
        name,
        image,
        description,
        tag,
        upvote: upvote || 0,
        downvote: downvote || 0,
        time
      };
      const result = await postCollection.insertOne(newPost);

      res.send(result);
    });

    app.put('/posts', async (req, res) => {
      try {
        const upvote = req.query.upvote;
        const downvote = req.query.downvote;
        console.log(upvote, downvote);
        if (upvote) {
          const updatedPost = await postCollection.updateOne(
            { _id: new ObjectId(upvote) },
            { $inc: { upvote: 1 } }
          );

          res.json({ success: true, updatedPost });
        }
        else if (downvote) {
          const updatedPost = await postCollection.updateOne(
            { _id: new ObjectId(downvote) },
            { $inc: { downvote: 1 } }
          );

          res.json({ success: true, updatedPost });
        }
      } catch (error) {
        res.status(400).json({ error: error });
      }
    });

    app.get("/post", async (req, res) => {
      try {
        const querySearch = req.query.search;
        const regex = new RegExp(querySearch, 'i');
        console.log(querySearch);
        if (querySearch && querySearch.length > 0) {
          const result = await postCollection.find({ tag: regex }).sort({ time: 1 }).toArray();
          res.send(result);
        } else {
          const result = await postCollection.find().sort({ time: 1 }).toArray();
          res.send(result);
        }
      } catch (error) {
        res.status(400).json({ message: error });
      }
    });

    app.get("/postByUser", async (req, res) => {
      const { email } = req.query;
      const result = await postCollection.find({ email: email }).toArray();

      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const { name, email } = req.body;
      const isExist = await userCollection.findOne({ email: email });
      if (isExist) {
        res.send('emailExists');
      } else {
        const newUser = {
          name,
          email,
          isAdmin: false,
          isMembarShip: false
        };
        const result = await userCollection.insertOne(newUser);
        console.log(result);
        res.send(result);
      }
    });

    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      console.log("id", id, data);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedUSer = {
        $set: {
          isAdmin: data.isAdmin,
         
        },
      };
      const result = await userCollection.updateOne(
        filter,
        updatedUSer,
        options
      );
      res.send(result);
    });



    app.get("/users", async (req, res) => {
      const { email } = req.query;
      if (email) {
        const result = await userCollection.findOne({ email: email });
        console.log(result);
        res.send(result);
      } else {
        const result = await userCollection.find({}).toArray();
        console.log(result);
        res.send(result);
      }
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      console.log("delete", id);
      const query = {
        _id: new ObjectId(id),
      };
      const result = await userCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    app.post("/announcements", async (req, res) => {
      const announcements = req.body;
      const result = await announcementsCollection.insertOne(announcements);
      console.log(result);
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

    app.get("/announcement", async (req, res) => {
      const result = await announcementsCollection.find().toArray();
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
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    app.get("/comment", async (req, res) => {
      try {
        const result = await commentCollection.find().toArray();
        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

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
