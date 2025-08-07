const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const Person = require("./mongo");
const path = require("path");

require("dotenv").config();

app.use(express.json());
app.use(express.static("dist"));
app.use(cors());

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://zainali:<dbPassword>@fullstackopencluster.2tzqhuw.mongodb.net/?retryWrites=true&w=majority&appName=FullstackopenCluster";
const PORT = process.env.PORT || 3001;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(" Connected to MongoDB");
  })
  .catch((error) => {
    console.error(" MongoDB connection error:", error.message);
  });

// 📝 Morgan logging with POST body
morgan.token("body", (req) =>
  req.method === "POST" || req.method === "PUT" ? JSON.stringify(req.body) : ""
);
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => res.json(persons));
});

app.get("/info", (req, res, next) => {
  Person.countDocuments({})
    .then((count) => {
      const currentDate = new Date();
      res.send(`
        <p>Phonebook has info for ${count} people</p>
        <p>${currentDate}</p>
      `);
    })
    .catch((err) => next(err));
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) res.json(person);
      else res.status(404).end();
    })
    .catch((err) => next(err));
});

// Delete person
app.delete("/api/persons/:id", (req, res, next) => {
  console.log("Deleting person with id:", req.params.id);
  Person.findByIdAndDelete(req.params.id)
    .then(() => res.status(204).end())
    .catch((err) => next(err));
});

app.post("/api/persons", (req, res, next) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({ error: "name or number is missing" });
  }

  const newPerson = new Person({ name, number });

  newPerson
    .save()
    .then((savedPerson) => res.json(savedPerson))
    .catch((err) => next(err));
});

app.put("/api/persons/:id", (req, res, next) => {
  console.log("Updating person with id:", req.params.id);
  console.log("New data:", req.body);

  const { name, number } = req.body;

  const updatedPerson = { name, number };

  Person.findByIdAndUpdate(req.params.id, updatedPerson, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((result) => res.json(result))
    .catch((error) => next(error));
});

app.use((req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
});

app.use((error, req, res, next) => {
  console.error(error.message);
  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return res.status(400).json({ error: error.message });
  }
  next(error);
});

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
});
