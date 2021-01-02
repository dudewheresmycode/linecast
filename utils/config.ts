import low, { LowdbSync } from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { ConfigOptions } from '../media/types';
import { SETTINGS_FILE } from '../constants';

const adapter = new FileSync(SETTINGS_FILE);
const db = low(adapter)

export default function config(): LowdbSync<ConfigOptions> {

  db.defaults({
    audio: {
      channels: 2,
      rate: 44100,
      bitrate: 96000
    },
    bug: {
      padding: 30,
      image: './static/moox_60x60_8bit.png'
    },
    segment: {
      duration: 3,
      wrap: 5
    },
    video: {
      fps: 24,
      width: 854,
      height: 480,
      bitrate: 768000, // 768k
      profile: 'ultrafast',
      crf: 18
    }  
  }).write();
  
  return db;
}

