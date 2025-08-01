import { useState, useEffect } from "react";
import "./index.css";
import personService from "./components/sevices/person";

const Notification = ({ notification }) => {
  if (!notification.message) return null;

  const style = {
    color: notification.isError ? "red" : "green",
    background: notification.isError ? "#ffdede" : "#ddffdd",
    border: `1px solid ${notification.isError ? "red" : "green"}`,
    padding: 10,
    marginBottom: 10,
  };

  return <div style={style}>{notification.message}</div>;
};

const PersonForm = ({
  newName,
  newNumber,
  handleNameChange,
  handleNumberChange,
  handleSubmit,
}) => (
  <div>
    <h3>Add a new</h3>
    <form onSubmit={handleSubmit}>
      <div>
        name: <input value={newName} onChange={handleNameChange} />
      </div>
      <div>
        number: <input value={newNumber} onChange={handleNumberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  </div>
);

const PersonsList = ({ persons, handleDelete }) => (
  <ul>
    {persons.map((person) => (
      <li key={person.id}>
        {person.name}: {person.number}{" "}
        <button onClick={() => handleDelete(person.id)}>delete</button>
      </li>
    ))}
  </ul>
);

const Filter = ({ filterValue, handleFilterChange }) => (
  <div>
    filter shown with{" "}
    <input value={filterValue} onChange={handleFilterChange} />
  </div>
);

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [notification, setNotification] = useState({
    message: null,
    isError: false,
  });

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const showMessage = (message, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification({ message: null, isError: false }), 5000);
  };

  const handleNameChange = (event) => setNewName(event.target.value);
  const handleNumberChange = (event) => setNewNumber(event.target.value);
  const handleFilterChange = (event) => setFilterValue(event.target.value);

  const handleDelete = (id) => {
    const person = persons.find((p) => p.id === id);
    if (window.confirm(`Delete ${person.name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter((p) => p.id !== id));
          showMessage(`Deleted ${person.name}`);
        })
        .catch(() => {
          showMessage(`Failed to delete ${person.name}`, true);
        });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const existingPerson = persons.find((p) => p.name === newName);

    if (existingPerson) {
      if (
        window.confirm(
          `${newName} is already added. Would you like to update the number?`
        )
      ) {
        const updatedPerson = { ...existingPerson, number: newNumber };
        personService
          .update(existingPerson.id, updatedPerson)
          .then((returnedPerson) => {
            setPersons(
              persons.map((p) =>
                p.id !== returnedPerson.id ? p : returnedPerson
              )
            );
            setNewName("");
            setNewNumber("");
            showMessage(`Updated ${returnedPerson.name}'s number`);
          })
          .catch(() => {
            showMessage(`Failed to update ${newName}`, true);
          });
      }
      return;
    }

    const newPerson = { name: newName, number: newNumber };

    personService
      .create(newPerson)
      .then((returnedPerson) => {
        setPersons(persons.concat(returnedPerson));
        setNewName("");
        setNewNumber("");
        showMessage(`Added ${returnedPerson.name}`);
      })
      .catch(() => {
        showMessage(`Failed to add ${newPerson.name}`, true);
      });
  };

  const filteredPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(filterValue.toLowerCase())
  );

  return (
    <div>
      <h2>Phonebook</h2>

      <Notification notification={notification} />

      <Filter
        filterValue={filterValue}
        handleFilterChange={handleFilterChange}
      />

      <PersonForm
        newName={newName}
        newNumber={newNumber}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        handleSubmit={handleSubmit}
      />

      <h2>Numbers</h2>
      <PersonsList persons={filteredPersons} handleDelete={handleDelete} />
    </div>
  );
};

export default App;
