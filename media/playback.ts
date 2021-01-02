import Decoder from './decoder';
import Transcoder from './transcoder';

import { ConfigOptions } from './types';

export default class Playback {
  current: {
    index: number;
    item: string;
  };  
  decode: Decoder;
  playlist: string[];
  settings: ConfigOptions;
  transcode: Transcoder;
  
  constructor(playlist: string[], settings: ConfigOptions) {
    this.playlist = playlist;
    this.settings = settings;

    // create single transcoder instance on channel start
    this.transcode = new Transcoder(this.settings);
    // create a new decoder for each subsequent playback
    this.current = {
      index: 0,
      item: this.playlist[0]
    };
    this.startDecode(false);
  }
  startDecode(stripHeader: boolean): void {
    const { audioStream, videoStream } = this.transcode;
    this.decode = new Decoder(
      this.current.item,
      this.settings,
      { videoStream, audioStream },
      stripHeader
    );
    this.decode.once('finished', this.playNext.bind(this));
  }
  playNext(): void {
    console.log('\n\n ---- \n\n');
    console.log('PLAYBACK FINISH');
    console.log('\n\n ---- \n\n');
    if (this.current.index+1 < this.playlist.length) {
      this.current.index++;
      this.current.item = this.playlist[this.current.index];
      this.startDecode(true);
    } else {
      console.log('stream finished');
      // if loop start back at 0
      // if not loop end transcode process
      this.transcode.stop();
    }
  }
}