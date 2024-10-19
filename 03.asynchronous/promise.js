import sqlite3 from "sqlite3";
import { runAsync, allAsync, closeAsync } from "./sqlite-async.js";

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
    return runAsync(db, "INSERT INTO books (title) VALUES (?)", ["Book 2"]);
  })
  .then((result) => {
    console.log("Inserted record with ID:", result.lastID);
    return allAsync(db, "SELECT * FROM books");
  })
  .then((rows) => {
    console.log("Records:", rows);
    return runAsync(db, "DROP TABLE books");
  })
  .then(() => {
    console.log("Table deleted");
    return closeAsync(db);
  })
  .then(() => {
    console.log("Database closed");
  })
  