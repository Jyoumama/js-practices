import { runAsync, getAsync, closeAsync } from "./promise-utils.js";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:");

async function main() {
  try {
    await runAsync(
      db,
      "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)",
    );
    console.log("Table created");

    const result1 = await runAsync(db, "INSERT INTO books (title) VALUES (?)", [
      "Book 1",
    ]);
    console.log("Inserted record with ID:", result1.lastID);

    try {
      console.log("Attempting to insert duplicate record...");
      await runAsync(db, "INSERT INTO books (title) VALUES (?)", ["Book 1"]);
    } catch (err) {
      if (err.message.includes("SQLITE_CONSTRAINT")) {
        console.error("Error inserting duplicate record:", err.message);
      } else {
        throw err;
      }
    }

    try {
      await getAsync(db, "SELECT * FROM non_existent_table");
    } catch (err) {
      if (err.message.includes("no such table")) {
        console.error("Error fetching from non-existent table:", err.message);
      } else {
        throw err;
      }
    }

    await runAsync(db, "DROP TABLE books");
    console.log("Table deleted");
  } catch (err) {
    console.error("Unexpected error:", err.message);
  } finally {
    try {
      await closeAsync(db);
      console.log("Database closed");
    } catch (closeErr) {
      console.error("Error closing the database:", closeErr.message);
    }
  }
}

main();
