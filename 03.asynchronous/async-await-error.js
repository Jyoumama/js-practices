import sqlite3 from "sqlite3";
import { runAsync, getAsync, closeAsync } from "./sqlite-async.js";

async function myDatabaseOperations() {
  const db = new sqlite3.Database(":memory:");

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

    // 重複レコードの挿入エラーハンドリング
  try {
    await runAsync(db, "INSERT INTO books (title) VALUES (?)", ["Book 1"]);
  } catch (error) {
    // デバッグコード：errorの型を出力
    console.log("Error type:", typeof error);
    console.log("Error value:", error);
    
    // プロパティアクセスできない値をテスト
    const testErrors = [null, undefined, "Some error", 42, true];
    for (const testError of testErrors) {
      try {
        console.log("Test error code:", testError.code);
      } catch (e) {
        console.error(`Failed to access code for ${testError}:`, e.message);
      }

      try {
        console.log("Test error message:", testError.message);
      } catch (e) {
        console.error(`Failed to access message for ${testError}:`, e.message);
      }
    }

    if (error && "code" in error && error.code === "SQLITE_CONSTRAINT") {
      console.error("Error inserting duplicate record:", error.message);
      } else {
        throw error;
      }
    }

   // 存在しないテーブルからのデータ取得エラーハンドリング
  try {
    await getAsync(db, "SELECT * FROM non_existent_table");
  } catch (error) {
    // デバッグコード：errorの型を出力
    console.log("Error type:", typeof error);
    console.log("Error value:", error);

    // プロパティアクセスできない値をテスト
    const testErrors = [null, undefined, "Some error", 42, true];
    for (const testError of testErrors) {
      try {
        console.log("Test error code:", testError.code);
      } catch (e) {
        console.error(`Failed to access code for ${testError}:`, e.message);
      }

      try {
        console.log("Test error message:", testError.message);
      } catch (e) {
        console.error(`Failed to access message for ${testError}:`, e.message);
      }
    }

    if (error && "message" in error && error.message.includes("no such table")) {
      console.error("Error fetching from non-existent table:", error.message);
    } else {
      throw error;
    }
  }

  await runAsync(db, "DROP TABLE books");
  console.log("Table deleted");
  } finally {
    await closeAsync(db);
    console.log("Database closed");
  }
}

await myDatabaseOperations();
