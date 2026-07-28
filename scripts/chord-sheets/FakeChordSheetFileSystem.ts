import path from 'path';
import { ChordSheetFileSystem } from './chordSheetFileSystem';

export class FakeChordSheetFileSystem implements ChordSheetFileSystem {
  private readonly fileContents = new Map<string, string>();

  constructor(initialFiles: Record<string, string> = {}) {
    Object.entries(initialFiles).forEach(([filePath, content]) => {
      this.fileContents.set(filePath, content);
    });
  }

  async copyTextFile(sourcePath: string, destinationPath: string): Promise<void> {
    const sourceContent = await this.readTextFile(sourcePath);
    this.fileContents.set(destinationPath, sourceContent);
  }

  async listFileNames(directoryPath: string): Promise<string[]> {
    return Array.from(this.fileContents.keys())
      .filter((filePath) => path.dirname(filePath) === directoryPath)
      .map((filePath) => path.basename(filePath));
  }

  async readTextFile(filePath: string): Promise<string> {
    const fileContent = this.fileContents.get(filePath);
    if (fileContent === undefined) {
      throw new Error(`Missing fake file "${filePath}"; expected seeded test content`);
    }

    return fileContent;
  }

  async resetDirectory(directoryPath: string): Promise<void> {
    Array.from(this.fileContents.keys())
      .filter((filePath) => path.dirname(filePath) === directoryPath)
      .forEach((filePath) => this.fileContents.delete(filePath));
  }

  async writeTextFile(filePath: string, content: string): Promise<void> {
    this.fileContents.set(filePath, content);
  }
}
