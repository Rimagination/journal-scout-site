const browserGuides = document.querySelectorAll(".browser-guide[aria-controls]");

// Compare version components numerically: 0.1.11 is newer than 0.1.10.2.
function compareChannelVersions(left, right) {
  const valid = /^\d+(?:\.\d+){1,3}$/;
  if (!valid.test(left) || !valid.test(right)) return null;
  const a = left.split(".").map(Number);
  const b = right.split(".").map(Number);
  for (let index = 0; index < Math.max(a.length, b.length); index++) {
    const difference = (a[index] || 0) - (b[index] || 0);
    if (difference) return Math.sign(difference);
  }
  return 0;
}

for (const group of document.querySelectorAll(".browser-guide__body .install-options")) {
  const channels = [...group.querySelectorAll(".install-option[data-channel-version]")];
  for (const channel of channels) {
    const others = channels.filter(other => other !== channel);
    const isNewer = others.length > 0 && others.every(other =>
      compareChannelVersions(channel.dataset.channelVersion, other.dataset.channelVersion) === 1);
    const badge = channel.querySelector(".install-option__new");
    if (badge) badge.hidden = !isNewer;
  }
}

function setBrowserGuide(guide) {
  for (const otherGuide of browserGuides) {
    const panel = document.getElementById(otherGuide.getAttribute("aria-controls"));
    const isOpen = otherGuide === guide;
    otherGuide.setAttribute("aria-expanded", String(isOpen));
    if (panel) panel.hidden = !isOpen;
  }
}

for (const guide of browserGuides) {
  guide.addEventListener("click", () => {
    setBrowserGuide(guide.getAttribute("aria-expanded") === "true" ? null : guide);
  });
}

function openLinkedBrowser() {
  const guide = [...browserGuides].find(item => `#${item.id}` === location.hash);
  if (guide) setBrowserGuide(guide);
}

window.addEventListener("hashchange", openLinkedBrowser);
openLinkedBrowser();

const installOptions = document.querySelectorAll(".install-option__toggle[aria-controls]");

for (const option of installOptions) {
  option.addEventListener("click", () => {
    const group = option.closest(".browser-guide__body, .zotero-install-entry");
    const groupOptions = group?.querySelectorAll(".install-option__toggle[aria-controls]") ?? [option];
    const shouldOpen = option.getAttribute("aria-expanded") !== "true";
    const panels = new Map();

    for (const otherOption of groupOptions) {
      const panel = document.getElementById(otherOption.getAttribute("aria-controls"));
      const isOpen = otherOption === option && shouldOpen;
      const hint = otherOption.querySelector(".install-option__hint");

      otherOption.setAttribute("aria-expanded", String(isOpen));
      otherOption.closest(".install-option, .zotero-install-entry__card")?.classList.toggle("is-open", isOpen);
      if (hint) hint.textContent = isOpen ? (otherOption.dataset.closeLabel || "收起步骤") : (otherOption.dataset.openLabel || "查看步骤");
      if (panel) panels.set(panel, panels.get(panel) || isOpen);
    }
    for (const [panel, isOpen] of panels) panel.hidden = !isOpen;
  });
}
