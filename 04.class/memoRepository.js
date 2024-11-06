import sqlite3 from "sqlite3";
const { Database } = sqlite3;
import { promisify } from "util";
import MemoContent from "./memoContent.js";

export default class MemoRepository {
  constructor() {
    this.db = new Database("./memos.db");
  }

  #run(sql, params = []) {
    return promisify(this.db.run.bind(this.db))(sql, params);
  }

  #all(sql, params = []) {
    return promisify(this.db.all.bind(this.db))(sql, params);
  }

  async createTable() {
    await this.#run(
      `
        CREATE TABLE IF NOT EXISTS memos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT NOT NULL,
          created_at DATETIME NOT NULL
        )
      `.trim()
    );
  }

  async addMemo(memo) {
    await this.#run("INSERT INTO memos (content, created_at) VALUES (?, ?)", [
      memo.content,
      memo.createdAt.toISOString(),
    ]);
  }

  async getAllMemos() {
    const rows = await this.#all(
      "SELECT id, content, created_at FROM memos ORDER BY id DESC",
    );
    return rows.map(
      (row) => new MemoContent(row.id, row.content, new Date(row.created_at)),
    );
  }

  async deleteMemo(memo) {
    await this.#run("DELETE FROM memos WHERE id = ?", [memo.id]);
  }
}
