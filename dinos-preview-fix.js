/* Preview integration for the externally hosted Dino widget. */
(() => {
  function setup() {
    const button = document.querySelector('button[aria-label="Pogovor z Dinom"]');
    const frame = document.querySelector('iframe[src*="dinos-mia.lovable.app"]');
    const panel = frame && frame.parentElement;
    if (!button || !panel) return;

    let opened = false;
    let savedScroll = 0;
    let previousBody = null;
    let previousHtmlOverflow = '';
    let mobileHistoryEntry = false;
    let closingFromBack = false;

    function restoreScroll() {
      if (!previousBody) return;
      for (const key of Object.keys(previousBody)) document.body.style[key] = previousBody[key];
      document.documentElement.style.overflow = previousHtmlOverflow;
      previousBody = null;
      window.scrollTo(0, savedScroll);
    }

    function sync() {
      const isOpen = panel.style.display === 'block';
      if (isOpen === opened) return;
      opened = isOpen;
      document.body.classList.toggle('dinos-chat-open', opened);
      if (opened) {
        savedScroll = window.scrollY;
        previousBody = {};
        for (const key of ['position', 'top', 'left', 'right', 'width', 'overflow']) {
          previousBody[key] = document.body.style[key];
        }
        previousHtmlOverflow = document.documentElement.style.overflow;
        Object.assign(document.body.style, {
          position: 'fixed', top: `-${savedScroll}px`, left: '0', right: '0',
          width: '100%', overflow: 'hidden'
        });
        document.documentElement.style.overflow = 'hidden';
        if (window.matchMedia('(max-width: 480px)').matches) {
          history.pushState({ dinosChatPreview: true }, '', location.href);
          mobileHistoryEntry = true;
        }
      } else {
        restoreScroll();
        if (mobileHistoryEntry && !closingFromBack) history.back();
        mobileHistoryEntry = false;
      }
    }

    new MutationObserver(sync).observe(panel, { attributes: true, attributeFilter: ['style'] });
    window.addEventListener('popstate', () => {
      if (!mobileHistoryEntry || !opened) return;
      closingFromBack = true;
      mobileHistoryEntry = false;
      button.click();
      closingFromBack = false;
    });
    sync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup);
  else setup();
})();
