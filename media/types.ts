export interface ConfigOptions {
  audio: {
    bitrate: number;
    channels: number;
    rate: 44100 | 48000;
  },
  bug?: {
    padding?: number;
    image: string;
  },
  segment: {
    duration: number;
    wrap: number;
  },
  video: {
    bitrate: number;
    crf: number;
    fps: number;
    height: number;
    profile: string;
    width: number;
  }
}