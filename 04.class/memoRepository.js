import sqlite3 from "sqlite3";
import { promisify } from "util";
import MemoContent from "./memoContent.js";

export default class MemoRepository {
  constructor() {
    this.db = new sqlite3.Database("./memos.db");
    this.promisedDB = {
      run: promisify(this.db.run).bind(this.db),
      get: promisify(this.db.get).bind(this.db),
      all: promisify(this.db.all).bind(this.db),
    };
  }

  async initDB() {
    try {
      await this.promisedDB.run(`
        CREATE TABLE IF NOT EXISTS memos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          created_at INTEGER NOT NULL
        )
      `);
      console.log("Table created or already exists.");
    } catch (err) {
      console.error("Error initializing database", err);
      throw err;
    }
  }

  async addMemo(memo) {
    try {
      await this.promisedDB.run(
        "INSERT INTO memos (content, created_at) VALUES (?, ?)",
        [memo.content, memo.createdAt.getTime()],
      );
    } catch (err) {
      console.error("Error adding memo", err);
      throw err;
    }
  }

  async getAllMemos() {
    try {
      const rows = await this.promisedDB.all(
        "SELECT id, content, created_at FROM memos ORDER BY id DESC",
      );
      return rows.map(
        (row) => new MemoContent(row.content, new Date(row.created_at), row.id),
      );
    } catch (err) {
      console.error("Error getting memos", err);
      throw err;
    }
  }

  async deleteMemo(memo) {
    try {
      await this.promisedDB.run("DELETE FROM memos WHERE id = ?", [memo.id]);
    } catch (err) {
      console.error("Error deleting memo", err);
      throw err;
    }
  }
}
