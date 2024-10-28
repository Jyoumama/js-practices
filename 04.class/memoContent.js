export default class MemoContent {
  #id;
  #content;
  #createdAt;

  constructor(id = null, content = "", createdAt = new Date()) {
    if (!content || content.trim() === "") {
      throw new Error("Memo content cannot be null or empty.");
    }
    
    this.#id = id;
    this.#content = content && content.trim() !== "" ? content : null;
    this.#createdAt = new Date(createdAt);
    if (isNaN(this.#createdAt)) {
      this.#createdAt = new Date();
    }
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#content ? this.#content.split("\n")[0] : "Untitled";
  }

  get content() {
    return this.#content;
  }

  get createdAt() {
    return this.#createdAt;
  }
}
