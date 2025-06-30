/**
 * # @j3lte/macos-say
 *
 * ## Overview
 *
 * This is a comprehensive module to use the `say` command in MacOS, which is a [text-to-speech command in MacOS](https://ss64.com/mac/say.html). The library provides a type-safe, feature-rich wrapper with enhanced functionality including voice management, validation, caching, and configuration management.
 *
 * ## Basic Usage
 * ```typescript
 * import { MacOsSay } from '@j3lte/macos-say';
 * // Create a new instance of MacOsSay
 * const sayer = new MacOsSay();
 * const output = await sayer.say('Hello, World!').exec();
 *
 * // You can also use a static method
 * await MacOsSay.say('Hello, World!');
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
