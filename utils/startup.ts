import makeDir from 'make-dir';
import { STREAM_DATA_DIR } from '../constants';

export default async function startup(): Promise<void> {
  await makeDir(STREAM_DATA_DIR);
}