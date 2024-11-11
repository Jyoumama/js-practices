import SQLiteClient from "./sqliteClient.js";
import MemoContent from "./memoContent.js";

export default class MemoRepository {
  #dbClient;

  constructor() {
    this.#dbClient = new SQLiteClient("./memos.db");
  }

  async createTable() {
    await this.#dbClient.run(`
      CREATE TABLE IF NOT EXISTS memos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        created_at DATETIME NOT NULL
      )
    `);
  }

  async addMemo(memo) {
    await this.#dbClient.run(
      "INSERT INTO memos (content, created_at) VALUES (?, ?)",
      [memo.content, memo.createdAt.toISOString()],
    );
  }

  async getAllMemos() {
    const rows = await this.#dbClient.all(
      "SELECT id, content, created_at FROM memos ORDER BY id DESC",
    );
    return rows.map(
      (row) => new MemoContent(row.id, row.content, new Date(row.created_at)),
    );
  }

  async deleteMemo(memo) {
    await this.#dbClient.run("DELETE FROM memos WHERE id = ?", [memo.id]);
  }

  async close() {
    await this.#dbClient.close();
  }
}
