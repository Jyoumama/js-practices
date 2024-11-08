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
      this.#handleError(err, "running command");
    }
  }

  async #addMemo() {
    try {
      if (process.stdin.isTTY) {
        console.log("Enter your memo (end with Ctrl+D):");
      }

      const content = await this.#getInputFromUser();

      if (content.trim() === "") {
        console.log("No input provided.");
        return;
      }

      const memo = new MemoContent(null, content, new Date());
      await this.#memoRepo.addMemo(memo);
      console.log("Memo added successfully");
    } catch (err) {
      this.#handleError(err, "adding memo");
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
      this.#handleError(err, "fetching memos");
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
        name: memo.firstLine,
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

      console.log("Content:");
      console.log(selectedMemo.content);
    } catch (err) {
      this.#handleError(err, "reading memo");
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
        name: memo.firstLine,
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
      this.#handleError(err, "deleting memo");
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
      this.#handleError(err, "prompting to add new memo");
    }
  }

  #handleError(err, context = "executing command") {
    if (this.#isCliError(err)) {
      console.log("Operation was canceled by user.");
      return;
    }

    if (err instanceof Error) {
      console.error(`Error ${context}:`, err.message);

      if (this.#isDatabaseError(err, context)) {
        console.error(
          "A database error occurred. Please check your connection.",
        );
        throw err;
      }

      if (this.#isCriticalError(err, context)) {
        console.error(
          "A critical error occurred. The operation cannot continue.",
        );
        throw err;
      }
    } else {
      console.error("An unknown error occurred:", err);
    }
  }

  #isCliError(err) {
    return (
      err?.isTtyError ||
      err?.message === "SIGINT" ||
      err?.name === "ExitPromptError"
    );
  }

  #isDatabaseError(err, context) {
    return context.includes("database") && err.message.includes("database");
  }

  #isCriticalError(err, context) {
    return context.includes("critical") || err.message.includes("critical");
  }
}
