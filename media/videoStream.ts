import { Transform } from 'stream';

/*
Note:

Used tips from this mmcat rawvideo concat example:
https://trac.ffmpeg.org/wiki/mmcat

TLDR; YUV4MPEG2 video has a single line header sent with the first frame.
To concat multiple files into one stream we need the headers for the initial file,
but strip them for additional decodes.

Another option could be to fake the header when first starting the transcode.
Would just send the following header followed by a new line (adjusting values as needed):

YUV4MPEG2 W854 H480 F24:1 Ip A1:1 C420jpeg XYSCSS=420JPEG

*/

export default class VideoStream extends Transform {
  found: boolean;
  stripHeader: boolean;

  constructor(stripHeader: boolean) {
    super();
    this.stripHeader = stripHeader || false;
    this.found = false;
  }

  _transform(
    chunk: string | Buffer,
    encoding: string,
    callback: (error: Error, data: string | Buffer) => void
  ): void {
    if (this.stripHeader && !this.found) {
      const index = chunk.indexOf('\n');
      if (index > -1) {
        this.found = true;
        // trim header
        chunk = chunk.slice(index + 1);
      } else {
        // skip bytes until we get a new line
        chunk = Buffer.alloc(0);
      }
    }
    callback(null, chunk);
  }

  _flush(callback: () => void): void {
    callback();
  }

}
