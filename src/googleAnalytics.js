const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

let initialized = false;
let historyPatched = false;

function ensureHistoryTracking() {
  if (historyPatched || typeof window === "undefined") return;

  const dispatchNavigationEvent = () => {
    window.dispatchEvent(new Event("ga:navigation"));
  };

  const originalPushState = history.pushState.bind(history);
  const originalReplaceState = history.replaceState.bind(history);

  history.pushState = function pushState(...args) {
    originalPushState(...args);
    dispatchNavigationEvent();
  };

  history.replaceState = function replaceState(...args) {
    originalReplaceState(...args);
    dispatchNavigationEvent();
  };

  historyPatched = true;
}

export function initGoogleAnalytics() {
  if (initialized || !GA_MEASUREMENT_ID || typeof window === "undefined") return;

  initialized = true;
  ensureHistoryTracking();

  if (!document.getElementById("ga4-script")) {
    const script = document.createElement("script");
    script.id = "ga4-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args) => {
    window.dataLayer.push(args);
  };

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { send_page_view: false });

  const trackPageView = () => {
    window.gtag("config", GA_MEASUREMENT_ID, {
      page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    });
  };

  trackPageView();
  window.addEventListener("popstate", trackPageView);
  window.addEventListener("ga:navigation", trackPageView);
}