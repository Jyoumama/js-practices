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
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "SQLITE_CONSTRAINT"
    ) {
      console.error("Error inserting duplicate record:", error.message);
    } else {
      throw error;
    }
  })
  .then(() => getAsync(db, "SELECT * FROM non_existent_table"))
  .catch((error) => {
    if (
      typeof error === "object" &&
      error !== null &&
      error.message.includes("no such table")
    ) {
      console.error("Error fetching from non-existent table:", error.message);
    } else {
      throw error;
    }
  })
  .then(() => runAsync(db, "DROP TABLE books"))
  .then(() => {
    console.log("Table deleted");
    return closeAsync(db);
  })
  .then(() => {
    console.log("Database closed");
  });
