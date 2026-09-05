import { OTHER_SONGS_SLUG } from '../contants';
import { otherSongSchema } from '../schemas/otherSong';
import getOtherSongsIndex from './getOtherSongsIndex';
import getParsedData from './getParsedData';

const getOtherSong = async (slug: string) => {
  const songs = await getOtherSongsIndex();
  const song = songs.find((item) => item.slug === slug);

  if (!song) return null;

  const content = await getParsedData({
    filePath: `${OTHER_SONGS_SLUG}/${song.slug}.json`,
    schema: otherSongSchema,
  });

  return { content, indexItem: song };
};

export default getOtherSong;
