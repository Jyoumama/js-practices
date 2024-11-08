import sqlite3 from "sqlite3";
import { promisify } from "util";

export default class SQLiteClient {
  #db;

  constructor(databaseFile) {
    this.#db = new sqlite3.Database(databaseFile);
  }

  run(sql, params = []) {
    return promisify(this.#db.run.bind(this.#db))(sql, params);
  }

  get(sql, params = []) {
    return promisify(this.#db.get.bind(this.#db))(sql, params);
  }

  all(sql, params = []) {
    return promisify(this.#db.all.bind(this.#db))(sql, params);
  }

  close() {
    return promisify(this.#db.close.bind(this.#db))();
  }
}
