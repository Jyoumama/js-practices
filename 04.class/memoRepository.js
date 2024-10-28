import sqlite3 from "sqlite3";
import { promisify } from "util";
import MemoContent from "./memoContent.js";

export default class MemoRepository {
  constructor() {
    this.db = new sqlite3.Database("./memos.db");
  }

  run(sql, params = []) {
    return promisify(this.db.run).bind(this.db)(sql,params);
  }

  get(sql, params = []) {
    return promisify(this.db.get).bind(this.db)(sql,params);
  }
  
  all(sql, params = []) {
    return promisify(this.db.all).bind(this.db)(sql,params);
  }

  async createTable() {
    try {
      await this.run(
        `
          CREATE TABLE IF NOT EXISTS memos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content TEXT NOT NULL,
            created_at DATETIME NOT NULL
          )
          `.trim(),  
        );
    } catch (err) {
      throw new Error("Error initializing database:", { cause: err });
    }
  }

  async addMemo(memo) {
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
      const rows = await this.all(
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
      await this.run("DELETE FROM memos WHERE id = ?", [memo.id]);
    } catch (err) {
      throw new Error("Error deleting memo:" + err.message);
    }
  }
}
