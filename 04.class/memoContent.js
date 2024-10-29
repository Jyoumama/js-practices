export default class MemoContent {
  #id;
  #content;
  #createdAt;

  constructor(id = null, content, createdAt = new Date()) {
    if(id!== null && typeof id !== "number") {
      throw new Error("Invalid ID: ID must be a number or null.");
    }

    if(typeof content !== "string"|| content.trim() === ""){
      throw new Error("Memo content cannot be null or empty.");
    }

    const parsedDate = new Date(createdAt);
    if(!(parsedDate instanceof Date)|| isNaN(parsedDate.getTime())){
      throw new Error("invalid date:createdAt must be a valid Date.");
    }

    this.#id = id;
    this.#content = content.trim();
    this.#createdAt = parsedDate;
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
