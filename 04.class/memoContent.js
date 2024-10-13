class MemoContent {
  #id;
  #content;
  #createdAt;

  constructor( id = null, content, createdAt = new Date()) {
    this.#id = id;
    this.#content = content;
    this.#createdAt = new Date(createdAt);
    if (isNaN(this.#createdAt)) {
      this.#createdAt = new Date();
    }
  }

  get id() {
    return this.#id;
  }

  get title() {
    return this.#content.split("\n")[0];
  }

  get content() {
    return this.#content;
  }

  get createdAt() {
    return this.#createdAt;
  }
}

export default MemoContent;
