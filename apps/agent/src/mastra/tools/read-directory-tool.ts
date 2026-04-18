import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const readDirectoryEntrySchema = z.object({
  name: z.string(),
  path: z.string(),
  type: z.enum(['file', 'directory', 'other']),
  sizeBytes: z.number().nullable(),
  modifiedAt: z.string(),
});

const readDirectoryResultSchema = z.object({
  directoryPath: z.string(),
  entryCount: z.number(),
  entries: z.array(readDirectoryEntrySchema),
});

type ReadDirectoryResult = z.infer<typeof readDirectoryResultSchema>;

export const readDirectoryTool = createTool({
  id: 'read-directory',
  description:
    'Read the direct contents of a directory and return basic metadata for each entry.',
  inputSchema: z.object({
    path: z.string().describe('Absolute or relative path to a directory'),
  }),
  outputSchema: readDirectoryResultSchema,
  execute: async (inputData) => {
    return readDirectory(inputData.path);
  },
});

export async function readDirectory(
  directoryPath: string,
): Promise<ReadDirectoryResult> {
  const resolvedPath = path.resolve(directoryPath);

  const directoryStats = await getStatsForPath(resolvedPath);

  if (!directoryStats.isDirectory()) {
    throw new Error(`Path is not a directory: ${resolvedPath}`);
  }

  let directoryEntries: string[];

  try {
    directoryEntries = await readdir(resolvedPath);
  } catch (error) {
    throw wrapAccessError(error, resolvedPath);
  }

  const entries = await Promise.all(
    directoryEntries.map(async (entryName) => {
      const entryPath = path.join(resolvedPath, entryName);
      const entryStats = await getStatsForPath(entryPath);

      return {
        name: entryName,
        path: entryPath,
        type: getEntryType(entryStats),
        sizeBytes: entryStats.isFile() ? entryStats.size : null,
        modifiedAt: entryStats.mtime.toISOString(),
      };
    }),
  );

  entries.sort((left, right) => {
    const typeRank = getTypeRank(left.type) - getTypeRank(right.type);
    if (typeRank !== 0) {
      return typeRank;
    }

    return left.name.localeCompare(right.name);
  });

  return {
    directoryPath: resolvedPath,
    entryCount: entries.length,
    entries,
  };
}

async function getStatsForPath(targetPath: string) {
  try {
    return await stat(targetPath);
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === 'ENOENT') {
      throw new Error(`Directory not found: ${targetPath}`);
    }

    throw wrapAccessError(error, targetPath);
  }
}

function wrapAccessError(error: unknown, targetPath: string) {
  const nodeError = error as NodeJS.ErrnoException;

  if (nodeError.code === 'EACCES' || nodeError.code === 'EPERM') {
    return new Error(`Permission denied accessing path: ${targetPath}`);
  }

  return new Error(`Unable to access path: ${targetPath}`);
}

function getEntryType(entryStats: Awaited<ReturnType<typeof stat>>) {
  if (entryStats.isDirectory()) {
    return 'directory' as const;
  }

  if (entryStats.isFile()) {
    return 'file' as const;
  }

  return 'other' as const;
}

function getTypeRank(
  entryType: ReadDirectoryResult['entries'][number]['type'],
) {
  switch (entryType) {
    case 'directory':
      return 0;
    case 'file':
      return 1;
    default:
      return 2;
  }
}
