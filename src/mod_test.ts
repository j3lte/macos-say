// deno-lint-ignore-file no-explicit-any
import { assert as ok, assertThrows } from "@std/assert";
import { resolvesNext, stub } from "@std/testing/mock";
import { MacOsSay } from "./mod.ts";

Deno.test("basic test", async () => {
  const say = new MacOsSay().say("Hello, world!");
  const stubExec = stub(say, "exec", resolvesNext([{ code: 0 } as any]));

  ok(say.command === "say Hello, world!");
  ok(say.exec !== undefined);

  const output = await say.exec();
  ok(output.code === 0);

  stubExec.restore();

  const syaFile = new MacOsSay().sayFile("input.txt");
  const stubExecFile = stub(syaFile, "exec", resolvesNext([{ code: 0 } as any]));

  ok(syaFile.command === "say -f input.txt");
  ok(syaFile.exec !== undefined);

  const outputFile = await syaFile.exec();
  ok(outputFile.code === 0);

  stubExecFile.restore();
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

Deno.test("get voices test", async () => {
  const stubExec = stub(
    MacOsSay,
    "getVoices",
    resolvesNext([[{ name: "Tessa", locale: "en_ZA", example: "Hello! My name is Tessa." }] as any]),
  );
  const voices = await MacOsSay.getVoices();

  ok(voices.length === 1);
  ok(voices[0].name === "Tessa");
  ok(voices[0].locale === "en_ZA");
  ok(voices[0].example === "Hello! My name is Tessa.");

  stubExec.restore();
});
