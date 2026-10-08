# Moonloom

**A Personal AI Sleep Experiment Coach with an Intelligent Virtual Companion.**

Moonloom learns relationships between sleep, lifestyle, work, behavior, morning feeling, and daytime energy to help users discover personal patterns safely.

## Phase 1 MVP Application
The local GitHub checkout includes the work-break reminder update. See [LOCAL-UPDATES.md](LOCAL-UPDATES.md) for implemented behavior, tests, privacy differences, and the interactive mobile preview commands.
This repository implements the Moonloom mobile application using React Native and Expo. It contains the visual interface, offline persistence architecture, and state management required for Phase 1 features.

### Features Implemented:
- **Core UI Structure**: Bottom Tab Navigation with Home, Coach (Placeholder), and Insights (Placeholder) screens utilizing a celestial color palette.
- **Data Models & Persistence**: Implemented `Zustand` with `AsyncStorage` to persist `UserProfile`, `SleepSession`, `WorkBreak`, `Experiment`, and `AIMemory` offline locally.
- **Sleep Tracking Service**: Functional manual logging mechanism that accurately records start/end times and calculates duration.
- **Nimbo State Architecture**: Centralized `NimboStateController` mapping intents to visual states using reactive subscriptions to update the `Nimbo` React component.
- **Dry Food System**: Reward limits and state tracking integrated into the `HomeScreen`, allowing the user to earn food by sleeping and spend it by interacting with Nimbo.

### Framework Used:
- React Native
- Expo
- Zustand (State Management + Persistence)
- Lucide React Native (Iconography)

### Running the App on Windows
To start the Expo development server on Windows:
```cmd
npm install
npx expo start
```

### Running on a Physical Android Phone
1. Install the "Expo Go" app from the Google Play Store on your Android device.
2. Ensure your phone and development PC are connected to the same Wi-Fi network.
3. Start the project using `npx expo start`.
4. Scan the QR code presented in the terminal using the Expo Go app.

### Generating an APK Build
To generate an installable Android APK without relying on EAS cloud build (requires Android Studio / Java SDK setup locally):
```cmd
npx expo prebuild
cd android
./gradlew assembleRelease
```
The APK will be output in `android/app/build/outputs/apk/release/`.

Alternatively, if EAS CLI is configured, use:
```cmd
eas build -p android --profile preview
```

### Environment Variables / Credentials
- No API keys are required for the current offline implementation.
- Future AI integration (Stage 5+) will require OpenAI/Anthropic credentials stored in `.env`.

### Missing Services & Known Issues
- **Artwork**: Production Nimbo animation assets are currently using `lucide` icon placeholders.
- **AI Backend**: The Conversational AI coach requires cloud credentials and pipeline implementation.
