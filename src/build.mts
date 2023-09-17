import { connect, Platform } from "@dagger.io/dagger";
import assert from "node:assert/strict";
import { makeFedoraIot } from "./util/make-fedora-iot.mjs";

const REGISTRY = process.env.REGISTRY;
assert(REGISTRY);
const IMAGE_NAME = process.env.IMAGE_NAME;
assert(IMAGE_NAME);
const VERSION = process.env.VERSION;
assert(VERSION);

connect(
  async (client) => {
    const platforms = ["linux/amd64", "linux/arm64"] as Platform[];

    const platformVariants = platforms.map((platform) =>
      makeFedoraIot(client, platform, VERSION),
    );

    await client
      .container()
      .publish(`${REGISTRY}/${IMAGE_NAME}:${VERSION}`, { platformVariants });
  },
  { LogOutput: process.stderr },
);
