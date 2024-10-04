import sqlite3 from "sqlite3";
const db = new sqlite3.Database(":memory:");

db.run(
  "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)",
  (err) => {
    if (err) {
      console.error("Error creating table:", err.message);
      return;
    }
    console.log("Table created");

    db.run("INSERT INTO books (title) VALUES (?)", ["Book 1"], function (err) {
      if (err) {
        console.error("Error inserting record:", err.message);
        return;
      }
      console.log("Inserted record with ID:", this.lastID);

      db.run(
        "INSERT INTO books (title) VALUES (?)",
        ["Book 1"],
        function (err) {
          if (err) {
            console.error("Error inserting duplicate record:", err.message);
          }

          db.all("SELECT * FROM non_existent_table", (err) => {
            if (err) {
              console.error(
                "Error fetching from non-existent table:",
                err.message,
              );
            }

            db.run("DROP TABLE books", (err) => {
              if (err) {
                console.error("Error deleting table:", err.message);
                return;
              }
              console.log("Table deleted");

              db.close((err) => {
                if (err) {
                  console.error("Error closing database:", err.message);
                  return;
                }
                console.log("Database closed");
              });
            });
          });
        },
      );
    });
  },
);
