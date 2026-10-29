# Local Mobile Development Guide

This guide describes how to run and test the LPU Events native mobile app on a physical phone using Expo Go.

## Prerequisites

- **Physical Device:** Android or iOS smartphone with **Expo Go** installed from Google Play Store or Apple App Store.
- **Node.js:** Node.js v20+ or v22 LTS (current environment: `v22.23.4`).
- **Network:** Development computer and phone should be on the same local Wi-Fi network. (If LAN connection is blocked, `--tunnel` mode can be used).
- **No Android Studio / Xcode required:** Local native build tools (Android Studio, SDKs, Emulators, Xcode) are expressly NOT required for the Expo Go workflow.

## Quick Start

From the workspace root, navigate directly into `lpu-events-app/`:

```bash
cd lpu-events-app
npx expo start
```

### Options

1. **Scan QR Code:**
   - On Android: Open the **Expo Go** app and tap "Scan QR code", then scan the terminal QR code.
   - On iOS: Open the native Camera app, point it at the QR code, and tap the Expo Go prompt.
2. **Tunnel Mode (if Wi-Fi blocks LAN discovery):**
   ```bash
   npx expo start --tunnel
   ```
3. **Clear Metro Cache:**
   ```bash
   npx expo start -c
   ```

## Development Commands (Run inside `lpu-events-app/`)

| Command | Description |
|---|---|
| `npm run start` / `npx expo start` | Start the Expo Metro development server |
| `npm run typecheck` / `npx tsc --noEmit` | Run TypeScript type checking |
| `npx expo-doctor` | Validate Expo dependencies and configuration health |
| `npm run android` | Open dev server targeted for Android |
| `npm run ios` | Open dev server targeted for iOS |
| `npm run web` | Open web preview in browser |

## Troubleshooting

- **Version Mismatch:** Ensure the Expo SDK in `package.json` matches the Expo Go app version installed on your device.
- **Cannot connect to Metro server:**
  - Verify computer and phone are connected to the exact same Wi-Fi SSID.
  - Run with `--tunnel` (`npx expo start --tunnel`) to establish a Cloudflare tunnel.
