# @j3lte/macos-say

[![JSR](https://jsr.io/badges/@j3lte/macos-say)](https://jsr.io/@j3lte/macos-say)
[![GitHub Release](https://img.shields.io/github/v/release/j3lte/macos-say)](https://github.com/j3lte/macos-say/releases/latest)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/j3lte/macos-say/ci.yml)](https://github.com/j3lte/macos-say/actions)

## Overview

This is a comprehensive module to use the `say` command in MacOS, which is a [text-to-speech command in MacOS](https://ss64.com/mac/say.html). The library provides a type-safe, feature-rich wrapper with enhanced functionality including voice management, validation, caching, and configuration management.

## Features

- ✅ **Type-safe API** with full TypeScript support
- ✅ **Voice management** with caching and filtering
- ✅ **Enhanced error handling** with custom error types
- ✅ **Configuration management** for saving/loading preferences
- ✅ **Batch operations** for multiple text-to-speech tasks
- ✅ **Utility methods** for common operations
- ✅ **Validation** for voices and options
- ✅ **Event-driven architecture** (planned)

## Basic Usage

```typescript
import { MacOsSay } from '@j3lte/macos-say';

// Create a new instance of MacOsSay
const sayer = new MacOsSay();
const output = await sayer.say('Hello, World!').exec();

// You can also use a static method
await MacOsSay.say('Hello, World!');

// Use options
const sayer = new MacOsSay({ voice: 'Daniel', rate: 200 });
const output = await sayer.say('Hello, World!').exec();

// Chain options
const sayer = new MacOsSay().setVoice('Daniel').setRate(200);
const output = await sayer.say('Hello, World!').exec();
```

## Enhanced Features

### Voice Management

```typescript
// Get all available voices
const voices = await MacOsSay.getVoices();

// Get voices by locale
const englishVoices = await MacOsSay.getVoicesByLocale('en_US');

// Get voices by language
const frenchVoices = await MacOsSay.getVoicesByLanguage('fr');

// Validate a voice exists
const isValid = await MacOsSay.validateVoice('Daniel');

// Set voice with validation
await sayer.setVoiceWithValidation('Daniel');
```

### Error Handling

```typescript
import { VoiceNotFoundError, InvalidOptionError } from '@j3lte/macos-say';

try {
  await MacOsSay.say('Hello', { voice: 'NonExistentVoice' });
} catch (error) {
  if (error instanceof VoiceNotFoundError) {
    console.log('Voice not found:', error.message);
  } else if (error instanceof InvalidOptionError) {
    console.log('Invalid option:', error.message);
  }
}
```

### Configuration Management

```typescript
// Save configuration
const config = {
  defaultVoice: 'Daniel',
  defaultRate: 150,
  defaultQuality: 127,
  cacheVoices: true,
  autoValidate: true
};

await MacOsSay.saveConfig(config, './macos-say-config.json');

// Load configuration
const loadedConfig = await MacOsSay.loadConfig('./macos-say-config.json');

// Create instance from configuration
const sayer = await MacOsSay.fromConfig(loadedConfig);
```

### Batch Operations

```typescript
// Speak multiple texts with delay
const texts = ['Hello', 'World', 'How are you?'];
const outputs = await MacOsSay.sayBatch(texts, { voice: 'Daniel' }, 2000);

// Estimate duration
const duration = MacOsSay.estimateDuration('This is a test message', 150);
console.log(`Estimated duration: ${duration}ms`);
```

### Utility Methods

```typescript
// Stop current speech
await MacOsSay.stopSpeech();

// Check if speech is playing
const isPlaying = await MacOsSay.isSpeaking();

// Get default system voice
const defaultVoice = await MacOsSay.getDefaultVoice();

// Get audio devices
const audioDevices = await MacOsSay.getAudioDevices();
```

### Validation

```typescript
// Validate all options
const validation = await sayer.validateOptions();
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}
```

## API Reference

### Main Class: `MacOsSay`

#### Constructor
```typescript
new MacOsSay(options?: Partial<NonNullableOptions<Options>>)
```

#### Instance Methods
- `say(text: string, commandOptions?: CommandOptions): MacOsSayOutput`
- `sayFile(file: string, commandOptions?: CommandOptions): MacOsSayOutput`
- `setVoice(voice?: string): MacOsSay`
- `setVoiceWithValidation(voice: string): Promise<MacOsSay>`
- `setRate(rate?: number): MacOsSay`
- `setQuality(quality?: number): MacOsSay`
- `setOutputFile(outputFile?: string): MacOsSay`
- `setNetwork(network?: string): MacOsSay`
- `setAudioDeviceID(audioDeviceID?: string): MacOsSay`
- `setFileFormat(fileFormat?: string): MacOsSay`
- `validateOptions(): Promise<ValidationResult>`
- `get opts(): Options`

#### Static Methods
- `say(text: string, options?: Partial<NonNullableOptions<Options>>): Promise<Output>`
- `getVoices(): Promise<Voice[]>`
- `getVoicesByLocale(locale: string): Promise<Voice[]>`
- `getVoicesByLanguage(language: string): Promise<Voice[]>`
- `validateVoice(voiceName: string): Promise<boolean>`
- `clearVoicesCache(): void`
- `stopSpeech(): Promise<Output>`
- `isSpeaking(): Promise<boolean>`
- `getAudioDevices(): Promise<string[]>`
- `sayBatch(texts: string[], options?: Partial<NonNullableOptions<Options>>, delayMs?: number): Promise<Output[]>`
- `estimateDuration(text: string, rate?: number): number`
- `getDefaultVoice(): Promise<string>`
- `saveConfig(config: MacOsSayConfig, filePath: string): Promise<void>`
- `loadConfig(filePath: string): Promise<MacOsSayConfig>`
- `fromConfig(config: MacOsSayConfig): Promise<MacOsSay>`

## License

[MIT License](./LICENSE.md)
