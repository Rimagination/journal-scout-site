(() => {
  const views = [...document.querySelectorAll('[data-extension-view]')].map(element => ({
    element,
    names: element.dataset.extensionView.split(/\s+/),
  }));
  const navLinks = [...document.querySelectorAll('.extension-section-nav [data-extension-nav]')];
  const viewNames = new Set(views.flatMap(view => view.names));
  const defaultView = 'install-guide';

  function showView(name) {
    const active = viewNames.has(name) ? name : defaultView;
    views.forEach(({ element, names }) => { element.hidden = !names.includes(active); });
    document.body.dataset.activeExtensionView = active;
    navLinks.forEach(link => {
      if (link.hash === `#${active}`) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function showCurrent() {
    showView(location.hash.slice(1));
  }

  document.querySelectorAll('[data-extension-nav]').forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const next = link.hash.slice(1);
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      showView(next);
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  });
  window.addEventListener('popstate', showCurrent);
  window.addEventListener('hashchange', showCurrent);
  showCurrent();
  if (viewNames.has(location.hash.slice(1))) window.scrollTo({ top: 0, behavior: 'instant' });
})();
