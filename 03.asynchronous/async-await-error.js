import sqlite3 from "sqlite3";
import { runAsync, getAsync, closeAsync } from "./promise-shared.js";

const db = new sqlite3.Database(":memory:");

async function myDatabaseOperations() {
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
    await runAsync(db, "INSERT INTO books (title) VALUES (?)", ["Book 1"]);
  } catch (error) {
    if (error && "code" in error) {
      if (error.code === "SQLITE_CONSTRAINT") {
        console.error("Error inserting duplicate record:", error.message);
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  try {
    await getAsync(db, "SELECT * FROM non_existent_table");
  } catch (error) {
    if (error && "message" in error) {
      if (error.message.includes("no such table")) {
        console.error("Error fetching from non-existent table:", error.message);
      } else {
        throw error;
      }
    } else {
      throw error;
    }
  }

  await runAsync(db, "DROP TABLE books");
  console.log("Table deleted");

  await closeAsync(db);
  console.log("Database closed");
}

(async () => {
  try {
    await myDatabaseOperations();
  } catch (error) {
    console.error("An unexpected error occured:", error.message);
  }
})();
