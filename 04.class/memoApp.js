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
    await this.#memoRepo.createTable();

    const args = process.argv.slice(2);

    try {
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
      if (err?.message === "SIGINT") {
        console.log("Operation was canceled by user.");
      } else if (err instanceof Error) {
        console.error("Error executing command:", err.message);
      } else {
        console.error("An unknown error occurred:", err);
      }
    }
  }

  async #addMemo() {
    if (process.stdin.isTTY) {
      console.log("Enter your memo (end with Ctrl+D):");
    }

    try {
      const input = await this.#getInputFromUser();

      if (input === "") {
        console.log("No input provided.");
        return;
      }

      const memo = new MemoContent(null, input);
      await this.#memoRepo.addMemo(memo);
      console.log("Memo added successfully");
    } catch (err) {
      if (err?.message === "SIGINT") {
        console.log("Operation was canceled by user.");
      } else if (err instanceof Error) {
        console.error("Error adding memo:", err.message);
      } else {
        console.error("An unknown error occurred:", err);
      }
    }
  }

  async #getInputFromUser() {
    return new Promise((resolve, reject) => {
      let dataBuffer = "";
      process.stdin.on("data", (data) => {
        dataBuffer += data;
      });
      process.stdin.on("end", () => {
        process.stdin.pause();
        resolve(dataBuffer);
      });
      process.stdin.on("error", (err) => {
        reject(err);
      });
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
        console.log(memo.title);
      });
    } catch (err) {
      if (err?.message === "SIGINT") {
        console.log("Operation was canceled by user.");
      } else if (err instanceof Error) {
        console.error("Error fetching memos:", err.message);
      } else {
        console.error("An unknown error occurred:", err);
      }
    }
  }

  async #readMemo() {
    try {
      const memos = await this.#memoRepo.getAllMemos();

      if (memos.length === 0) {
        console.log("No memos found.");
        await this.#promptToAddNewMemo();
        return;
      }

      const choices = memos.map((memo) => ({
        name: memo.title,
        value: memo,
      }));

      const { selectedMemo } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedMemo",
          message: "Choose a memo you want to see:",
          choices,
        },
      ]);

      console.log(`Content:\n${selectedMemo.content}`);
    } catch (err) {
      if (
        err?.isTtyError ||
        err?.message === "SIGINT" ||
        err?.name === "ExitPromptError"
      ) {
        console.log("Prompt was canceled by user.");
      } else {
        console.error("Error prompting for memo selection:", err);
      }
    }
  }

  async #deleteMemo() {
    try {
      const memos = await this.#memoRepo.getAllMemos();

      if (memos.length === 0) {
        console.log("No memos found.");
        await this.#promptToAddNewMemo();
        return;
      }

      const choices = memos.map((memo) => ({
        name: memo.title,
        value: memo,
      }));

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
      if (
        err?.isTtyError ||
        err?.message === "SIGINT" ||
        err?.name === "ExitPromptError"
      ) {
        console.log("Prompt was canceled by user.");
      } else {
        console.error("Error prompting for memo deletion:", err);
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
      if (
        err?.isTtyError ||
        err?.message === "SIGINT" ||
        err?.name === "ExitPromptError"
      ) {
        console.log("Prompt was canceled by user.");
      } else {
        throw err;
      }
    }
  }
}
