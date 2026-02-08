require("dotenv").config();
const express = require("express");
var morgan = require("morgan");
const Person = require("./models/person");

const app = express();

// TO BE REMOVED
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

const requestLogger = (request, response, next) => {
  console.log("Method:", request.method);
  console.log("Path:  ", request.path);

  if (request.body && Object.keys(request.body).length > 0) {
    console.log("Body:", request.body);
  } else {
    console.log("Body:  <empty>");
  }

  console.log("---");
  next();
};

app.use(express.json());
app.use(requestLogger);
app.use(express.static("dist"));

app.get("/info", (req, res) => {
  const info = `Phonebook has info for ${persons.length} people`;
  const date = new Date();

  res.send(`${info}<br><br>${date}`);
});

const API_BASE_URL = "/api/persons/";

// GET ALL
app.get(API_BASE_URL, (req, res) => {
  Person.find({}).then((person) => {
    res.json(person);
  });
});

// GET EACH
app.get(`${API_BASE_URL}:id`, (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (!person) {
        res.status(404).json({
          error: "NOT_FOUND",
          message: "person not found",
          id,
        });
      }

      return res.json(person);
    })
    .catch((error) => {
      next(error);
    });
});

// DELETE REQUEST
app.delete(`${API_BASE_URL}:id`, (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then((personToDelete) => {
      if (personToDelete) {
        res.status(200).json(personToDelete);
      } else {
        res.status(404).json({
          error: "NOT_FOUND",
          message: "person not found",
          id,
        });
      }
    })
    .catch((error) => {
      next(error);
    });
});

morgan.token("body", (req) => {
  return JSON.stringify(req.body);
});

app.use(
  morgan(":method :url :status :response-time[0] - :total-time ms :body\n---"),
);

// POST REQUEST
app.post(API_BASE_URL, async (req, res) => {
  const { name, number } = req.body;

  if (!name || !number) {
    return res.status(400).json({
      error: "MISSING_REQUIRED_FIELDS",
      message: "name and number are required",
    });
  }

  if (await Person.exists({ name })) {
    return res.status(409).json({
      error: "DUPLICATE_NAME",
      message: "name must be unique",
    });
  }

  const person = new Person({
    name,
    number,
  });

  person.save().then((person) => {
    res.status(201).json(person);
  });
});

app.put(`${API_BASE_URL}:id`, async (req, res, next) => {
  const { name, number } = req.body;
  const id = req.params.id;

  Person.findById(id).then((person) => {
    if (!person) {
      res.status(404).json({
        error: "NOT_FOUND",
        message: "person not found",
        id,
      });
    }

    person.name = name;
    person.number = number;

    return person
      .save()
      .then((updatedPerson) => {
        res.json(updatedPerson);
      })
      .catch((error) => {
        next(error);
      });
  });
});

const unknownEndpoint = (req, res) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).json({
      error: "INVALID_ID",
      message: "malformatted id",
    });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
