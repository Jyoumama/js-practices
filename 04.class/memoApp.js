import inquirer from "inquirer";
import MemoRepository from "./memoRepository.js";
import MemoContent from "./memoContent.js";

class MemoApp {
  #memoRepo;

  constructor() {
    this.#memoRepo = new MemoRepository();
  }

  async run() {
    try {
      await this.#memoRepo.initDB();

      const args = process.argv.slice(2);

      if (args.length === 0) {
        await this.addMemo();
      } else if (args.includes("-l")) {
        await this.listMemos();
      } else if (args.includes("-r")) {
        await this.readMemo();
      } else if (args.includes("-d")) {
        await this.deleteMemo();
      } else {
        console.log("Unknown command");
        process.exit(1);
      }
    } catch (err) {
      if (typeof err === "object" && err !== null) {
        console.error("Error running the application:", err);
      } else {
        console.error("An unknown error occurred:", err);
      }
      throw err;
    }
  }

  async addMemo() {
    process.on("SIGINT", () => {
      console.log("\nOperation was canceled by user.");
      process.exit(1);
    });

    if (process.stdin.isTTY) {
      console.log("Enter your memo (end with Ctrl+D):");
    }

    try {
      const input = await this.getInputFromUser();
      if (!input) {
        console.log("No input provided.");
        return;
      }

      const memo = new MemoContent(input.trim());
      await this.#memoRepo.addMemo(memo);
      console.log("memo added successfully");
    } catch (err) {
      if (typeof err === "object" && err !== null) {
        console.error("Error adding memo:", err);
      } else {
        console.error("An unknown error occurred:", err);
      }
      throw err;
    }
  }

  async getInputFromUser() {
    return new Promise((resolve) => {
      let dataBuffer = "";
      process.stdin.on("data", (data) => {
        dataBuffer += data;
      });
      process.stdin.on("end", () => {
        process.stdin.pause();
        resolve(dataBuffer);
      });
    });
  }

  async promptToAddNewMemo() {
    const { shouldAddNewMemo } = await inquirer.prompt([
      {
        type: "confirm",
        name: "shouldAddNewMemo",
        message: "No memos found. Would you like to add a new memo?",
        default: false,
      },
    ]);

    if (shouldAddNewMemo) {
      await this.addMemo();
    } else {
      console.log("No memos were added.");
    }
  }

  async listMemos() {
    try {
      const memos = await this.#memoRepo.getAllMemos();

      if (memos.length === 0) {
        console.log("No memos found.");
        return;
      }

      memos.forEach((memo) => {
        console.log(memo.getTitle());
      });
    } catch (err) {
      if (typeof err === "object" && err !== null) {
        console.error("Error fetching memos:", err);
      } else {
        console.error("An unknown error occurred:", err);
      }
      throw err;
    }
  }

  async readMemo() {
    let memos = [];
    try {
      memos = await this.#memoRepo.getAllMemos();
    } catch (err) {
      if (typeof err === "object" && err !== null) {
        console.error("Error fetching memos:", err);
      } else {
        console.error("An unknown error occurred:", err);
      }
      throw err;
    }

    if (memos.length === 0) {
      console.log("No memos found.");
      await this.promptToAddNewMemo();
      return;
    }

    try {
      const choices = memos.map((memo) => ({
        name: memo.getTitle(),
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

      console.log(`Content:\n${selectedMemo.getContent()}`);
    } catch (err) {
      if (
        typeof err === "object" &&
        err !== null &&
        err.name === "ExitPromptError"
      ) {
        console.log("Prompt was canceled by user.");
      } else {
        console.error("Error prompting for memo selection:", err);
      }
      throw err;
    }
  }

  async deleteMemo() {
    let memos = [];
    try {
      memos = await this.#memoRepo.getAllMemos();
    } catch (err) {
      if (typeof err === "object" && err !== null) {
        console.error("Error fetching memos:", err);
      } else {
        console.error("An unknown error occurred:", err);
      }
      throw err;
    }

    if (memos.length === 0) {
      console.log("No memos found.");
      await this.promptToAddNewMemo();
      return;
    }

    try {
      const choices = memos.map((memo) => ({
        name: memo.getTitle(),
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
        typeof err === "object" &&
        err !== null &&
        err.name === "ExitPromptError"
      ) {
        console.log("Prompt was canceled by user.");
      } else {
        console.error("Error prompting for memo deletion:", err);
        throw err;
      }
    }
  }
}

export default MemoApp;
