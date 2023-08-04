import { ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

import type { BrowserWindow } from 'electron';

export class AppUpdater {
  constructor(private readonly mainWindow: BrowserWindow) {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.autoDownload = false;

    autoUpdater.on('update-available', (info) => {
      // had updates
    });

    autoUpdater.on('update-not-available', (info) => {
      console.log('update-not-available', info);
      // there are no updates
    });

    autoUpdater.on('download-progress', (progress) => {
      // download progress
      mainWindow?.webContents.send('download-progress', progress);
    });

    autoUpdater.on('update-downloaded', (evt) => {
      // update downloaded
      ipcMain.once('make-update-now', () => {
        autoUpdater.quitAndInstall();
      });
    });

    autoUpdater.on('error', (error) => {
      // update error
      mainWindow?.webContents.send('update-error', error);
    });

    // initial
    this.checkForUpdates();
    this.comfirmUpdate();
  }

  checkForUpdates() {
    ipcMain.handle('check-for-updates', async () => {
      const result = await autoUpdater.checkForUpdates();

      return result && result.updateInfo ? result?.updateInfo : result;
    });
  }

  comfirmUpdate() {
    ipcMain.handle('confirm-update', () => {
      return autoUpdater.downloadUpdate();
    });
  }
}