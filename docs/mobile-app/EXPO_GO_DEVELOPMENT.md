# Expo Go Development Workflow (No Android Studio)

## Constraint

This project is Android-only. Do not perform iOS builds, iOS simulator testing, TestFlight work, or other iOS-specific implementation.

The development loop must work on a physical phone using Expo Go and the project's Metro server. Do not require Android Studio, Android Emulator, Android SDK installation, or local Gradle builds.

## Compatibility check must happen immediately before setup

Expo SDK and Expo Go compatibility changes over time. Check these official pages at the time of Task 01:

- Create Expo app: https://docs.expo.dev/more/create-expo/
- Expo Router: https://docs.expo.dev/router/introduction/
- Expo Go version mismatch: https://docs.expo.dev/troubleshooting/expo-go-version-mismatch/
- Splash Screen: https://docs.expo.dev/versions/latest/sdk/splash-screen/
- Expo Image: https://docs.expo.dev/versions/latest/sdk/image/

On 2026-10-29, the fetched Expo Router/create-expo-app documentation described an SDK 58 transition: the default no-template command creates SDK 57 during the transition and recommends SDK 57 for physical-device Expo Go, while the explicit default SDK 58 template is for a different setup path. Treat this as a date-stamped observation, not a permanent rule; check the current Expo Go app available on the target phone and current docs before selecting a template.

## Setup expectations

- Use the supported `create-expo-app` template and the SDK supported by Android Expo Go on the actual phone.
- Use `npx expo install <package>` for Expo-native dependencies so compatible versions are selected.
- If using Expo Router, keep route files under the app directory and test Android back navigation.
- Run `npx expo start` from `lpu-events-app/`.
- Connect computer and phone to the same Wi-Fi and scan the Metro QR code with Expo Go.
- If LAN connectivity blocks the app, use `npx expo start --tunnel --go --clear`; do not immediately add networking libraries or modify router/firewall configuration.
- Confirm the physical phone can reach public API endpoints and dynamic image URLs.
- Do not run `expo run:android`, Gradle, Android Studio, or emulator-specific commands as part of the normal workflow.

## Package isolation

Keep `lpu-events-app/package.json` and one matching lockfile inside the app folder. Do not install Expo, React Native packages, or native-specific versions into the student website package. The app is a standalone sibling project, not a nested package inside the website repository.

## Basic validation commands

Use only commands supported by the current Expo CLI/template and confirm them before relying on them. Typical checks include:

```bash
npx expo start
npx expo-doctor
npx tsc --noEmit
```

A command may not be configured until the app's TypeScript setup is complete. Document that honestly. Keep `npx expo start` running on the developer machine while the app is being tested in Expo Go.

## Development vs release

Expo Go validates the app inside Expo Go, not all standalone-app behaviours. Any future EAS build/release task must be a separate, user-authorized stage. Do not claim a store-ready app based only on Expo Go.
