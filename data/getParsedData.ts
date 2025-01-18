import { readFile } from 'fs/promises';
import { ZodType } from 'zod';
import { joinDataPath } from './joinDataPath';

const getParsedData = async <T>({ filePath, schema }: { filePath: string; schema: ZodType<T> }) => {
  const file = await readFile(joinDataPath(filePath));

  return schema.parse(JSON.parse(file.toString()));
};

export default getParsedData;
