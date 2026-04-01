# OCR Converter

A desktop application for converting PDFs and images into editable documents using [Tesseract OCR](https://github.com/tesseract-ocr/tesseract). Built with Electron, React, and Tailwind CSS.

## Features

- **Apple-like onboarding** — detects your OS, installs Tesseract (and Homebrew if needed), all within the app
- **100+ languages** — select language packs during setup; English always included
- **Three output formats** — Word Document (`.docx`), searchable PDF, and plain text
- **Drag & drop** — drop PDFs or images directly onto the app
- **Batch processing** — queue multiple files, convert them all at once
- **Privacy first** — everything runs locally; no files leave your machine

## Supported platforms

| Platform | Package manager used |
|---|---|
| macOS | Homebrew (auto-installed if missing) |
| Windows | WinGet or Chocolatey |
| Linux | APT, DNF, YUM, or Pacman |

## Screenshots

> Onboarding → System Check → Language Selection → Install → Converter

## Prerequisites

- **Node.js** 18 or later
- **npm** 9 or later
- A supported package manager (see table above) — the app will offer to install Homebrew on macOS if it is missing

Tesseract itself does **not** need to be pre-installed; the onboarding wizard handles it.

## Development

```bash
# Install dependencies
npm install

# Start in development mode (hot reload)
npm run dev
```

## Building

```bash
# Compile to ./out (main + renderer)
npm run build

# Package into a distributable (uses electron-builder)
npm run dist
```

The packaged app is written to `dist/`.

## Project structure

```
src/
├── main/
│   ├── index.js        # Electron main process, window setup
│   ├── ipc.js          # All IPC handlers
│   ├── installer.js    # OS detection, package manager detection, Tesseract install
│   └── converter.js    # PDF → image → Tesseract → DOCX/PDF/TXT pipeline
├── preload/
│   └── index.js        # contextBridge API surface exposed to renderer
└── renderer/
    └── src/
        ├── App.jsx
        ├── stores/
        │   └── useAppStore.js        # Zustand global state
        └── components/
            ├── onboarding/           # 5-step installer wizard
            │   ├── OnboardingFlow.jsx
            │   ├── WelcomeStep.jsx
            │   ├── SystemCheckStep.jsx
            │   ├── LanguagesStep.jsx
            │   ├── InstallStep.jsx
            │   └── CompleteStep.jsx
            ├── converter/            # Main app UI
            │   ├── ConverterView.jsx
            │   ├── DropZone.jsx
            │   └── ConversionProgress.jsx
            └── ui/                   # Shared primitives
                ├── Button.jsx
                ├── ProgressBar.jsx
                ├── Terminal.jsx
                └── StepSidebar.jsx
```

## Tech stack

| Layer | Library |
|---|---|
| Framework | [Electron](https://www.electronjs.org/) 31 |
| Build | [electron-vite](https://electron-vite.org/) 2 |
| UI | [React](https://react.dev/) 18 |
| Styling | [Tailwind CSS](https://tailwindcss.com/) 3 |
| Animation | [Framer Motion](https://www.framer.com/motion/) 11 |
| State | [Zustand](https://zustand-demo.pmnd.rs/) 5 |
| PDF rendering | [pdf.js](https://mozilla.github.io/pdf.js/) 4 |
| DOCX output | [docx](https://docx.js.org/) 8 |
| Persistence | [electron-store](https://github.com/sindresorhus/electron-store) 8 |

## How conversion works

1. PDF pages are rendered to PNG canvases in the renderer using `pdfjs-dist`
2. Each canvas is exported as a base64 PNG and sent to the main process via IPC
3. The main process writes the images to a temp directory and creates an image-list file
4. Tesseract CLI processes the list (`tesseract pages.txt output -l eng+fra …`)
5. For DOCX output, the plain-text result is wrapped into a `.docx` file via the `docx` library
6. Temp files are cleaned up; the output path is returned to the renderer

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/)
4. Open a pull request

## License

MIT — see [LICENSE](LICENSE)
