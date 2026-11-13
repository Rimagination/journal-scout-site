/* Lucide ArrowUpRight; source and ISC license are in assets/icons/. */
(() => {
  globalThis.JournalScoutLinkIcon=() => {
    const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg'),use=document.createElementNS(ns,'use');
    svg.setAttribute('class','link-icon lucide lucide-arrow-up-right');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('aria-hidden','true');
    svg.setAttribute('focusable','false');
    use.setAttribute('href','./assets/icons/lucide-arrow-up-right.svg#arrow-up-right');
    svg.append(use);
    return svg;
  };
})();
