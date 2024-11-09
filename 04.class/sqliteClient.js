import { promisify } from "util";
import sqlite3 from "sqlite3";

export default class SQLiteClient {
  #db;

  constructor(dbFilePath) {
    this.#db = new sqlite3.Database(dbFilePath);
  }

  run(sql, params) {
    return promisify(this.#db.run.bind(this.#db))(sql, params);
  }

  get(sql, params) {
    return promisify(this.#db.get.bind(this.#db))(sql, params);
  }

  all(sql, params) {
    return promisify(this.#db.all.bind(this.#db))(sql, params);
  }

  close() {
    return promisify(this.#db.close.bind(this.#db))();
  }
}
