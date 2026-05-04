# Sound Alert Files

This directory contains audio files for proctoring violations:

- **info.mp3** - Soft notification sound for INFO level violations (0 strikes)
- **warning.mp3** - Alert sound for WARNING level violations (1 strike)
- **critical.mp3** - Urgent alarm for CRITICAL/TERMINAL violations (2+ strikes)

## Audio Specifications:

- Format: MP3
- Duration: 1-2 seconds
- Volume: Normalized to -6dB
- Sample Rate: 44.1kHz

## Usage:

These files are loaded by the `useAudioAlert` hook in `ProctoringWarning.js`.

## Note:

Currently using placeholder files. Replace with actual audio files for production.

You can generate these sounds using:

- Online tools: https://www.zapsplat.com/
- Or use text-to-speech: https://ttsmaker.com/
