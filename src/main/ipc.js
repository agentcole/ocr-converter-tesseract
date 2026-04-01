import { ipcMain, dialog, shell } from 'electron'
import { detectSystem, detectPackageManager, detectTesseract, getInstallCommands, runInstallCommand } from './installer.js'
import { convertImages } from './converter.js'

export function setupIPC(mainWindow, store) {
  // System detection
  ipcMain.handle('system:detect', () => {
    const { platform, arch, distro } = detectSystem()
    const packageManager = detectPackageManager(platform)
    const tesseract = detectTesseract()
    return { platform, arch, distro, packageManager, tesseract }
  })

  // Re-check tesseract
  ipcMain.handle('tesseract:check', () => {
    return detectTesseract()
  })

  // Install the package manager itself (e.g. Homebrew on macOS)
  ipcMain.handle('install:bootstrap', async (event, { platform }) => {
    let command
    if (platform === 'darwin') {
      command = '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"'
    } else if (platform === 'win32') {
      // winget ships with Windows 10/11 — guide user to App Installer instead
      command = 'echo "Open the Microsoft Store and install App Installer to get WinGet." && exit 1'
    } else {
      return { success: false, error: 'No bootstrap needed on Linux — use your system package manager.' }
    }

    const { exitCode, spawnError } = await runInstallCommand([command], (data, type) => {
      event.sender.send('install:output', { data, type })
    })

    if (spawnError) return { success: false, error: spawnError }

    // Re-detect package manager after install
    const { platform: p } = detectSystem()
    const pm = detectPackageManager(p)
    if (pm) return { success: true, packageManager: pm }

    // Homebrew on Apple Silicon adds to /opt/homebrew/bin but needs shell restart.
    // Treat exit 0 as success even if `which brew` still fails in this process.
    if (exitCode === 0) return { success: true, packageManager: 'homebrew' }
    return { success: false, error: `Bootstrap exited with code ${exitCode}.` }
  })

  // Get install commands preview
  ipcMain.handle('install:getCommands', (_, { platform, packageManager, languages, distro }) => {
    return getInstallCommands(platform, packageManager, languages, distro)
  })

  // Run installation
  ipcMain.handle('install:run', async (event, { platform, packageManager, languages, distro }) => {
    const commands = getInstallCommands(platform, packageManager, languages, distro)
    const { exitCode, spawnError } = await runInstallCommand(commands, (data, type) => {
      event.sender.send('install:output', { data, type })
    })

    // Ground-truth check: is tesseract actually available now?
    const tesseract = detectTesseract()
    if (tesseract.installed) {
      return { success: true }
    }

    // Tesseract not found — surface a useful error
    if (spawnError) return { success: false, error: `Could not launch installer: ${spawnError}` }
    return { success: false, error: `Installer exited with code ${exitCode}. Check the terminal output above for details.` }
  })

  // Convert files
  ipcMain.handle('convert:files', async (event, { imageDataUrls, outputFormat, outputDir, baseName, languages }) => {
    try {
      const result = await convertImages(imageDataUrls, outputFormat, outputDir, baseName, languages)
      return result
    } catch (err) {
      return { success: false, error: err.message }
    }
  })

  // Open file dialog
  ipcMain.handle('dialog:openFile', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      filters: [
        { name: 'Documents & Images', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'tiff', 'bmp', 'gif'] }
      ],
      properties: ['openFile', 'multiSelections']
    })
    return result
  })

  // Open output directory dialog
  ipcMain.handle('dialog:openDir', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory']
    })
    return result
  })

  // Save to specific path
  ipcMain.handle('dialog:saveFile', async (_, { defaultName, extension }) => {
    const result = await dialog.showSaveDialog(mainWindow, {
      defaultPath: defaultName,
      filters: [{ name: extension.toUpperCase(), extensions: [extension] }]
    })
    return result
  })

  // Open file in system
  ipcMain.handle('shell:openPath', async (_, filePath) => {
    await shell.openPath(filePath)
  })

  // Store operations
  ipcMain.handle('store:get', (_, key) => store.get(key))
  ipcMain.handle('store:set', (_, key, value) => store.set(key, value))
  ipcMain.handle('store:delete', (_, key) => store.delete(key))

  // Window resize for post-onboarding
  ipcMain.handle('window:resize', (_, { width, height, resizable }) => {
    mainWindow.setSize(width, height, true)
    mainWindow.setResizable(resizable)
    mainWindow.center()
  })
}
