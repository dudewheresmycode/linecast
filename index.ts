import server from './server';
import startup from './utils/startup';
import config from './utils/config';
import Playback from './media/playback';

const playlist = [
  '/Users/brian/Movies/PublicDomain/test_pattern.mkv',
  '/Users/brian/Movies/PublicDomain/MEDIC_Dr_Impossible_512kb.mp4',
  '/Users/brian/Movies/PublicDomain/Bonanza_-_The_Spitfire_512kb.mp4'
];

(async () => {
  try {

    await startup();
    const settings = config().value();
    console.log(settings);
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const player = new Playback(playlist, settings);

    await server();
  
  } catch (error) {
    console.log(error);
  }

})();
