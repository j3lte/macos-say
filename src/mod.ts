import { Command, type CommandOptions, type Output } from "@gnome/exec";
import {
  type ConfigFile,
  InvalidOptionError,
  type MacOsSayConfig,
  MacOsSayError,
  type MacOsSayOutput,
  type NonNullableOptions,
  type Options,
  type ValidationResult,
  type Voice,
  VoiceNotFoundError,
} from "./types.ts";

/**
 * Class to use the `say` command in MacOS.
 *
 * This is a wrapper around the `say` command, which is a text-to-speech command in MacOS.
 *
 * ## Basic Usage
 * ```typescript
 * import { MacOsSay } from '@j3lte/macos-say';
 * // Create a new instance of MacOsSay
 * const sayer = new MacOsSay();
 * const output = await say.say('Hello, World!').exec();
 * ```
 */
export class MacOsSay {
  private options: Options = {
    voice: null,
    rate: null,
    quality: null,
    outputFile: null,
    network: null,
    audioDeviceID: null,
    fileFormat: null,
  };

  // Cache for voices to avoid repeated system calls
  private static voicesCache: Voice[] | null = null;
  private static voicesCacheTime: number = 0;
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  constructor(options: Partial<NonNullableOptions<Options>> = {}) {
    this.options = { ...this.options, ...options };

    if (this.options.rate && (this.options.rate < 1)) {
      throw new InvalidOptionError("rate", this.options.rate, "Rate must be greater than or equal to 1.");
    }

    if (this.options.quality && (this.options.quality < 0)) {
      this.options.quality = 1;
    } else if (this.options.quality && (this.options.quality > 127)) {
      this.options.quality = 127;
    }
  }

  private getArgs(suffixArgs: string[]): { args: string[]; command: string } {
    const args: string[] = [];
    if (this.options.voice) {
      args.push("-v", `"${this.options.voice}"`);
    }
    if (this.options.rate) {
      args.push("-r", this.options.rate.toString());
    }
    if (this.options.quality) {
      args.push(`--quality=${this.options.quality}`);
    }
    if (this.options.outputFile) {
      args.push("-o", this.options.outputFile);
    }
    if (this.options.network) {
      args.push("-n", this.options.network);
    }
    if (this.options.audioDeviceID) {
      args.push("-a", this.options.audioDeviceID);
    }
    if (this.options.fileFormat) {
      args.push(`--file-format=${this.options.fileFormat}`);
    }
    const outputArgs = args.concat(suffixArgs);
    return { args: outputArgs, command: `say ${outputArgs.join(" ")}` };
  }

  /**
   * Get the options.
   * @returns The options.
   */
  get opts(): Options {
    return this.options;
  }

  /**
   * Speak the given text.
   * @param text The text to be spoken.
   * @param options Options to be used for the speech.
   * @returns The output of the command.
   */
  static say = async (
    text: string,
    options?: Partial<NonNullableOptions<Options>>,
  ): Promise<Output> => {
    const instance = new MacOsSay(options);

    // Validate options before execution
    const validation = await instance.validateOptions();
    if (!validation.isValid) {
      throw new InvalidOptionError("options", options, validation.errors.join(", "));
    }

    return instance.say(text).exec();
  };

