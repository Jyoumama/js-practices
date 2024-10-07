import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:");

db.run(
  "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)",
  () => {
    console.log("Table created");

    db.run("INSERT INTO books (title) VALUES (?)", ["Book 1"], function () {
      console.log("Inserted record with ID:", this.lastID);

      db.run("INSERT INTO books (title) VALUES (?)", ["Book 1"], (error) => {
        if (error) {
          console.error("Error inserting duplicate record:", error.message);
        }

        db.all("SELECT * FROM non_existent_table", (error) => {
          if (error) {
            console.error(
              "Error fetching from non-existent table:",
              error.message,
            );
          }

          db.run("DROP TABLE books", () => {
            console.log("Table deleted");

            db.close(() => {
              console.log("Database closed");
            });
          });
        });
      });
    });
  },
);
