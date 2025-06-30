#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write

import { InvalidOptionError, MacOsSay, MacOsSayError, VoiceNotFoundError } from "../mod.ts";

/**
 * Enhanced Usage Examples for @j3lte/macos-say
 *
 * This file demonstrates all the enhanced features of the library.
 */

async function main() {
  console.log("🚀 Enhanced MacOS Say Examples\n");

  try {
    // 1. Basic Usage
    console.log("1. Basic Usage:");
    await MacOsSay.say("Hello, this is a basic example!");
    console.log("✅ Basic speech completed\n");

    // 2. Voice Management
    console.log("2. Voice Management:");

    // Get all voices
    const voices = await MacOsSay.getVoices();
    console.log(`📢 Found ${voices.length} voices on your system`);

    // Get voices by locale
    const englishVoices = await MacOsSay.getVoicesByLocale("en_US");
    console.log(`🇺🇸 Found ${englishVoices.length} English (US) voices`);

    // Get voices by language
    const frenchVoices = await MacOsSay.getVoicesByLanguage("fr");
    console.log(`🇫🇷 Found ${frenchVoices.length} French voices`);

    // Validate a voice
    const isValid = await MacOsSay.validateVoice("Daniel");
    console.log(`✅ Daniel voice is ${isValid ? "available" : "not available"}`);

    if (englishVoices.length > 0) {
      await MacOsSay.say("This is an English voice example", { voice: englishVoices[0].name });
    }
    console.log("✅ Voice management completed\n");

    // 3. Error Handling
    console.log("3. Error Handling:");

    try {
      await MacOsSay.say("This should fail", { voice: "NonExistentVoice123" });
    } catch (error) {
      if (error instanceof VoiceNotFoundError) {
        console.log(`❌ Voice error caught: ${error.message}`);
      } else if (error instanceof InvalidOptionError) {
        console.log(`❌ Invalid option error: ${error.message}`);
      } else if (error instanceof MacOsSayError) {
        console.log(`❌ MacOS Say error: ${error.message}`);
      }
    }

    try {
      await MacOsSay.say("This should fail", { rate: -1 });
    } catch (error) {
      if (error instanceof InvalidOptionError) {
        console.log(`❌ Invalid rate error: ${error.message}`);
      }
    }
    console.log("✅ Error handling completed\n");

    // 4. Configuration Management
    console.log("4. Configuration Management:");

    const config = {
      defaultVoice: "Daniel",
      defaultRate: 150,
      defaultQuality: 127,
      cacheVoices: true,
      autoValidate: true,
    };

    // Save configuration
    await MacOsSay.saveConfig(config, "./macos-say-config.json");
    console.log("💾 Configuration saved");

    // Load configuration
    const loadedConfig = await MacOsSay.loadConfig("./macos-say-config.json");
    console.log("📂 Configuration loaded:", loadedConfig);

    // Create instance from configuration
    const configuredSayer = await MacOsSay.fromConfig(loadedConfig);
    await configuredSayer.say("This is using loaded configuration").exec();
    console.log("✅ Configuration management completed\n");

    // 5. Batch Operations
    console.log("5. Batch Operations:");

    const texts = [
      "First message",
      "Second message",
      "Third message",
    ];

    const outputs = await MacOsSay.sayBatch(texts, { voice: "Daniel" }, 1000);
    console.log(`📝 Processed ${outputs.length} batch messages`);

    // Estimate duration
    const testText = "This is a test message for duration estimation";
    const duration = MacOsSay.estimateDuration(testText, 150);
    console.log(`⏱️ Estimated duration for "${testText}": ${duration}ms`);
    console.log("✅ Batch operations completed\n");

    // 6. Utility Methods
    console.log("6. Utility Methods:");

    // Check if speech is playing
    const isPlaying = await MacOsSay.isSpeaking();
    console.log(`🔊 Currently speaking: ${isPlaying}`);

    // Get default voice
    const defaultVoice = await MacOsSay.getDefaultVoice();
    console.log(`🎤 Default system voice: ${defaultVoice}`);

    // Get audio devices
    try {
      const audioDevices = await MacOsSay.getAudioDevices();
      console.log(`🎧 Found ${audioDevices.length} audio device entries`);
    } catch (_error) {
      console.log("⚠️ Could not retrieve audio devices (this is normal on some systems)");
    }
    console.log("✅ Utility methods completed\n");

    // 7. Validation
    console.log("7. Validation:");

    const sayer = new MacOsSay({
      voice: "Daniel",
      rate: 150,
      quality: 127,
    });

    const validation = await sayer.validateOptions();
    if (validation.isValid) {
      console.log("✅ All options are valid");
    } else {
      console.log("❌ Validation errors:", validation.errors);
    }

    // Test voice validation
    const _validVoice = await sayer.setVoiceWithValidation("Daniel");
    console.log("✅ Voice validation successful");
    console.log("✅ Validation completed\n");

    // 8. Advanced Usage
    console.log("8. Advanced Usage:");

    const advancedSayer = new MacOsSay()
      .setVoice("Daniel")
      .setRate(200)
      .setQuality(127)
      .setOutputFile("./output.aiff")
      .setFileFormat("AIFF");

    await advancedSayer.say("This is an advanced example with file output").exec();
    console.log("💾 Audio file saved as output.aiff");
    console.log("✅ Advanced usage completed\n");

    console.log("🎉 All examples completed successfully!");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    Deno.exit(1);
  }
}

// Run the examples
if (import.meta.main) {
  main();
}
