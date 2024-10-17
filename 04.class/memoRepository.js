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

  async createTable() {
    try {
      await this.promisedDB.run(`
          CREATE TABLE IF NOT EXISTS memos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            created_at INTEGER NOT NULL
          )
        `);
    } catch (err) {
      throw new Error("Error initializing database:" + err.message);
    }
  }

  async addMemo(memo) {
    // メモの内容が null または空でないことを確認
    if (!memo.content || memo.content.trim() === "") {
      throw new Error("Memo content cannot be null or empty.");
    }

    try {
      await this.promisedDB.run(
        "INSERT INTO memos (content, created_at) VALUES (?, ?)",
        [memo.content, memo.createdAt.getTime()],
      );
    } catch (err) {
      throw new Error("Error adding memo:" + err.message);
    }
  }

  async getAllMemos() {
    try {
      const rows = await this.promisedDB.all(
        "SELECT id, content, created_at FROM memos ORDER BY id DESC",
      );
      return rows.map(
        (row) =>
          new MemoContent(row.id, row.content || "", new Date(row.created_at)),
      );
    } catch (err) {
      throw new Error("Error getting memos:" + err.message);
    }
  }

  async deleteMemo(memo) {
    try {
      await this.promisedDB.run("DELETE FROM memos WHERE id = ?", [memo.id]);
    } catch (err) {
      throw new Error("Error deleting memo:" + err.message);
    }
  }
}
