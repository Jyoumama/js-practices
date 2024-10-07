import sqlite3 from "sqlite3";
import { runAsync, getAsync, closeAsync } from "./promise-shared.js";

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
    } else {
      return Promise.reject(error);
    }
  })
  .then(() => {
    return getAsync(db, "SELECT * FROM non_existent_table");
  })
  .then((rows) => {
    console.log("Fetched rows:", rows);
  })
  .catch((error) => {
    console.error("Error fetching from non-existent table:", error.message);
  })
  .finally(() => {
    return runAsync(db, "DROP TABLE books")
      .then(() => {
        console.log("Table deleted");
      })
      .catch((error) => {
        console.error("Error deleting table:", error.message);
      });
  })
  .finally(() => {
    return closeAsync(db)
      .then(() => {
        console.log("Database closed");
      })
      .catch((error) => {
        console.error("Error closing database:", error.message);
      });
  })
  .catch((error) => {
    if (error.code !== "SQLITE_CONSTRAINT") {
      console.error("Final error:", error.message);
    }
  });
