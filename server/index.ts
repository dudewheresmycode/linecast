import express from 'express';
import { STREAM_DATA_DIR } from '../constants';

const PORT = process.env.PORT || 3130;

export default (): Promise<void> => {

  const app = express();

  app.use('/stream', express.static(STREAM_DATA_DIR));

  return new Promise(resolve => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      resolve();
    });
  });
}
