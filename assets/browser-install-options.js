const browserGuides = document.querySelectorAll(".browser-guide[aria-controls]");

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

const installOptions = document.querySelectorAll(".install-option[aria-controls]");

for (const option of installOptions) {
  option.addEventListener("click", () => {
    const group = option.closest(".browser-guide__body");
    const groupOptions = group?.querySelectorAll(".install-option[aria-controls]") ?? [option];
    const shouldOpen = option.getAttribute("aria-expanded") !== "true";

    for (const otherOption of groupOptions) {
      const panel = document.getElementById(otherOption.getAttribute("aria-controls"));
      const isOpen = otherOption === option && shouldOpen;
      const hint = otherOption.querySelector(".install-option__hint");

      otherOption.setAttribute("aria-expanded", String(isOpen));
      if (hint) hint.textContent = isOpen ? "点击收起" : "点击查看";
      if (panel) panel.hidden = !isOpen;
    }
  });
}
