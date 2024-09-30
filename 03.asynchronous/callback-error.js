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
      return callback(err);
    }
    console.log("Inserted record with ID:", this.lastID);
    callback(null);
  });
}

function getInvalidRecords(callback) {
  db.all("SELECT * FROM non_existent_table", callback);
}

function deleteTable(callback) {
  db.run("DROP TABLE books", (err) => {
    if (err) {
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

    insertRecord("Book 1", (err) => {
      if (err) {
        console.error("Error inserting duplicate record:", err.message);
      }

      getInvalidRecords((err) => {
        if (err) {
          console.error("Error fetching from non-existent table:", err.message);
        }

        deleteTable((err) => {
          if (err) return;

          db.close();
        });
      });
    });
  });
});
