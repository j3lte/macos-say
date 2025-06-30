#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write

import { MacOsSay } from "../mod.ts";

/**
 * CLI Tool for @j3lte/macos-say
 *
 * Usage examples:
 * deno run --allow-run examples/cli.ts say "Hello world"
 * deno run --allow-run examples/cli.ts voices
 * deno run --allow-run examples/cli.ts batch "Hello" "World" "How are you?"
 * deno run --allow-run examples/cli.ts config save
 * deno run --allow-run examples/cli.ts config load
 */

async function main() {
  const args = Deno.args;

  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case "say":
        await handleSay(args.slice(1));
        break;
      case "voices":
        await handleVoices(args.slice(1));
        break;
      case "batch":
        await handleBatch(args.slice(1));
        break;
      case "config":
        await handleConfig(args.slice(1));
        break;
      case "stop":
        await handleStop();
        break;
      case "status":
        await handleStatus();
        break;
      case "help":
      case "--help":
      case "-h":
        showHelp();
        break;
      default:
        console.error(`❌ Unknown command: ${command}`);
        showHelp();
        Deno.exit(1);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error:", errorMessage);
    Deno.exit(1);
  }
}

async function handleSay(args: string[]) {
  if (args.length === 0) {
    console.error("❌ Please provide text to say");
    return;
  }

  const text = args.join(" ");
  const options: {
    voice?: string;
    rate?: number;
    quality?: number;
  } = {};

  // Parse options
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--voice" && i + 1 < args.length) {
      options.voice = args[i + 1];
      i++;
    } else if (args[i] === "--rate" && i + 1 < args.length) {
      options.rate = parseInt(args[i + 1]);
      i++;
    } else if (args[i] === "--quality" && i + 1 < args.length) {
      options.quality = parseInt(args[i + 1]);
      i++;
    }
  }

  console.log(`🗣️ Saying: "${text}"`);
  await MacOsSay.say(text, options);
  console.log("✅ Speech completed");
}

async function handleVoices(args: string[]) {
  const filter = args[0];

  if (filter === "locale" && args[1]) {
    const voices = await MacOsSay.getVoicesByLocale(args[1]);
    console.log(`📢 Voices for locale ${args[1]}:`);
    voices.forEach((voice) => {
      console.log(`  - ${voice.name} (${voice.locale})`);
    });
  } else if (filter === "language" && args[1]) {
    const voices = await MacOsSay.getVoicesByLanguage(args[1]);
    console.log(`📢 Voices for language ${args[1]}:`);
    voices.forEach((voice) => {
      console.log(`  - ${voice.name} (${voice.locale})`);
    });
  } else {
    const voices = await MacOsSay.getVoices();
    console.log(`📢 All available voices (${voices.length}):`);
    voices.forEach((voice) => {
      console.log(`  - ${voice.name} (${voice.locale})`);
    });
  }
}

async function handleBatch(args: string[]) {
  if (args.length === 0) {
    console.error("❌ Please provide texts to say");
    return;
  }

  console.log(`📝 Speaking ${args.length} messages in batch:`);
  args.forEach((text, index) => {
    console.log(`  ${index + 1}. "${text}"`);
  });

  const outputs = await MacOsSay.sayBatch(args, {}, 1000);
  console.log(`✅ Batch completed with ${outputs.length} outputs`);
}

async function handleConfig(args: string[]) {
  const action = args[0];

  if (action === "save") {
    const config = {
      defaultVoice: "Alex",
      defaultRate: 150,
      defaultQuality: 127,
      cacheVoices: true,
      autoValidate: true,
    };

    await MacOsSay.saveConfig(config, "./macos-say-config.json");
    console.log("💾 Configuration saved to ./macos-say-config.json");
  } else if (action === "load") {
    const config = await MacOsSay.loadConfig("./macos-say-config.json");
    console.log("📂 Loaded configuration:", config);
  } else {
    console.error("❌ Unknown config action. Use 'save' or 'load'");
  }
}

async function handleStop() {
  console.log("🛑 Stopping speech...");
  await MacOsSay.stopSpeech();
  console.log("✅ Speech stopped");
}

async function handleStatus() {
  const isSpeaking = await MacOsSay.isSpeaking();
  const defaultVoice = await MacOsSay.getDefaultVoice();

  console.log("📊 Status:");
  console.log(`  Speaking: ${isSpeaking ? "Yes" : "No"}`);
  console.log(`  Default voice: ${defaultVoice}`);

  try {
    const voices = await MacOsSay.getVoices();
    console.log(`  Available voices: ${voices.length}`);
  } catch (_error) {
    console.log("  Available voices: Unknown");
  }
}

function showHelp() {
  console.log(`
🚀 MacOS Say CLI Tool

Usage:
  deno run --allow-run examples/cli.ts <command> [options]

Commands:
  say <text> [options]           Say the provided text
    Options:
      --voice <name>             Set voice
      --rate <number>            Set speech rate
      --quality <number>         Set audio quality

  voices [filter]                List available voices
    Filters:
      locale <locale>            Filter by locale (e.g., en_US)
      language <lang>            Filter by language (e.g., en)

  batch <text1> <text2> ...      Say multiple texts with delay

  config <action>                Manage configuration
    Actions:
      save                       Save default configuration
      load                       Load configuration

  stop                           Stop current speech

  status                         Show current status

  help                           Show this help

Examples:
  deno run --allow-run examples/cli.ts say "Hello world"
  deno run --allow-run examples/cli.ts say "Hello" --voice "Alex" --rate 200
  deno run --allow-run examples/cli.ts voices
  deno run --allow-run examples/cli.ts voices locale en_US
  deno run --allow-run examples/cli.ts batch "Hello" "World" "How are you?"
  deno run --allow-run examples/cli.ts config save
  deno run --allow-run examples/cli.ts status
`);
}

if (import.meta.main) {
  main();
}
