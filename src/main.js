const { app, BrowserWindow, ipcMain, Menu, Tray, dialog, shell } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow;
let tray;

const isAdmin = () => {
  try {
    require('child_process').execSync('net session', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 600,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: process.env.NODE_ENV === 'development',
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
    titleBarStyle: 'default',
    show: false,
    autoHideMenuBar: true,
    resizable: true,
    maximizable: true,
    minimizable: true,
    closable: true
  });

  mainWindow.loadFile('src/index.html');

  // Production optimizations
  if (process.env.NODE_ENV !== 'development') {
    mainWindow.setMenuBarVisibility(false);
    mainWindow.setMenu(null);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();

    if (!isAdmin()) {
      dialog.showMessageBox(mainWindow, {
        type: 'warning',
        title: 'Administrator Rights Required',
        message: 'CrtyXSpeed requires administrator privileges to modify network settings. Please restart the application as administrator.',
        buttons: ['OK']
      });
    }
  });

  // Prevent DevTools from being opened
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.control && input.shift && input.key.toLowerCase() === 'i') {
      event.preventDefault();
    }
    if (input.key === 'F12') {
      event.preventDefault();
    }
  });

  mainWindow.on('minimize', (event) => {
    if (store.get('minimizeToTray', true)) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const createTray = () => {
  tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'));

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show CrtyXSpeed',
      click: () => {
        mainWindow.show();
        mainWindow.focus();
      }
    },
    { type: 'separator' },
    {
      label: 'Quick Optimize',
      click: () => executeOptimization()
    },
    {
      label: 'Quick Revert',
      click: () => executeRevert()
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
  tray.setToolTip('CrtyXSpeed - Network Optimizer');

  tray.on('double-click', () => {
    mainWindow.show();
    mainWindow.focus();
  });
};

const executeNetshCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, { shell: true }, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr });
      } else {
        resolve(stdout);
      }
    });
  });
};

const executeOptimization = async () => {
  const commands = [
    'netsh int tcp set global rss=enabled',
    'netsh int tcp set global autotuninglevel=restricted',
    'netsh int tcp set global ecncapability=disabled',
    'netsh int tcp set global timestamps=disabled',
    'netsh int tcp set global rsc=disabled'
  ];

  try {
    for (const command of commands) {
      await executeNetshCommand(command);
    }

    const output = await executeNetshCommand('netsh int tcp show global');
    store.set('lastState', 'optimized');

    if (mainWindow) {
      mainWindow.webContents.send('optimization-complete', {
        success: true,
        output: output,
        message: 'Network optimization applied successfully!'
      });
    }

    return { success: true, output };
  } catch (error) {
    if (mainWindow) {
      mainWindow.webContents.send('optimization-complete', {
        success: false,
        error: error.error || error.message,
        message: 'Failed to apply network optimization. Make sure you\'re running as administrator.'
      });
    }
    return { success: false, error };
  }
};

const executeRevert = async () => {
  const commands = [
    'netsh int tcp set global rss=enabled',
    'netsh int tcp set global autotuninglevel=normal',
    'netsh int tcp set global ecncapability=disabled',
    'netsh int tcp set global timestamps=enabled',
    'netsh int tcp set global rsc=enabled'
  ];

  try {
    for (const command of commands) {
      await executeNetshCommand(command);
    }

    const output = await executeNetshCommand('netsh int tcp show global');
    store.set('lastState', 'default');

    if (mainWindow) {
      mainWindow.webContents.send('revert-complete', {
        success: true,
        output: output,
        message: 'Network settings reverted to defaults successfully!'
      });
    }

    return { success: true, output };
  } catch (error) {
    if (mainWindow) {
      mainWindow.webContents.send('revert-complete', {
        success: false,
        error: error.error || error.message,
        message: 'Failed to revert network settings. Make sure you\'re running as administrator.'
      });
    }
    return { success: false, error };
  }
};

// IPC handlers
ipcMain.handle('optimize-network', executeOptimization);
ipcMain.handle('revert-network', executeRevert);
ipcMain.handle('get-current-settings', async () => {
  try {
    const output = await executeNetshCommand('netsh int tcp show global');
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.error || error.message };
  }
});
ipcMain.handle('get-stored-data', (event, key) => store.get(key));
ipcMain.handle('set-stored-data', (event, key, value) => store.set(key, value));
ipcMain.handle('is-admin', () => isAdmin());

app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (tray) {
    tray.destroy();
  }
});