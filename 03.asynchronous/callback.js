import sqlite3 from "sqlite3";

const db = new sqlite3.Database(":memory:");

function createTable(callback) {
  db.run(
    "CREATE TABLE books (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL UNIQUE)",
    (err) => {
      if (err) {
        console.error("Error creating table:", err.message);
        return callback(err);
      }
      console.log("Table created");
      callback(null);
    },
  );
}

function insertRecord(title, callback) {
  db.run("INSERT INTO books (title) VALUES (?)", [title], function (err) {
    if (err) {
      console.error("Error inserting record:", err.message);
      return callback(err);
    }
    console.log("Inserted record with ID:", this.lastID);
    callback(null);
  });
}

function getRecords(callback) {
  db.all("SELECT * FROM books", (err, rows) => {
    if (err) {
      console.error("Error fetching records:", err.message);
      return callback(err);
    }
    console.log("Records:", rows);
    callback(null);
  });
}

function deleteTable(callback) {
  db.run("DROP TABLE books", (err) => {
    if (err) {
      console.error("Error deleting table:", err.message);
      return callback(err);
    }
    console.log("Table deleted");
    callback(null);
  });
}

createTable((err) => {
  if (err) return;

  insertRecord("Book 1", (err) => {
    if (err) return;

    insertRecord("Book 2", (err) => {
      if (err) return;

      getRecords((err) => {
        if (err) return;

        deleteTable((err) => {
          if (err) return;

          db.close();
        });
      });
    });
  });
});
