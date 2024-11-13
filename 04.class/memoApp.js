import inquirer from "inquirer";
import MemoRepository from "./memoRepository.js";
import MemoContent from "./memoContent.js";

export default class MemoApp {
  #memoRepo;

  constructor() {
    this.#memoRepo = new MemoRepository();

    process.on("SIGINT", () => {
      console.log("\nOperation was canceled by user.");
      process.exit(1);
    });
  }

  async run() {
    try {
      await this.#memoRepo.createTable();

      const args = process.argv.slice(2);

      if (args.length === 0) {
        await this.#addMemo();
      } else if (args.includes("-l")) {
        await this.#listMemos();
      } else if (args.includes("-r")) {
        await this.#readMemo();
      } else if (args.includes("-d")) {
        await this.#deleteMemo();
      } else {
        console.log("Unknown command");
        return;
      }
    } catch (err) {
      console.error("Critical error occurred:", err.message);
    }
  }

  async #addMemo() {
    if (process.stdin.isTTY) {
      console.log("Enter your memo (end with Ctrl+D):");
    }

    let content;
    try {
      content = await this.#getInputFromUser();
    } catch (err) {
      throw new Error("Failed to get user input: " + err.message);
    }

    if (content.trim() === "") {
      console.log("No input provided.");
      return;
    }

    const memo = new MemoContent(null, content, new Date());
    await this.#memoRepo.addMemo(memo);
    console.log("Memo added successfully");
  }

  async #listMemos() {
    const memos = await this.#memoRepo.getAllMemos();

    if (memos.length === 0) {
      console.log("No memos found.");
      return;
    }

    memos.forEach((memo) => {
      console.log(memo.firstLine);
    });
  }

  async #readMemo() {
    const memos = await this.#memoRepo.getAllMemos();

    if (memos.length === 0) {
      console.log("No memos found.");
      await this.#promptToAddNewMemo();
      return;
    }

    const choices = memos.map((memo) => ({
      name: memo.firstLine,
      value: memo,
    }));

    try {
      const { selectedMemo } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedMemo",
          message: "Choose a memo you want to see:",
          choices,
        },
      ]);
      console.log(selectedMemo.content);
    } catch (err) {
      if (err.isTtyError || err.message.includes("User force closed")) {
        console.log("Prompt was canceled by the user.");
      } else {
        throw err;
      }
    }
  }

  async #deleteMemo() {
    const memos = await this.#memoRepo.getAllMemos();

    if (memos.length === 0) {
      console.log("No memos found.");
      await this.#promptToAddNewMemo();
      return;
    }

    const choices = memos.map((memo) => ({
      name: memo.firstLine,
      value: memo,
    }));

    try {
      const { selectedMemo } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedMemo",
          message: "Choose a memo you want to delete:",
          choices,
        },
      ]);
      await this.#memoRepo.deleteMemo(selectedMemo);
      console.log("Memo deleted successfully");
    } catch (err) {
      if (err.isTtyError || err.message.includes("User force closed")) {
        console.log("Prompt was canceled by the user.");
      } else {
        throw err;
      }
    }
  }

  async #promptToAddNewMemo() {
    try {
      const { shouldAddNewMemo } = await inquirer.prompt([
        {
          type: "confirm",
          name: "shouldAddNewMemo",
          message: "No memos found. Would you like to add a new memo?",
          default: false,
        },
      ]);

      if (shouldAddNewMemo) {
        await this.#addMemo();
      } else {
        console.log("No memos were added.");
      }
    } catch (err) {
      if (err.isTtyError || err.message.includes("User force closed")) {
        console.log("Prompt was canceled by the user.");
      } else {
        throw err;
      }
    }
  }

  async #getInputFromUser() {
    return new Promise((resolve, reject) => {
      let input = "";
      process.stdin.on("data", (data) => {
        input += data;
      });
      process.stdin.on("end", () => {
        process.stdin.pause();
        resolve(input);
      });
      process.stdin.on("error", (err) => {
        reject(err);
      });
      process.stdin.resume();
    });
  }
}
