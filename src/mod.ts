import { Command, type CommandOptions, type Output } from "@gnome/exec";
import type { MacOsSayOutput, NonNullableOptions, Options, Voice } from "./types.ts";

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

  constructor(options: Partial<NonNullableOptions<Options>> = {}) {
    this.options = { ...this.options, ...options };

    if (this.options.rate && (this.options.rate < 1)) {
      throw new Error("Rate must be greater than or equal to 1.");
    }

    if (this.options.quality && (this.options.quality < 0)) {
      this.options.quality = 1;
    } else if (this.options.quality && (this.options.quality > 127)) {
      this.options.quality = 127;
    }
  }

  private getArgs(suffixArgs?: string[]): { args: string[]; command: string } {
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
    const outputArgs = suffixArgs ? [...args, ...suffixArgs] : args;
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
  static say = (
    text: string,
    options?: Partial<NonNullableOptions<Options>>,
  ): Promise<Output> => {
    return new MacOsSay(options).say(text).exec();
  };

  /**
   * Get the voices available on the system.
   * @throws If there is an error getting the voices.
   * @returns The voices available on the system.
   */
  static getVoices = async (): Promise<Voice[]> => {
    const cmd = new Command("say", ["-v", "?"]);
    const output = await cmd.output();

    if (!output.success) {
      throw new Error(output.errorText());
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

    return voices;
  };

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
}
