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
        process.exit(1);
      }
    } catch (err) {
      console.error("Error running command:", err.message);
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
      console.error("Error reading user input:", err.message);
      return;
    }

    if (content.trim() === "") {
      console.log("No input provided.");
      return;
    }

    const memo = new MemoContent(null, content, new Date());

    try {
      await this.#memoRepo.addMemo(memo);
      console.log("Memo added successfully");
    } catch (err) {
      console.error("Failed to add memo due to database error:", err.message);
      throw err;
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

  async #listMemos() {
    try {
      const memos = await this.#memoRepo.getAllMemos();

      if (memos.length === 0) {
        console.log("No memos found.");
        return;
      }

      memos.forEach((memo) => {
        console.log(memo.firstLine);
      });
    } catch (err) {
      console.error(
        "Failed to fetch memos due to database error:",
        err.message,
      );
    }
  }

  async #readMemo() {
    let memos;
    try {
      memos = await this.#memoRepo.getAllMemos();

      if (memos.length === 0) {
        console.log("No memos found.");
        await this.#promptToAddNewMemo();
        return;
      }
    } catch (err) {
      console.error(
        "Failed to fetch memos due to database error:",
        err.message,
      );
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

      console.log("Content:");
      console.log(selectedMemo.content);
    } catch (err) {
      if (err.isTtyError || err.message.includes("User force closed")) {
        console.log("Prompt was canceled by the user.");
      } else {
        console.error("Error during memo selection:", err.message);
      }
    }
  }

  async #deleteMemo() {
    let memos;
    try {
      memos = await this.#memoRepo.getAllMemos();

      if (memos.length === 0) {
        console.log("No memos found.");
        await this.#promptToAddNewMemo();
        return;
      }
    } catch (err) {
      console.error(
        "Failed to fetch memos due to database error:",
        err.message,
      );
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
        console.error("Error during memo deletion:", err.message);
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
        console.error("Error during prompt for new memo:", err.message);
      }
    }
  }
}
