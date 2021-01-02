
export default function appDataDir() {
  // windows
  if (process.env.APPDATA) {
    return process.env.APPDATA;
  }
  // mac
  if (process.platform == 'darwin') {
    return `${process.env.HOME}/Library/Application Support`;
  }
  // linux
  return `${process.env.HOME}/.config`
}