  /**
   * Get the voices available on the system.
   * @throws If there is an error getting the voices.
   * @returns The voices available on the system.
   */
  static getVoices = async (): Promise<Voice[]> => {
    // Check cache first
    const now = Date.now();
    if (MacOsSay.voicesCache && (now - MacOsSay.voicesCacheTime) < MacOsSay.CACHE_DURATION) {
      return MacOsSay.voicesCache;
    }

    const cmd = new Command("say", ["-v", "?"]);
    const output = await cmd.output();

    if (!output.success) {
      throw new MacOsSayError(`Failed to get voices: ${output.errorText()}`, "VOICES_FETCH_ERROR");
    }

    const lines = output.lines();
    const voices: Voice[] = [];
    let match: RegExpMatchArray | null;

    for (const line of lines) {
      if ((match = line.match(/[a-z]{2}_[A-Z]{2}/)) !== null) {
        const locale = match[0];
        const [name, example] = line.split(/[a-z]{2}_[A-Z]{2}/);
        const voice: Voice = {
          name: name.trim(),
          locale,
          example: example.trim().replace(/^# /, ""),
        };
        voices.push(voice);
      }
    }

    // Update cache
    MacOsSay.voicesCache = voices;
    MacOsSay.voicesCacheTime = now;

    return voices;
  };

  /**
   * Clear the voices cache to force a fresh fetch on next getVoices call.
   */
  static clearVoicesCache(): void {
    MacOsSay.voicesCache = null;
    MacOsSay.voicesCacheTime = 0;
  }

  /**
   * Get voices filtered by locale.
   * @param locale The locale to filter by (e.g., "en_US", "fr_FR").
   * @returns Promise resolving to filtered voices.
   */
  static getVoicesByLocale = async (locale: string): Promise<Voice[]> => {
    const voices = await MacOsSay.getVoices();
    return voices.filter((voice) => voice.locale === locale);
  };

  /**
   * Get voices filtered by language.
   * @param language The language code to filter by (e.g., "en", "fr").
   * @returns Promise resolving to filtered voices.
   */
  static getVoicesByLanguage = async (language: string): Promise<Voice[]> => {
    const voices = await MacOsSay.getVoices();
    return voices.filter((voice) => voice.locale.startsWith(language + "_"));
  };

  /**
   * Validate if a voice exists on the system.
   * @param voiceName The name of the voice to validate.
   * @returns Promise resolving to true if voice exists, false otherwise.
   */
  static validateVoice = async (voiceName: string): Promise<boolean> => {
    const voices = await MacOsSay.getVoices();
    return voices.some((voice) => voice.name === voiceName);
  };

  /**
   * Validate all current options.
   * @returns Promise resolving to validation result.
   */
  public async validateOptions(): Promise<ValidationResult> {
    const errors: string[] = [];

    if (this.options.voice) {
      const isValid = await MacOsSay.validateVoice(this.options.voice);
      if (!isValid) {
        errors.push(`Voice "${this.options.voice}" not found on this system`);
      }
    }

    if (this.options.rate !== null && this.options.rate < 1) {
      errors.push("Rate must be greater than or equal to 1");
    }

    if (this.options.quality !== null && (this.options.quality < 0 || this.options.quality > 127)) {
      errors.push("Quality must be between 0 and 127");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Set the voice to be used.
   * @param voice The voice to be used. Default is the voice selected in System Preferences. You can use a voice name
   * you get from `MacOsSay.getVoices()`.
   * @returns The current instance of MacOsSay.
   */
  public setVoice(voice?: string): MacOsSay {
    this.options.voice = voice || null;
    return this;
  }

  /**
   * Set the voice to be used with validation.
   * @param voice The voice to be used.
   * @returns Promise resolving to the current instance of MacOsSay.
   * @throws VoiceNotFoundError if the voice doesn't exist.
   */
  public async setVoiceWithValidation(voice: string): Promise<MacOsSay> {
    const isValid = await MacOsSay.validateVoice(voice);
    if (!isValid) {
      throw new VoiceNotFoundError(voice);
    }
    this.options.voice = voice;
    return this;
  }

  /**
   * Set the speech rate to be used, in words per minute.
   * @param rate Speech rate to be used, in words per minute.
   * @returns The current instance of MacOsSay.
   */
  public setRate(rate?: number): MacOsSay {
    this.options.rate = typeof rate === "number" ? Math.max(1, rate) : null;
    return this;
  }

  /**
   * Set the audio converter quality level between 0 (lowest) and 127 (highest).
   * @param quality The audio converter quality level between 0 (lowest) and 127 (highest).
   * @returns The current instance of MacOsSay.
   */
  public setQuality(quality?: number): MacOsSay {
    this.options.quality = typeof quality === "number" ? Math.max(0, Math.min(127, quality)) : null;
    return this;
  }

  /**
   * Set the path for an audio file to be written. AIFF is the default and should be supported
   * for most voices, but some voices support many more file formats.
   * @param outputFile The path for an audio file to be written.
   * @returns The current instance of MacOsSay.
   */
  public setOutputFile(outputFile?: string): MacOsSay {
    this.options.outputFile = outputFile || null;
    return this;
  }

  /**
   * Specify a service name (default "AUNetSend") and/or IP port to be used for redirecting the
   * speech output through AUNetSend.
   * @param network Specify a service name (default "AUNetSend") and/or IP port to be used for redirecting the
   * speech output through AUNetSend.
   * @returns The current instance of MacOsSay.
   */
  public setNetwork(network?: string): MacOsSay {
    this.options.network = network || null;
    return this;
  }

  /**
   * Specify, by ID or name prefix, an audio device to be used to play the audio.
   * @param audioDeviceID Specify, by ID or name prefix, an audio device to be used to play the audio.
   * @returns The current instance of MacOsSay.
   */
  public setAudioDeviceID(audioDeviceID?: string): MacOsSay {
    this.options.audioDeviceID = audioDeviceID || null;
    return this;
  }

  /**
   * Set the format of the file to write (AIFF, caff, m4af, WAVE). Generally, it's easier to specify a
   * suitable file extension for the output file.
   * @param fileFormat The format of the file to write (AIFF, caff, m4af, WAVE).
   * @returns The current instance of MacOsSay.
   */
  public setFileFormat(fileFormat?: string): MacOsSay {
    this.options.fileFormat = fileFormat || null;
    return this;
  }

  /**
   * Speak the given text.
   * @param text The text to be spoken.
   * @param commandOptions Options to be used for the command.
   * @returns The output of the command to be executed.
   */
  public say(text: string, commandOptions?: CommandOptions): MacOsSayOutput {
    const { args, command } = this.getArgs([text]);
    const cmd = new Command("say", args, commandOptions);
    return {
      command,
      args,
      exec: () => cmd.output(),
    };
  }

  /**
   * Speak the contents of a file.
   * @param file The file to be spoken.
   * @param commandOptions Options to be used for the command.
   * @returns The output of the command to be executed.
   */
  public sayFile(
    file: string,
    commandOptions?: CommandOptions,
  ): MacOsSayOutput {
    const { args, command } = this.getArgs([`-f`, file]);
    const cmd = new Command("say", args, commandOptions);
    return {
      command,
      args,
      exec: () => cmd.output(),
    };
  }

  /**
   * Stop any currently playing speech.
   * @returns Promise resolving to the command output.
   */
  static stopSpeech = (): Promise<Output> => {
    const cmd = new Command("killall", ["say"]);
    return cmd.output();
  };

  /**
   * Check if speech is currently playing.
   * @returns Promise resolving to true if speech is playing, false otherwise.
   */
  static isSpeaking = async (): Promise<boolean> => {
    const cmd = new Command("pgrep", ["say"]);
    const output = await cmd.output();
    return output.success && output.lines().length > 0;
  };

  /**
   * Get system information about available audio devices.
   * @returns Promise resolving to audio device information.
   */
  static getAudioDevices = async (): Promise<string[]> => {
    const cmd = new Command("system_profiler", ["SPAudioDataType"]);
    const output = await cmd.output();

    if (!output.success) {
      throw new MacOsSayError(`Failed to get audio devices: ${output.errorText()}`, "AUDIO_DEVICES_FETCH_ERROR");
    }

    return output.lines();
  };

  /**
   * Speak multiple texts in sequence.
   * @param texts Array of texts to speak.
   * @param options Options to be used for all speech operations.
   * @param delayMs Delay between each speech operation in milliseconds.
   * @returns Promise resolving to array of outputs.
   */
  static sayBatch = async (
    texts: string[],
    options?: Partial<NonNullableOptions<Options>>,
    delayMs: number = 1000,
  ): Promise<Output[]> => {
    const instance = new MacOsSay(options);
    const outputs: Output[] = [];

    for (const text of texts) {
      const output = await instance.say(text).exec();
      outputs.push(output);

      if (delayMs > 0 && texts.indexOf(text) < texts.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    return outputs;
  };

  /**
   * Get estimated speech duration for a given text.
   * This is a rough estimation based on average speaking rate.
   * @param text The text to estimate duration for.
   * @param rate Words per minute (default: 150).
   * @returns Estimated duration in milliseconds.
   */
  static estimateDuration = (text: string, rate: number = 150): number => {
    const words = text.trim().split(/\s+/).length;
    const minutes = words / rate;
    return Math.round(minutes * 60 * 1000);
  };

  /**
   * Get the default system voice.
   * @returns Promise resolving to the default voice name.
   */
  static getDefaultVoice = async (): Promise<string> => {
    const cmd = new Command("defaults", ["read", "com.apple.speech.voice.prefs", "SelectedVoiceName"]);
    const output = await cmd.output();

    if (!output.success) {
      // Fallback to first available voice
      const voices = await MacOsSay.getVoices();
      return voices[0]?.name || "Alex";
    }

    return output.lines()[0]?.trim() || "Alex";
  };

  /**
   * Save configuration to a file.
   * @param config The configuration to save.
   * @param filePath The path to save the configuration to.
   * @returns Promise resolving when configuration is saved.
   */
  static saveConfig = async (config: MacOsSayConfig, filePath: string): Promise<void> => {
    const configFile: ConfigFile = {
      version: "1.0.0",
      config,
      lastUpdated: new Date().toISOString(),
    };

    await Deno.writeTextFile(filePath, JSON.stringify(configFile, null, 2));
  };

  /**
   * Load configuration from a file.
   * @param filePath The path to load the configuration from.
   * @returns Promise resolving to the loaded configuration.
   */
  static loadConfig = async (filePath: string): Promise<MacOsSayConfig> => {
    try {
      const content = await Deno.readTextFile(filePath);
      const configFile: ConfigFile = JSON.parse(content);
      return configFile.config;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new MacOsSayError(`Failed to load configuration: ${errorMessage}`, "CONFIG_LOAD_ERROR");
    }
  };

  /**
   * Create a new instance with configuration.
   * @param config The configuration to apply.
   * @returns Promise resolving to a new MacOsSay instance.
   */
  static fromConfig = (config: MacOsSayConfig): MacOsSay => {
    const options: Partial<NonNullableOptions<Options>> = {};

    if (config.defaultVoice) {
      options.voice = config.defaultVoice;
    }
    if (config.defaultRate) {
      options.rate = config.defaultRate;
    }
    if (config.defaultQuality) {
      options.quality = config.defaultQuality;
    }
    if (config.defaultAudioDevice) {
      options.audioDeviceID = config.defaultAudioDevice;
    }

    const instance = new MacOsSay(options);

    // Apply configuration settings
    if (config.cacheVoices === false) {
      MacOsSay.clearVoicesCache();
    }

    return instance;
  };
}

export { InvalidOptionError, MacOsSayError, VoiceNotFoundError } from "./types.ts";
