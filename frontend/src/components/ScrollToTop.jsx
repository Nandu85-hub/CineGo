import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';


const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  const navType = useNavigationType();
  const userInteractedRef = useRef(false);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const handleBeforeUnload = () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const resetAllScrolls = () => {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const rootEl = document.getElementById('root');
    if (rootEl) rootEl.scrollTop = 0;
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
  };

  useLayoutEffect(() => {
    userInteractedRef.current = false;
    resetAllScrolls();

    const onUserScroll = (e) => {
      if (e.isTrusted) {
        userInteractedRef.current = true;
      }
    };

    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });
    window.addEventListener('keydown', onUserScroll, { passive: true });

    const delays = [0, 40, 100, 200, 350, 550, 850, 1200];
    const timerIds = delays.map((delay) =>
      setTimeout(() => {
        if (!userInteractedRef.current) {
          resetAllScrolls();
        }
      }, delay)
    );

    return () => {
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchmove', onUserScroll);
      window.removeEventListener('keydown', onUserScroll);
      timerIds.forEach(clearTimeout);
    };
  }, [pathname, search, navType]);

  useEffect(() => {
    const handleNav = () => {
      userInteractedRef.current = false;
      resetAllScrolls();
      setTimeout(resetAllScrolls, 50);
      setTimeout(resetAllScrolls, 200);
    };

    window.addEventListener('popstate', handleNav);
    window.addEventListener('pageshow', handleNav);

    return () => {
      window.removeEventListener('popstate', handleNav);
      window.removeEventListener('pageshow', handleNav);
    };
  }, []);

  return null;
};

export default ScrollToTop;
