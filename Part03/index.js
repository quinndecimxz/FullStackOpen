const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");
const path = require("path");

app.use(cors());

app.use(express.json());

morgan.token("body", (req) => {
  return req.method === "POST" || req.method === "PUT"
    ? JSON.stringify(req.body)
    : "";
});

app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms  :body")
);

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (req, res) => {
  const numberOfPersons = persons.length;
  const currentDate = new Date();

  res.send(`
        <p>Phonebook has information of ${numberOfPersons} people</p>
        <p>${currentDate};</p>
        `);
});

app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    response.status(404).send(`<h1>Aw snap! error 404</h1>`);
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

app.post("/api/persons", (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number is missing",
    });
  }

  const nameExists = persons.some((p) => p.name === body.name);
  if (nameExists) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }
  const newPerson = {
    id: Math.floor(Math.random() * 1000000).toString(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(newPerson);
  response.status(201).json(newPerson);
});

app.use(express.static("dist"));

const PORT = process.env.port || 3001;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
