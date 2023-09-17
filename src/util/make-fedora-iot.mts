import { Client, Platform } from "@dagger.io/dagger";
import { $ } from "./command.mjs";

const isas = {
  "linux/amd64": "x86_64",
  "linux/arm64": "aarch64",
};

const makeRepoInfo = (platform: Platform, version: string) => ({
  remoteName: "fedora-iot",
  url: "https://ostree.fedoraproject.org/iot",
  mirrorlist: "https://ostree.fedoraproject.org/iot/mirrorlist",
  gpgkeypath: "/etc/pki/rpm-gpg/",
  branch: `fedora/${version}/${isas[platform]}/iot`,
});

export const makeFedoraIot = (
  client: Client,
  platform: Platform,
  version: string,
) => {
  const dnfCache = client.cacheVolume("dnf-cache");
  const ostreeRepoCache = client.cacheVolume("ostree-repo");

  const repoInfo = makeRepoInfo(platform, version);

  const repoDirPath = "/repo";
  const outputFilePath = "/image.tgz";

  const imageFile = client
    .container()
    .from("quay.io/fedora/fedora")
    .withMountedCache("/var/cache/dnf", dnfCache)
    .withExec($`dnf install -y rpm-ostree`)
    .withMountedCache(repoDirPath, ostreeRepoCache)
    .withWorkdir(repoDirPath)
    .withExec($`ostree init --repo=. --mode=bare-user`)
    .withExec(
      $`ostree remote add --force --contenturl=mirrorlist=${repoInfo.mirrorlist} --set=gpgkeypath=${repoInfo.gpgkeypath} ${repoInfo.remoteName} ${repoInfo.url}`,
    )
    .withExec($`ostree pull ${repoInfo.remoteName}:${repoInfo.branch}`)
    .withExec(
      $`rpm-ostree compose container-encapsulate --repo=${repoDirPath} ${repoInfo.branch} oci-archive:${outputFilePath}`,
    )
    .file(outputFilePath);

  const image = client.container({ platform }).import(imageFile);

  return image;
};
