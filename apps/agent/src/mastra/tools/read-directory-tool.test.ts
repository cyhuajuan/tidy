import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { readDirectory } from './read-directory-tool';

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempDirectories
      .splice(0)
      .map((directoryPath) =>
        rm(directoryPath, { force: true, recursive: true }),
      ),
  );
});

describe('readDirectory', () => {
  test('returns direct entries with directory-first sorting and metadata', async () => {
    const rootPath = await createTempDirectory();
    const nestedDirectoryPath = path.join(rootPath, 'b-folder');
    const filePath = path.join(rootPath, 'a-file.txt');

    await mkdir(nestedDirectoryPath);
    await writeFile(filePath, 'hello world');

    const result = await readDirectory(rootPath);

    expect(result.directoryPath).toBe(rootPath);
    expect(result.entryCount).toBe(2);
    expect(result.entries).toEqual([
      {
        modifiedAt: expect.any(String),
        name: 'b-folder',
        path: nestedDirectoryPath,
        sizeBytes: null,
        type: 'directory',
      },
      {
        modifiedAt: expect.any(String),
        name: 'a-file.txt',
        path: filePath,
        sizeBytes: 11,
        type: 'file',
      },
    ]);
  });

  test('throws a not found error for missing paths', async () => {
    const rootPath = await createTempDirectory();
    const missingPath = path.join(rootPath, 'missing');

    await expect(readDirectory(missingPath)).rejects.toThrow(
      `Directory not found: ${missingPath}`,
    );
  });

  test('throws a not a directory error for file paths', async () => {
    const rootPath = await createTempDirectory();
    const filePath = path.join(rootPath, 'file.txt');

    await writeFile(filePath, 'content');

    await expect(readDirectory(filePath)).rejects.toThrow(
      `Path is not a directory: ${filePath}`,
    );
  });

  test('resolves relative paths from the current working directory', async () => {
    const rootPath = await createTempDirectory();
    const relativeDirectoryName = 'relative-dir';
    const targetPath = path.join(rootPath, relativeDirectoryName);
    const previousCwd = process.cwd();

    await mkdir(targetPath);

    process.chdir(rootPath);

    try {
      const result = await readDirectory(relativeDirectoryName);

      expect(result.directoryPath).toBe(targetPath);
      expect(result.entryCount).toBe(0);
      expect(result.entries).toEqual([]);
    } finally {
      process.chdir(previousCwd);
    }
  });
});

async function createTempDirectory() {
  const directoryPath = await mkdtemp(path.join(tmpdir(), 'read-directory-'));
  tempDirectories.push(directoryPath);
  return directoryPath;
}
