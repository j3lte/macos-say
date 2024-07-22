/**
 * # @j3lte/macos-say
 *
 * ## Overview
 *
 * This is a simple module to use the `say` command in MacOS, which is a [text-to-speech command in MacOS](https://ss64.com/mac/say.html).
 *
 * ## Basic Usage
 * ```typescript
 * import { MacOsSay } from '@j3lte/macos-say';
 * // Create a new instance of MacOsSay
 * const sayer = new MacOsSay();
 * const output = await sayer.say('Hello, World!').exec();
 *
 * // You can also use a static method
 * MacOsSay.say('Hello, World!');
 *
 * // Use options
 * const sayer = new MacOsSay({ voice: 'Alex', rate: 200 });
 * const output = await sayer.say('Hello, World!').exec();
 *
 * // Chain options
 * const sayer = new MacOsSay().setVoice('Alex').setRate(200);
 * const output = await sayer.say('Hello, World!').exec();
 * ```
 *
 * ## License
 *
 * [MIT License](./LICENSE.md)
 */

export * from "./src/types.ts";
export { MacOsSay } from "./src/mod.ts";
