# Running HabitGen on iOS

## Quick run (simulator)

From the project root (`HabitGen/`):

```bash
npm run ios
```

This builds and runs on **iPhone 16** simulator by default so the app does not try to use a physical device (which requires code signing).

## Using a different simulator

List simulators:

```bash
xcrun simctl list devices available
```

Run on a specific simulator:

```bash
npx react-native run-ios --simulator "iPhone 15"
# or
npx react-native run-ios --simulator "iPad Pro (12.9-inch)"
```

## First-time / after pulling changes

If you need to install or update CocoaPods:

```bash
export LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8
cd ios && pod install && cd ..
```

Then run:

```bash
npm run ios
```

## Running on a physical device

1. Open the workspace in Xcode:
   ```bash
   open ios/HabitGen.xcworkspace
   ```
2. Select your connected iPhone as the run destination.
3. In **Signing & Capabilities**, choose your **Team** (Apple ID).
4. Build and run from Xcode (⌘R), or from terminal:
   ```bash
   npm run ios:device
   ```
   (Only use `ios:device` if a physical device is the only booted “device”; otherwise the CLI may pick it and fail with code signing errors.)

## Requirements

- macOS with Xcode installed.
- Xcode Command Line Tools: `xcode-select --install` if needed.
- For simulator: at least one iOS simulator runtime installed (Xcode → Settings → Platforms).
