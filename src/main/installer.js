import { execSync, spawn } from 'child_process'
import os from 'os'

// Electron apps don't inherit the user's shell PATH.
// Prepend all common locations for package managers so child processes can find them.
const EXTRA_PATHS = [
  '/opt/homebrew/bin',   // macOS Apple Silicon
  '/opt/homebrew/sbin',
  '/usr/local/bin',      // macOS Intel / Linux
  '/usr/local/sbin',
  '/usr/bin',
  '/bin',
  '/usr/sbin',
  '/sbin',
]

function buildEnv(extra = {}) {
  const pathParts = [...EXTRA_PATHS, ...(process.env.PATH || '').split(':')]
  // deduplicate while preserving order
  const seen = new Set()
  const PATH = pathParts.filter(p => p && !seen.has(p) && seen.add(p)).join(':')
  return { ...process.env, PATH, HOMEBREW_NO_AUTO_UPDATE: '1', ...extra }
}

function execSyncSafe(cmd) {
  return execSync(cmd, { env: buildEnv(), stdio: 'pipe' }).toString().trim()
}

export function detectSystem() {
  const platform = os.platform() // 'darwin', 'win32', 'linux'
  const arch = os.arch()
  let distro = null

  if (platform === 'linux') {
    try {
      const release = execSyncSafe('cat /etc/os-release')
      if (release.includes('Ubuntu') || release.includes('Debian')) distro = 'debian'
      else if (release.includes('Fedora') || release.includes('CentOS') || release.includes('Red Hat')) distro = 'fedora'
      else if (release.includes('Arch')) distro = 'arch'
      else distro = 'debian' // fallback
    } catch { distro = 'debian' }
  }

  return { platform, arch, distro }
}

export function detectPackageManager(platform) {
  const check = (cmd) => {
    try { execSync(cmd, { env: buildEnv(), stdio: 'ignore' }); return true } catch { return false }
  }

  if (platform === 'darwin') {
    if (check('which brew')) return 'homebrew'
    if (check('which port')) return 'macports'
    return null
  }
  if (platform === 'win32') {
    if (check('winget --version')) return 'winget'
    if (check('choco --version')) return 'choco'
    return null
  }
  if (platform === 'linux') {
    if (check('which apt-get')) return 'apt'
    if (check('which dnf')) return 'dnf'
    if (check('which yum')) return 'yum'
    if (check('which pacman')) return 'pacman'
    return null
  }
  return null
}

export function detectTesseract() {
  try {
    const output = execSyncSafe('tesseract --version 2>&1')
    const match = output.match(/tesseract\s+([\d.]+)/i)
    const version = match ? match[1] : 'unknown'
    // Get installed languages
    let languages = []
    try {
      const langsOutput = execSyncSafe('tesseract --list-langs 2>&1')
      languages = langsOutput.split('\n').slice(1).map(l => l.trim()).filter(Boolean)
    } catch {}
    return { installed: true, version, languages }
  } catch {
    return { installed: false, version: null, languages: [] }
  }
}

export function getInstallCommands(platform, packageManager, selectedLanguages, distro) {
  const langCodes = selectedLanguages.filter(l => l !== 'eng') // eng is usually included

  if (platform === 'darwin') {
    if (packageManager === 'homebrew') {
      const cmds = ['brew install tesseract']
      if (langCodes.length > 0) cmds.push('brew install tesseract-lang')
      return cmds
    }
    return ['echo "Please install Homebrew first: /bin/bash -c \\"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\\"" && exit 1']
  }

  if (platform === 'win32') {
    if (packageManager === 'winget') return ['winget install UB-Mannheim.TesseractOCR --accept-package-agreements --accept-source-agreements']
    if (packageManager === 'choco') return ['choco install tesseract -y']
    return ['echo "Please install Tesseract manually from https://github.com/UB-Mannheim/tesseract/wiki"']
  }

  if (platform === 'linux') {
    if (packageManager === 'apt') {
      const pkgs = ['tesseract-ocr', ...langCodes.map(l => `tesseract-ocr-${l}`)]
      return [`sudo apt-get update && sudo apt-get install -y ${pkgs.join(' ')}`]
    }
    if (packageManager === 'dnf' || packageManager === 'yum') {
      const pm = packageManager
      const pkgs = ['tesseract', ...langCodes.map(l => `tesseract-langpack-${l}`)]
      return [`sudo ${pm} install -y ${pkgs.join(' ')}`]
    }
    if (packageManager === 'pacman') {
      return ['sudo pacman -Sy --noconfirm tesseract tesseract-data-eng ' + langCodes.map(l => `tesseract-data-${l}`).join(' ')]
    }
  }

  return ['echo "Unsupported platform"']
}

export function runInstallCommand(commands, onData) {
  return new Promise((resolve, reject) => {
    const fullCommand = commands.join(' && ')
    const env = buildEnv()
    // Use login shell so ~/.zprofile / /etc/profile are sourced (picks up Homebrew on macOS)
    const proc = spawn('/bin/bash', ['-l', '-c', fullCommand], { env })

    proc.stdout.on('data', (data) => onData(data.toString(), 'stdout'))
    proc.stderr.on('data', (data) => onData(data.toString(), 'stderr'))

    proc.on('close', (code) => {
      resolve({ exitCode: code })
    })
    proc.on('error', (err) => resolve({ exitCode: -1, spawnError: err.message }))
  })
}
