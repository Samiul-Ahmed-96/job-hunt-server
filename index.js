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
    const usersCollection = database.collection("users");
    const jobCollection = database.collection("job");

    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send({ status: true, data: users });
    });

    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.send({ status: true, data: result });
    });

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      if (result?.email) {
        return res.send({ status: true, data: result });
      }
      res.send({ status: false });
    });

    app.get("/jobs" ,  async (req , res ) =>{
      const cursor = jobCollection.find({});
      const result = await cursor.toArray();
      res.send({status:true , data : result})
    })

    app.get("/job/:id" , async(req,res) =>{
      const jobId = req.params.id;
      const result = await jobCollection.findOne({_id: ObjectId(jobId)});
      res.send({status:true , data:result})
    })

    app.post("/job" , async(req,res) =>{
      const job = req.body;
      const result =  await jobCollection.insertOne(job);
      res.send({status : true , data : result})
    })

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
