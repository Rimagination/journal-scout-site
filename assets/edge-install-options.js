const edgeInstallOptions = document.querySelectorAll(".edge-install-option[aria-controls]");

for (const option of edgeInstallOptions) {
  option.addEventListener("click", () => {
    const shouldOpen = option.getAttribute("aria-expanded") !== "true";

    for (const otherOption of edgeInstallOptions) {
      const panel = document.getElementById(otherOption.getAttribute("aria-controls"));
      const isOpen = otherOption === option && shouldOpen;
      const hint = otherOption.querySelector(".edge-install-option__hint");

      otherOption.setAttribute("aria-expanded", String(isOpen));
      if (hint) hint.textContent = isOpen ? "点击收起" : "点击查看";
      if (panel) panel.hidden = !isOpen;
    }
  });
}
