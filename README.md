# @j3lte/macos-say

![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/j3lte/macos-say/ci.yml)
[![codecov](https://codecov.io/gh/j3lte/macos-say/graph/badge.svg?token=153r6NsbQw)](https://codecov.io/gh/j3lte/macos-say)

## Overview

This is a simple module to use the `say` command in MacOS. It is a wrapper around the `say` command, which is a text-to-speech command in MacOS.

## Basic Usage

```typescript
import { MacOsSay } from '@j3lte/macos-say';

// Create a new instance of MacOsSay
const sayer = new MacOsSay();
const output = await say.say('Hello, World!').exec();

// You can also use a static method
MacOsSay.say('Hello, World!');

// Use options
const sayer = new MacOsSay({ voice: 'Alex', rate: 200 });
const output = await say.say('Hello, World!').exec();

// Chain options
const sayer = new MacOsSay().setVoice('Alex').setRate(200);
const output = await say.say('Hello, World!').exec();
```

## License

[MIT License](./LICENSE.md)
