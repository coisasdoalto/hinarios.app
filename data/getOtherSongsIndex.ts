import { OTHER_SONGS_SLUG } from '../contants';
import { otherSongsIndexSchema } from '../schemas/otherSongsIndex';
import getParsedData from './getParsedData';

const getOtherSongsIndex = () =>
  getParsedData({
    filePath: `${OTHER_SONGS_SLUG}/index.json`,
    schema: otherSongsIndexSchema,
  });

export default getOtherSongsIndex;
