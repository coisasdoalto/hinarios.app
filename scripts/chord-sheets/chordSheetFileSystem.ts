import { copyFile, mkdir, readFile, readdir, rm, writeFile } from 'fs/promises';

export interface ChordSheetFileSystem {
  copyTextFile(sourcePath: string, destinationPath: string): Promise<void>;
  listFileNames(directoryPath: string): Promise<string[]>;
  readTextFile(filePath: string): Promise<string>;
  resetDirectory(directoryPath: string): Promise<void>;
  writeTextFile(filePath: string, content: string): Promise<void>;
}

export const nodeChordSheetFileSystem: ChordSheetFileSystem = {
  async copyTextFile(sourcePath: string, destinationPath: string): Promise<void> {
    await copyFile(sourcePath, destinationPath);
  },

  async listFileNames(directoryPath: string): Promise<string[]> {
    const directoryEntries = await readdir(directoryPath, { withFileTypes: true });
    const fileEntries = directoryEntries.filter((directoryEntry) => directoryEntry.isFile());

    return fileEntries.map((fileEntry) => fileEntry.name);
  },

  async readTextFile(filePath: string): Promise<string> {
    const fileContent = await readFile(filePath, 'utf8');

    return fileContent;
  },

  async resetDirectory(directoryPath: string): Promise<void> {
    await rm(directoryPath, { recursive: true, force: true });
    await mkdir(directoryPath, { recursive: true });
  },

  async writeTextFile(filePath: string, content: string): Promise<void> {
    await writeFile(filePath, content, 'utf8');
  },
};
