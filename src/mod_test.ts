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
  const say = new MacOsSay().setRate(100).setQuality(127).setVoice("Alex (German)").say("Hello, world!");

  ok(say.command === 'say -v "Alex (German)" -r 100 --quality=127 Hello, world!');
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
    "Quality should be 1 when less than 0.",
  );
  ok(
    new MacOsSay({ quality: 127 }).say("Hello, world!").command === "say --quality=127 Hello, world!",
    "Quality should be 127 when greater than 127.",
  );
});
