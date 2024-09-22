import { runAsync, getAsync, closeAsync } from "./promise-utils.js";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:");

runAsync(
  db,
  "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)",
)
  .then(() => {
    console.log("Table created");
    return runAsync(db, "INSERT INTO books (title) VALUES (?)", ["Book 1"]);
  })
  .then((result) => {
    console.log("Inserted record with ID:", result.lastID);
    console.log("Attempting to insert duplicate record...");
    return runAsync(db, "INSERT INTO books (title) VALUES (?)", ["Book 1"]);
  })
  .catch((err) => {
    console.error("Error inserting duplicate record:", err.message);
  })
  .then(() => getAsync(db, "SELECT * FROM non_existent_table"))
  .catch((err) => {
    console.error("Error fetching from non-existent table:", err.message);
  })
  .then(() => runAsync(db, "DROP TABLE books"))
  .then(() => {
    console.log("Table deleted");
    return closeAsync(db);
  })
  .then(() => {
    console.log("Database closed");
  });
