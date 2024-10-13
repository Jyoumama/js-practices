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

  getId() {
    return this.#id;
  }

  getTitle() {
    return this.#content.split("\n")[0];
  }

  getContent() {
    return this.#content;
  }

  getCreatedAt() {
    return this.#createdAt;
  }
}

export default MemoContent;
