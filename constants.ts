import path from 'path';
import appDataDir from './utils/appDataDir';

// Declared first so we can use it in other definitions
export const APP_NAME = 'Moox';

export const APP_DATA_DIR = path.join(appDataDir(), APP_NAME);

export const STREAM_DATA_DIR = path.join(appDataDir(), APP_NAME, 'stream');

export const SETTINGS_FILE = path.join(APP_DATA_DIR, 'settings.json');