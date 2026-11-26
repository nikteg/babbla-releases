// Points the download links at the files of the latest desktop release, and the main button at
// the visitor's platform. Without the API (offline, rate limited) every link goes to the releases
// page, which works too.
(() => {
  const REPO = "nikteg/babbla-releases";

  const LABELS = {
    "arm64.dmg": "Download for macOS",
    "x64.dmg": "Download for macOS (Intel)",
    "x64.exe": "Download for Windows",
    "x86_64.AppImage": "Download for Linux",
  };

  function guessPlatform() {
    const ua = navigator.userAgent;
    const platform = navigator.userAgentData?.platform ?? navigator.platform ?? "";
    if (/Android|iPhone|iPad|iPod/i.test(ua)) return null;
    // Apple silicon can't be told from Intel in most browsers; most Macs sold since 2021 are.
    if (/Mac/i.test(platform)) return "arm64.dmg";
    if (/Win/i.test(platform)) return "x64.exe";
    if (/Linux/i.test(platform)) return "x86_64.AppImage";
    return null;
  }

  function apply(release) {
    const version = release.tag_name.replace(/^v/, "");
    const info = document.getElementById("release-info");
    info.textContent = `Version ${version}, for macOS, Windows and Linux. The app updates itself.`;

    const links = {};
    for (const link of document.querySelectorAll("[data-asset]")) {
      const suffix = link.dataset.asset;
      const asset = release.assets.find((a) => a.name.endsWith(`-${suffix}`));
      if (asset) {
        link.href = asset.browser_download_url;
        links[suffix] = asset.browser_download_url;
      }
    }

    const suggested = guessPlatform();
    if (!suggested) return;
    document.querySelector(`[data-asset="${suggested}"]`)?.classList.add("suggested");
    if (links[suggested]) {
      const primary = document.getElementById("primary-download");
      primary.href = links[suggested];
      primary.textContent = LABELS[suggested];
      document.getElementById("primary-hint").innerHTML =
        `Version ${version}. <a href="#download">Other platforms</a>, or open your server in any browser.`;
    }
  }

  fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then(apply)
    .catch(() => {});
})();
