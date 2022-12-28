const express = require("express");
const app = express();
const bodyParser = require('body-parser');
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