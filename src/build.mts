import { connect, Platform } from "@dagger.io/dagger";
import { makeFedoraIot } from "./util/make-fedora-iot.mjs";

connect(
  async (client) => {
    const platforms = ["linux/amd64", "linux/arm64"] as Platform[];
    const platformVariants = platforms.map((platform) =>
      makeFedoraIot(client, platform),
    );

    await client
      .container()
      .publish("quay.io/cprecioso/fedora-iot:stable", { platformVariants });
  },
  { LogOutput: process.stderr },
);
