class MemoContent {
  constructor(content, createdAt = new Date(), id = null) {
    this._id = id;
    this._content = content;
    this._createdAt = new Date(createdAt);
    if (isNaN(this._createdAt)) {
      this._createdAt = new Date();
    }
  }

  getId() {
    return this._id;
  }

  getTitle() {
    return this._content.split("\n")[0];
  }

  getContent() {
    return this._content;
  }

  getCreatedAt() {
    return this._createdAt;
  }
}

export default MemoContent;
