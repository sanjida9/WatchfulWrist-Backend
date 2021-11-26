const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

const ObjectId = require("mongodb").ObjectId;

const { MongoClient } = require("mongodb");

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kryx3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("watchfulWrist2");
    const watchesCollection = database.collection("watches");
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");
    const userRolesCollection = database.collection("userRoles");

    app.get("/watches", async (req, res) => {
      const allWatches = await watchesCollection.find({}).toArray();
      res.send(allWatches);
    });
    app.get("/watch/:id", async (req, res) => {
      const watchID = req.params.id;
      const singleWatch = await watchesCollection
        .find({
          _id: ObjectId(watchID),
        })
        .toArray();

      res.send(singleWatch[0]);
    });

    app.post("/newWatch", async (req, res) => {
      const newWatchData = await req.body;
      await watchesCollection.insertOne(newWatchData);

      res.send(newWatchData);
    });

    app.post("/placeOrder", async (req, res) => {
      await orderCollection.insertOne(req.body);
      res.send();
    });

    app.get("/manageAllOrders", async (req, res) => {
      const allUserOrders = await orderCollection.find({}).toArray();

      res.send(allUserOrders);
    });

    app.post("/deleteOrder", async (req, res) => {
      const userID = await req.body.UserId;
      await orderCollection.deleteOne({ _id: ObjectId(userID) });

      res.json("Deleted!");
    });

    app.post("/singleUserOrders", async (req, res) => {
      const userEmail = await req.body.userEmail;
      const singleUserBooking = await orderCollection
        .find({ userEmail: userEmail })
        .toArray();

      res.json(singleUserBooking);
    });

    app.post("/submitReview", async (req, res) => {
      await reviewCollection.insertOne(req.body);
      res.send();
    });

    app.get("/getReviews", async (req, res) => {
      const reviews = await reviewCollection.find({}).toArray();
      res.send(reviews);
    });

    app.post("/makeAdmin", async (req, res) => {
      const email = req.body.email;

      const filter = { userEmail: email };
      const options = { upsert: true };
      const updateRoles = {
        $set: {
          isAdmin: true,
        },
      };
      await userRolesCollection.updateOne(filter, updateRoles, options);

      res.send();
    });

    app.get("/isAdmin", async (req, res) => {
      const userEmail = req.query.userEmail;
      const result = await userRolesCollection
        .find({ userEmail: userEmail })
        .toArray();

      res.send(result[0]);
    });

    app.get("/getProducts", async (req, res) => {
      const products = await watchesCollection.find({}).toArray();

      res.send(products);
    });

    app.post("/updateStatus", async (req, res) => {
      const status = await req.body.status;
      const id = await req.body.id;

      const filter = { _id: ObjectId(id) };
      await orderCollection.updateOne(filter, { $set: { status: status } });

      res.json("updated");
    });

    // Delete Products
    app.post("/deleteProducts", async (req, res) => {
      const deleteReqId = await req.body.deleteReqId;
      await watchesCollection.deleteOne({ _id: ObjectId(deleteReqId) });

      res.send();
    });
  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

console.log(uri);

app.get("/", (req, res) => {
  res.send("Hello Watch!");
});

app.listen(port, () => {
  console.log(`listening at ${port}`);
});
