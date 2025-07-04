import type { Output } from "@gnome/exec";

export type { CommandOptions, Output } from "@gnome/exec";

/**
 * Output type.
 *
 * This is the type of the output returned by the `exec` method.
 *
 * Example:
 * ```typescript
 * import { MacOsSay } from '@j3lte/macos-say';
 * const output = await MacOsSay.say('Hello, World!').exec();
 * ```
 *
 * An Output object will look like this (example):
 * ```typescript
 * {
 *   "command": "say -v \"Alex\" -r 200 Hello, World!",
 *   "args": ["-v", "Alex", "-r", "200", "Hello, World!"],
 *   "exec": () => Promise<Output>
 * }
 * ```
 *
 * The `exec` method is a function that can be called to execute the command.
 */
export type MacOsSayOutput = {
  command: string;
  args: string[];
  exec: () => Promise<Output>;
};

/**
 * Voice type.
 *
 * This is the type of the voices returned by the `getVoices` method.
 *
 * Example:
 * ```typescript
 * import { MacOsSay } from '@j3lte/macos-say';
 * const voices = await MacOsSay.getVoices();
 *
 * console.log(voices);
 * ```
 *
 * A Voice object will look like this:
 * ```json
 * {
 *  "name": "Alex",
 *  "locale": "en_US",
 *  "example": "Hello, my name is Alex."
 * }
 * ```
 */
export type Voice = {
  name: string;
  locale: string;
  example: string;
};

/**
 * Options for the `MacOsSay` class.
 *
 * This is the type of the options that can be passed to the `MacOsSay` class.
 *
 * Example:
 * ```typescript
 * import { MacOsSay } from '@j3lte/macos-say';
 * const sayer = new MacOsSay({
 *  rate: 100,
 *  quality: 127,
 *  voice: "Alex (German)",
 * });
 *
 * // Can be accesses by `sayer.opts`
 * ```
 */
export type Options = {
  /**
   * The voice to be used. Default is the voice selected in System Preferences.
   */
  voice: string | null;

  /**
   * Speech rate to be used, in words per minute.
   */
  rate: number | null;

  /**
   * The audio converter quality level between 0 (lowest) and 127 (highest).
   */
  quality: number | null;

  /**
   * The path for an audio file to be written. AIFF is the default and should be supported
   * for most voices, but some voices support many more file formats.
   */
  outputFile: string | null;

  /**
   * Specify a service name (default "AUNetSend") and/or IP port to be used for redirecting the
   * speech output through AUNetSend.
   */
  network: string | null;

  /**
   * Specify, by ID or name prefix, an audio device to be used to play the audio.
   */
  audioDeviceID: string | null;

  /**
   * The format of the file to write (AIFF, caff, m4af, WAVE). Generally, it's easier to specify a
   * suitable file extension for the output file.
   */
  fileFormat: string | null;
};

/**
 * Options with all properties set to non-nullable.
 *
 * This is a utility type that sets all properties of a type to be non-nullable.
 */
export type NonNullableOptions<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

/**
 * Custom error types for better error handling
 */
export class MacOsSayError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = "MacOsSayError";
  }
}

export class VoiceNotFoundError extends MacOsSayError {
  constructor(voice: string) {
    super(`Voice "${voice}" not found on this system`, "VOICE_NOT_FOUND");
    this.name = "VoiceNotFoundError";
  }
}

export class InvalidOptionError extends MacOsSayError {
  constructor(option: string, value: unknown, reason: string) {
    super(`Invalid ${option}: ${value}. ${reason}`, "INVALID_OPTION");
    this.name = "InvalidOptionError";
  }
}

/**
 * Validation result type
 */
export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

/**
 * Event types for speech operations
 */
export type SpeechEvent =
  | "start"
  | "progress"
  | "complete"
  | "error"
  | "cancel";

export type SpeechEventData = {
  event: SpeechEvent;
  text?: string;
  progress?: number;
  error?: Error;
  timestamp: number;
};

export type SpeechEventListener = (data: SpeechEventData) => void;

/**
 * Speech status information
 */
export type SpeechStatus = {
  isSpeaking: boolean;
  currentText?: string;
  startTime?: number;
  duration?: number;
};

/**
 * Configuration for the MacOsSay library
 */
export type MacOsSayConfig = {
  defaultVoice?: string;
  defaultRate?: number;
  defaultQuality?: number;
  defaultAudioDevice?: string;
  cacheVoices?: boolean;
  cacheDuration?: number;
  autoValidate?: boolean;
};

/**
 * Configuration file structure
 */
export type ConfigFile = {
  version: string;
  config: MacOsSayConfig;
  lastUpdated: string;
};
