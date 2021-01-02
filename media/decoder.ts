import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { Writable } from 'stream';
import VideoStream from './videoStream';
import { ConfigOptions } from './types';
import { EventEmitter } from 'events';

export default class Decoder extends EventEmitter {
  audioDecoder: ChildProcessWithoutNullStreams;
  audioDecodeFinished: boolean;
  audioStream: Writable;
  inputFile: string;
  options: ConfigOptions;
  stripHeader: boolean;
  videoDecoder: ChildProcessWithoutNullStreams;
  videoDecodeFinished: boolean;
  videoStream: Writable;

  constructor(
    inputFile: string,
    options: ConfigOptions,
    streams: {
      audioStream: Writable;
      videoStream: Writable;
    },
    stripHeader: boolean
  ) {
    super();
    this.inputFile = inputFile;

    this.stripHeader = stripHeader;
    
    this.options = options;

    this.audioStream = streams.audioStream;
    this.videoStream = streams.videoStream

    this.decodeAudio();
    this.decodeVideo();
  }

  decodeAudio(): void {
    const { audio } = this.options;

    this.audioDecodeFinished = false;
    this.audioDecoder = spawn('ffmpeg', [
      '-re', '-i', this.inputFile,
      '-loglevel', 'warning',
      '-vn',
      '-f', 's16le',
      '-c:a', 'pcm_s16le',
      '-ac', `${audio.channels}`,
      '-ar', `${audio.rate}`,
      'pipe:1'
    ]);
    this.audioDecoder.stderr.on('data', data => {
      console.log(`[audio] ${data}`);
    });

    // this.audioDecoder.stdout.pipe(this.audioStream);
    this.audioDecoder.stdout.on('data', data => {
      this.audioStream.write(data);
    });

    this.audioDecoder.on('close', (code) => {
      console.log(`[audio] process close all stdio with code ${code}`);
    });
    this.audioDecoder.on('exit', (code) => {
      console.log(`[audio] process exited with code ${code}`);
      this.audioDecodeFinished = true;
      if (this.videoDecodeFinished) {
        this.decodeFinished();
      }
    });
  }

  decodeVideo(): void {
    const { bug } = this.options;

    this.videoDecodeFinished = false;
    this.videoDecoder = spawn('ffmpeg', [
      '-re', '-i', this.inputFile,
      ...(bug ? ['-i', bug.image] : []),
      '-loglevel', 'warning',
      '-an',
      '-filter_complex', this.filter(),
      '-f', 'yuv4mpegpipe',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'rawvideo',
      'pipe:1'
    ]);
    this.videoDecoder.stderr.on('data', data => {
      console.log(`[video] ${data}`);
    });

    const transformedStream = new VideoStream(this.stripHeader);
    this.videoDecoder.stdout.pipe(transformedStream, { end: false });
    transformedStream.pipe(this.videoStream, { end: false });

    this.videoDecoder.on('close', (code) => {
      console.log(`[video] process close all stdio with code ${code}`);
    });
    this.videoDecoder.on('exit', (code) => {
      console.log(`[video] process exited with code ${code}`);
      this.videoDecodeFinished = true;
      if (this.audioDecodeFinished) {
        this.decodeFinished();
      }
    });
  }

  decodeFinished(): void {
    this.emit('finished');
  }

  filter(): string {
    const { video, bug } = this.options;
    const filterOpts = [
      `fps=fps=${video.fps}`,
      // scales video to fit inside desired box
      // we do this at the decode level, so that all video frames match when sources variate
      `scale=${video.width}:${video.height}:force_original_aspect_ratio=decrease:flags=bicubic,pad=${video.width}:${video.height}:(ow-iw)/2:(oh-ih)/2`
    ];
    // If we want the optional bug (logo in the corner)
    // TODO add gravity/align option (bottom-right, bottom-left, top-right, top-left)
    if (bug) {
      filterOpts.push(
        'setsar=1:1', // reset aspect for overlay
        `overlay=x=(${video.width}-overlay_w)-${bug.padding}:y=(${video.height}-overlay_h)-${bug.padding}`
      );
    }
    return filterOpts.join(',');
  }
  
}