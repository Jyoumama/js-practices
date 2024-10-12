import inquirer from "inquirer";
import MemoRepository from "./memoRepository.js";
import MemoContent from "./memoContent.js";

class MemoApp {
  #memoRepo;

  constructor() {
    this.#memoRepo = new MemoRepository();
  }

  async run() {
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
  }

  async addMemo() {
    process.on("SIGINT", () => {
      console.log("\nOperation was canceled by user.");
      process.exit(1);
    });

    if (process.stdin.isTTY) {
      console.log("Enter your memo (end with Ctrl+D):");
    }

    const input = await new Promise((resolve) => {
      let dataBuffer = "";
      process.stdin.once("data", (data) => {
        dataBuffer += data;
      });
      process.stdin.once("end", () => {
        process.stdin.pause();
        resolve(dataBuffer);
      });
    });

    const memo = new MemoContent(input.trim());
    await this.#memoRepo.addMemo(memo);
    console.log("Memo added successfully");
  }

  async listMemos() {
    const memos = await this.#memoRepo.getAllMemos();
    if (memos.length === 0) {
      console.log("No memos found.");
    } else {
      memos.forEach((memo) => {
        console.log(memo.getTitle());
      });
    }
  }

  async readMemo() {
    try {
      const memos = await this.#memoRepo.getAllMemos();
      if (memos.length === 0) {
        console.log("No memos found.");
        const { addNewMemo } = await inquirer.prompt([
          {
            type: "confirm",
            name: "addNewMemo",
            message: "No memos found. Would you like to add a new memo?",
            default: true,
          },
        ]);

        if (addNewMemo) {
          await this.addMemo();
        } else {
          console.log("No memos were added.");
        }
        return;
      }

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

      console.log(
        `Title: ${selectedMemo.getTitle()}\nContent: ${selectedMemo.getContent()}`,
      );
    } catch (err) {
      if (err.isTtyError) {
        console.error("Prompt couldn't be rendered in the current environment");
      } else if (err.message === "ExitPromptError") {
        console.log("Prompt was canceled by user.");
      } else {
        console.error("An error occurred:", err);
      }
    }
  }

  async deleteMemo() {
    try {
      const memos = await this.#memoRepo.getAllMemos();

      if (memos.length === 0) {
        console.log("No memos found.");
        const { addNewMemo } = await inquirer.prompt([
          {
            type: "confirm",
            name: "addNewMemo",
            message: "No memos found. Would you like to add a new memo?",
            default: true,
          },
        ]);

        if (addNewMemo) {
          await this.addMemo();
        } else {
          console.log("No memos were added.");
        }
        return;
      }

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
      if (err.isTtyError) {
        console.error("Prompt couldn't be rendered in the current environment");
      } else if (err.name === "ExitPromptError") {
        console.log("Prompt was canceled by user.");
      } else {
        console.error("An error occurred:", err);
      }
    }
  }
}

export default MemoApp;
