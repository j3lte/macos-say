import type { Output } from "@gnome/exec";

export type MacOsSayOutput = {
  command: string;
  args: string[];
  exec: () => Promise<Output>;
};

export type Voice = {
  name: string;
  locale: string;
  example: string;
};

/**
 * Options for the `say` command.
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
 */
export type NonNullableOptions<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};
