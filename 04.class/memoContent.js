export default class MemoContent {
  #id;
  #content;
  #createdAt;

  constructor(id, content, createdAt) {
    if (id !== undefined && id !== null && typeof id !== "number") {
      throw new Error("Invalid ID: ID must be a number, undefined, or null.");
    }

    if (typeof content !== "string" || content === "") {
      throw new Error("Memo content cannot be null or empty.");
    }

    if (!(createdAt instanceof Date)) {
      throw new Error("Invalid date:CreatedAt must be a Date instance.");
    }

    this.#id = id;
    this.#content = content;
    this.#createdAt = createdAt;
  }

  get id() {
    return this.#id;
  }

  get firstLine() {
    return this.#content ? this.#content.split("\n")[0] : "Untitled";
  }

  get content() {
    return this.#content;
  }

  get createdAt() {
    return this.#createdAt;
  }
}
