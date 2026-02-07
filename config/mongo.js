const args = process.argv.slice(2);

const printUsage = () => {
  console.log("Usage:");
  console.log("  node mongo.js <password>");
  console.log("  node mongo.js <password> <name> <number>");
};

if (args.length === 0) {
  console.log("Error: password is required");
  printUsage();
  process.exit(1);
}

if (args.length === 2) {
  console.log("Error: you must provide both name and number");
  printUsage();
  process.exit(1);
}

if (args.length > 3) {
  console.log("Error: too many arguments");
  printUsage();
  process.exit(1);
}

const mongoose = require("mongoose");
const [password, name, number] = args;
const url = `mongodb+srv://proippo181:${password}@cluster0.unirfbf.mongodb.net/phoneBookApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);
mongoose.connect(url, { family: 4 });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (args.length === 1) {
  // READ phonebook
  console.log("phonebook:\n");

  Person.find({})
    .then((persons) => {
      persons.forEach((p) => {
        console.log(`${p.name} ${p.number}`);
      });
    })
    .catch((error) => {
      console.log(`Error: ${error}`);
    })
    .finally(() => mongoose.connection.close());

  return;
}

// REGISTER new entry
const person = new Person({
  name,
  number,
});

person
  .save()
  .then((result) => {
    console.log(`added ${result.name} number ${result.number} to phonebook`);
  })
  .catch((error) => {
    console.log(`Error: ${error}`);
  })
  .finally(() => mongoose.connection.close());
