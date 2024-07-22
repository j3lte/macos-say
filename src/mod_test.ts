import { assert as ok, assertThrows } from "@std/assert";
import { MacOsSay } from "./mod.ts";

Deno.test("basic test", () => {
  const say = new MacOsSay().say("Hello, world!");

  ok(say.command === "say Hello, world!");
});

Deno.test("with options test", () => {
  const say = new MacOsSay({
    rate: 100,
    quality: 127,
    voice: "Alex (German)",
  }).say("Hello, world!");

  ok(say.command === 'say -v "Alex (German)" -r 100 --quality=127 Hello, world!');
});

Deno.test("with options chaining test", () => {
  const say = new MacOsSay()
    .setRate(100)
    .setQuality(127)
    .setVoice("Alex (German)")
    .setAudioDeviceID("output")
    .setFileFormat("mp3")
    .setOutputFile("output.mp3")
    .setNetwork("localhost:3000")
    .setFileFormat("mp3")
    .say("Hello, world!");

  ok(
    say.command ===
      'say -v "Alex (German)" -r 100 --quality=127 -o output.mp3 -n localhost:3000 -a output --file-format=mp3 Hello, world!',
  );
});

Deno.test("MacOsSay.opts test", () => {
  const say = new MacOsSay({
    rate: 100,
    quality: 127,
    voice: "Alex (German)",
    audioDeviceID: "output",
    fileFormat: "mp3",
    network: "localhost:3000",
    outputFile: "output.mp3",
  });

  ok(say.opts.rate === 100);
  ok(say.opts.quality === 127);
  ok(say.opts.voice === "Alex (German)");
  ok(say.opts.audioDeviceID === "output");
  ok(say.opts.fileFormat === "mp3");
  ok(say.opts.network === "localhost:3000");
  ok(say.opts.outputFile === "output.mp3");

  say.setRate();
  ok(say.opts.rate === null);

  say.setQuality();
  ok(say.opts.quality === null);

  say.setVoice();
  ok(say.opts.voice === null);

  say.setAudioDeviceID();
  ok(say.opts.audioDeviceID === null);

  say.setFileFormat();
  ok(say.opts.fileFormat === null);

  say.setNetwork();
  ok(say.opts.network === null);

  say.setOutputFile();
  ok(say.opts.outputFile === null);
});

Deno.test("rate test", () => {
  assertThrows(() => {
    new MacOsSay({ rate: -1 });
  });
  ok(new MacOsSay({ rate: 1 }).say("Hello, world!").command === "say -r 1 Hello, world!");
});

Deno.test("quality test", () => {
  ok(
    new MacOsSay({ quality: -100 }).say("Hello, world!").command === "say --quality=1 Hello, world!",
  );
  ok(
    new MacOsSay({ quality: 127 }).say("Hello, world!").command === "say --quality=127 Hello, world!",
  );
  ok(
    new MacOsSay({ quality: 255 }).say("Hello, world!").command === "say --quality=127 Hello, world!",
  );
});

Deno.test("output file test", () => {
  ok(
    new MacOsSay({ outputFile: "output.mp3" }).say("Hello, world!").command === "say -o output.mp3 Hello, world!",
  );
});

Deno.test("network test", () => {
  ok(
    new MacOsSay({ network: "localhost:3000" }).say("Hello, world!").command === "say -n localhost:3000 Hello, world!",
  );
});

Deno.test("audio device test", () => {
  ok(
    new MacOsSay({ audioDeviceID: "output" }).say("Hello, world!").command === "say -a output Hello, world!",
  );
});

Deno.test("file format test", () => {
  ok(
    new MacOsSay({ fileFormat: "mp3" }).say("Hello, world!").command === "say --file-format=mp3 Hello, world!",
  );
});

Deno.test("say file test", () => {
  ok(
    new MacOsSay({ audioDeviceID: "output" }).sayFile("input.txt").command === "say -a output -f input.txt",
  );
});
