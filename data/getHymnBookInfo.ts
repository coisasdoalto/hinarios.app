import { hymnBookInfoSchema, resolveHymnBookDisplayName } from '../schemas/hymnBookInfo';
import getParsedData from './getParsedData';

const getHymnBookInfo = async (hymnBook: string) => {
  const hymnBookInfo = await getParsedData({
    filePath: `${hymnBook}/hymnBookInfo.json`,
    schema: hymnBookInfoSchema,
  });

  return resolveHymnBookDisplayName(hymnBookInfo);
};

export default getHymnBookInfo;
