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
      this.#handleError(err);
    }
  }

  async #addMemo() {
    if (process.stdin.isTTY) {
      console.log("Enter your memo (end with Ctrl+D):");
    }

    let input;
    try {
      input = await this.#getInputFromUser();
    } catch (err) {
      this.#handleError(err, "getting input from user");
      return;
    }

    if (input === "") {
      console.log("No input provided.");
      return;
    }

    const memo = new MemoContent(null, input);
    await this.#memoRepo.addMemo(memo);
    console.log("Memo added successfully");
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
    let memos;
    try {
      memos = await this.#memoRepo.getAllMemos();
    } catch (err) {
      this.#handleError(err, "fetching memos");
      return;
    }

    if (memos.length === 0) {
      console.log("No memos found.");
      return;
    }

    memos.forEach((memo) => {
      console.log(memo.getFirstLine());
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
      name: memo.getFirstLine(),
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
      this.#handleError(err, "prompting for memo selection");
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
      name: memo.getFirstLine(),
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
      this.#handleError(err, "prompting for memo deletion");
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
      this.#handleError(err, "adding new memo");
    }
  }

  #handleError(err, context = "executing command") {
    if (
      err?.isTtyError ||
      err?.message === "SIGINT" ||
      err?.name === "ExitPromptError"
    ) {
      console.log("Prompt was canceled by user.");
    } else if (err instanceof Error) {
      console.error(`Error ${context}:`, err.message);

      if (
        err.message.includes("database") ||
        err.message.includes("critical")
      ) {
        throw err;
      }
    } else {
      console.error("An unknown error occurred:", err);
    }
  }
}
