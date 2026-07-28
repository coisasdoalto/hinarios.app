import { readFile } from 'fs/promises';
import { ZodType, ZodTypeDef } from 'zod';
import { joinDataPath } from './joinDataPath';

const getParsedData = async <T>({
  filePath,
  schema,
}: {
  filePath: string;
  schema: ZodType<T, ZodTypeDef, unknown>;
}) => {
  const file = await readFile(joinDataPath(filePath));

  return schema.parse(JSON.parse(file.toString()));
};

export default getParsedData;
