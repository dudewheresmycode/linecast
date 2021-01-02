import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { Writable } from 'stream';
import { ConfigOptions } from './types';

export default class Transcoder {
  audioStream: Writable;
  masterPlaylist: string;
  options: ConfigOptions;
  stream: ChildProcessWithoutNullStreams;
  videoStream: Writable;
  
  constructor(options: ConfigOptions) {
    this.options = options;
    this.masterPlaylist = `${process.env.MOOX_STREAM_DATA}/channel.m3u8`;
    this.start();
  }
  start(): void {

    this.stream = spawn('ffmpeg', [
      // video input
      '-f', 'yuv4mpegpipe',
      '-vcodec', 'rawvideo',
      // '-thread_queue_size', '32',
      '-i', 'pipe:0',

      // audio input
      '-f', 's16le',
      '-acodec', 'pcm_s16le',
      // '-ac', `${this.options.audio.channels}`,
      '-ar', `${this.options.audio.rate}`,
      '-thread_queue_size', '64',
      '-i', 'pipe:3',

      '-loglevel', 'warning',

      // video settings
      '-c:v', 'libx264',
      '-strict', 'experimental',
      '-pix_fmt', 'yuv420p',
      '-tune', 'zerolatency',
      '-preset', this.options.video.profile,
      '-crf', `${this.options.video.crf}`,
      '-maxrate', `${this.options.video.bitrate}`,
      '-bufsize', `${this.options.video.bitrate * 2}`,
      '-g', `${this.options.video.fps * this.options.segment.duration}`,
      '-r', `${this.options.video.fps}`,
      
      // audio settings
      '-c:a', 'aac',
      // '-ac', `${this.options.audio.channels}`,
      '-ar', `${this.options.audio.rate}`,
      '-b:a', `${this.options.audio.bitrate}`,

      // HLS settings
      '-f', 'hls',
      '-hls_segment_type', 'fmp4',
      '-hls_list_size', `${this.options.segment.wrap}`,
      '-hls_flags', 'delete_segments+program_date_time',
      '-hls_time', `${this.options.segment.duration}`,

      // output file
      this.masterPlaylist

    ], { stdio: ['pipe', 'pipe', 'pipe', 'pipe']});

    this.videoStream = this.stream.stdin;
    this.audioStream = this.stream.stdio[3] as Writable;
    
    this.stream.stderr.on('data', data => {
      console.log(`[transcoder] ${data}`);
    });
    
    this.stream.on('close', (code) => {
      console.log(`[transcoder] process close all stdio with code ${code}`);
    });

    this.stream.on('exit', (code) => {
      console.log(`[transcoder] process exited with code ${code}`);
    });
    
  }

  stop(): void {
    if (this.videoStream) {
      this.videoStream.end();
    }
    if (this.audioStream) {
      this.audioStream.end();
    }
    if (this.stream) {
      this.stream.kill();
    }
  }

}

