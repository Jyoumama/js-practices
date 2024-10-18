import sqlite3 from "sqlite3";
import { runAsync, getAsync, closeAsync } from "./sqlite-async.js";

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
    return runAsync(db, "INSERT INTO books (title) VALUES (?)", ["Book 1"]);
  })
  .catch((error) => {
    if (error.code === "SQLITE_CONSTRAINT") {
      console.error("Error inserting duplicate record:", error.message);
      return Promise.resolve();
    }
    return Promise.resolve();
  })
  .then(() => getAsync(db, "SELECT * FROM non_existent_table"))
  .then((rows) => {
    console.log("Fetched rows:", rows);
  })
  .catch((error) => {
    if (error.message.includes("no such table")) {
      console.error("Error fetching from non-existent table:", error.message);
      return Promise.resolve();
    }
    return Promise.reject(error);
  })
  .then(() => runAsync(db, "DROP TABLE books"))
  .then(() => {
    console.log("Table deleted");
    return closeAsync(db);
  })
  .then(() => {
    console.log("Database closed");
  })
  .catch((error) => {
    console.error("Final error:", error.message);
  });
