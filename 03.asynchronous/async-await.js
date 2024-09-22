import { runAsync, allAsync, closeAsync } from "./promise-utils.js";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:");

await runAsync(
  db,
  "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)",
);
console.log("Table created");

const result1 = await runAsync(db, "INSERT INTO books (title) VALUES (?)", [
  "Book 1",
]);
console.log("Inserted record with ID:", result1.lastID);

const result2 = await runAsync(db, "INSERT INTO books (title) VALUES (?)", [
  "Book 2",
]);
console.log("Inserted record with ID:", result2.lastID);

const rows = await allAsync(db, "SELECT * FROM books");
console.log("Records:", rows);

await runAsync(db, "DROP TABLE books");
console.log("Table deleted");

await closeAsync(db);
