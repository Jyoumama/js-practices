#!/usr/bin/env node

import sqlite3 from  'sqlite3';
import inquirer from 'inquirer';

const db = sqlite3.verbose();

// Memoクラス: メモのデータを管理
class Memo {
  constructor(title, content) {
    this.title = title;
    this.content = content;
    this.createdAt = new Date();
  }
}

// MemoRepositoryクラス: SQLite3を使用してメモの保存、読み込み、削除を管理
class MemoRepository {
  constructor() {
    this.db = new sqlite3.Database('./memos.db', (err) => {
      if (err) {
        console.error('Error opening database', err);
      } else {
        this.db.run(`
          CREATE TABLE IF NOT EXISTS memos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL
          )
        `);
      }
    });
  }

  addMemo(memo) {
    return new Promise((resolve, reject) => {
      this.db.run('INSERT INTO memos (title, content) VALUES (?, ?)', [memo.title, memo.content], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  getAllMemos() {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT id, title FROM memos', [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getMemoById(id) {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT * FROM memos WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  deleteMemo(id) {
    return new Promise((resolve, reject) => {
      this.db.run('DELETE FROM memos WHERE id = ?', [id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

// MemoAppクラス: アプリケーション全体を管理
class MemoApp {
  constructor() {
    this.memoRepo = new MemoRepository();
  }

  async run() {
    const args = process.argv.slice(2);

    if (args.length === 0) {
      await this.addMemo();
    } else if (args.includes('-l')) {
      await this.listMemos();
    } else if (args.includes('-r')) {
      await this.readMemo();
    } else if (args.includes('-d')) {
      await this.deleteMemo();
    } else {
      console.log('Unknown command');
    }
  }

  async addMemo() {
    console.log("Enter your memo (end with Ctrl+D):");
    let input = '';
    process.stdin.on('data', data => input += data);
    process.stdin.on('end', async () => {
      const firstLine = input.split('\n')[0];
      const memo = new Memo(firstLine, input.trim());
      await this.memoRepo.addMemo(memo);
      console.log('Memo added successfully');
    });
  }

  async listMemos() {
    const memos = await this.memoRepo.getAllMemos();
    memos.forEach(memo => {
      console.log(memo.title);
    });
  }

  async readMemo() {
    const memos = await this.memoRepo.getAllMemos();
    const choices = memos.map(memo => ({ name: memo.title, value: memo.id }));

    const { memoId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'memoId',
        message: 'Choose a memo you want to see:',
        choices
      }
    ]);

    const memo = await this.memoRepo.getMemoById(memoId);
    console.log(memo.content);
  }

  async deleteMemo() {
    const memos = await this.memoRepo.getAllMemos();
    const choices = memos.map(memo => ({ name: memo.title, value: memo.id }));

    const { memoId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'memoId',
        message: 'Choose a memo you want to delete:',
        choices
      }
    ]);

    await this.memoRepo.deleteMemo(memoId);
    console.log('Memo deleted successfully');
  }
}

// 実行開始
const app = new MemoApp();
app.run();
