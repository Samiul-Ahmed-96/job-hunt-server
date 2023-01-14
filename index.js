const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");

const port = process.env.PORT || 5000;

//Middleware
app.use(cors());
// app.use(express.json());
app.use(bodyParser.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iy3km.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    console.log("db connected");
    const database = client.db("job-hunt");
    const userCollection = database.collection("user");
    const jobCollection = database.collection("job");
    const chatCollection = database.collection("chat");

    app.get("/users", async (req, res) => {
      const cursor = userCollection.find({});
      const result = await cursor.toArray();
      res.send({ status: true, data: result });
    });
    app.get("/chats", async (req, res) => {
      const cursor = chatCollection.find({});
      const result = await cursor.toArray();
      res.send({ status: true, data: result });
    });

    app.post("/user", async (req, res) => {
      const user = req.body;

      const result = await userCollection.insertOne(user);

      res.send(result);
    });

    app.post("/chat", async (req, res) => {
      const chatData = req.body;
      const result = await chatCollection.insertOne(chatData);
      res.send({ status: true, data: result });
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;

      const result = await userCollection.findOne({ email });

      if (result?.email) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });

    app.patch("/apply", async (req, res) => {
      const userId = req.body.userId;
      const jobId = req.body.jobId;
      const email = req.body.email;

      const filter = { _id: ObjectId(jobId) };
      const updateDoc = {
        $push: { applicants: { id: ObjectId(userId), email } },
      };

      const result = await jobCollection.updateOne(filter, updateDoc);

      if (result.acknowledged) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });

    app.patch("/query", async (req, res) => {
      const userId = req.body.userId;
      const jobId = req.body.jobId;
      const email = req.body.email;
      const question = req.body.question;

      const filter = { _id: ObjectId(jobId) };
      const updateDoc = {
        $push: {
          queries: {
            id: ObjectId(userId),
            email,
            question: question,
            reply: [],
          },
        },
      };

      const result = await jobCollection.updateOne(filter, updateDoc);

      if (result?.acknowledged) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });

    app.patch("/reply", async (req, res) => {
      const userId = req.body.userId;
      const reply = req.body.reply;

      const filter = { "queries.id": ObjectId(userId) };

      const updateDoc = {
        $push: {
          "queries.$[user].reply": reply,
        },
      };
      const arrayFilter = {
        arrayFilters: [{ "user.id": ObjectId(userId) }],
      };

      const result = await jobCollection.updateOne(
        filter,
        updateDoc,
        arrayFilter
      );
      if (result.acknowledged) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });

    app.get("/applied-jobs/:email", async (req, res) => {
      const email = req.params.email;
      const query = { applicants: { $elemMatch: { email: email } } };
      const cursor = jobCollection.find(query).project({ applicants: 0 });
      const result = await cursor.toArray();

      res.send({ status: true, data: result });
    });

    app.get("/jobs", async (req, res) => {
      const cursor = jobCollection.find({});
      const result = await cursor.toArray();
      res.send({ status: true, data: result });
    });

    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const result = await jobCollection.findOne({ _id: ObjectId(id) });
      res.send({ status: true, data: result });
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const result = await userCollection.findOne({ _id: ObjectId(id) });
      res.send({ status: true, data: result });
    });

    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const result = await jobCollection.deleteOne({ _id: ObjectId(id) });
      res.send({ status: true, data: result });
    });

    app.post("/job", async (req, res) => {
      const job = req.body;
      const result = await jobCollection.insertOne(job);
      res.send({ status: true, data: result });
    });

    app.patch("/reply", async (req, res) => {
      const userId = req.body.userId;
      const reply = req.body.reply;

      const filter = { "queries.id": ObjectId(userId) };

      const updateDoc = {
        $push: {
          "queries.$[user].reply": reply,
        },
      };
      const arrayFilter = {
        arrayFilters: [{ "user.id": ObjectId(userId) }],
      };

      const result = await jobCollection.updateOne(
        filter,
        updateDoc,
        arrayFilter
      );
      if (result.acknowledged) {
        return res.send({ status: true, data: result });
      }

      res.send({ status: false });
    });
  } finally {
  }
};

run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Job-Hunt-Server-Running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
