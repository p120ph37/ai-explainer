/**
 * Local Development Beacon
 * 
 * A faithful implementation of the Cloudflare Web Analytics beacon logic
 * that sends events to the local dev server instead of Cloudflare.
 * 
 * Supports two modes:
 * - "lazy" (CF default): Sends beacon when leaving a page (visibilitychange, next navigation)
 * - "eager" (dev default): Sends beacon immediately on each navigation for instant feedback
 * 
 * Used when CF_BEACON_TOKEN is not set (i.e., in development mode).
 */

export interface LocalBeaconOptions {
  /** 
   * Beacon send mode:
   * - "lazy": Match CF behavior - send when leaving page (good for testing production behavior)
   * - "eager": Send immediately on navigation (good for dev feedback)
   */
  mode?: 'lazy' | 'eager';
}

/**
 * Generate the inline script for the local beacon
 * This is injected into the HTML in dev mode
 */
export function getLocalBeaconScript(options: LocalBeaconOptions = {}): string {
  const mode = options.mode || 'eager';
  
  return `
(function() {
  "use strict";

  const ENDPOINT = "/__analytics";
  const MODE = "${mode}"; // "lazy" = CF behavior, "eager" = immediate send

  // ===========================================================================
  // UUID GENERATION
  // ===========================================================================

  const HEX = Array.from({ length: 256 }, (_, i) => (i + 256).toString(16).slice(1));

  function uuid() {
    const b = new Uint8Array(16);
    crypto.getRandomValues(b);
    b[6] = (b[6] & 0x0f) | 0x40;
    b[8] = (b[8] & 0x3f) | 0x80;
    return [
      HEX[b[0]], HEX[b[1]], HEX[b[2]], HEX[b[3]], "-",
      HEX[b[4]], HEX[b[5]], "-", HEX[b[6]], HEX[b[7]], "-",
      HEX[b[8]], HEX[b[9]], "-", HEX[b[10]], HEX[b[11]], 
      HEX[b[12]], HEX[b[13]], HEX[b[14]], HEX[b[15]]
    ].join("");
  }

  // ===========================================================================
  // UTILITIES
  // ===========================================================================

  function getUrl(override) {
    if (override) {
      if (override.startsWith("/")) return location.origin + override;
      try {
        const u = new URL(override);
        return u.protocol + "//" + u.host + u.pathname;
      } catch {}
    }
    return location.origin + location.pathname;
  }

  function send(data) {
    const payload = JSON.stringify(data);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "application/json" }));
    } else {
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true
      }).catch(() => {});
    }
  }

  // ===========================================================================
  // STATE (matches CF beacon structure)
  // ===========================================================================

  let pageloadId = uuid();
  let pageViewHistory = [];  // Last 3 page views
  let currentPageView = null;
  let nextNavigationUrl = null;

  function getReferrer() {
    return pageViewHistory.length > 0 
      ? pageViewHistory[pageViewHistory.length - 1].url 
      : (document.referrer || "");
  }

  function recordPageView(url) {
    pageViewHistory.push({ id: pageloadId, url, ts: Date.now() });
    if (pageViewHistory.length > 3) pageViewHistory.shift();
  }

  // CF's shouldSendPageView: only send if this pageloadId isn't already recorded
  function shouldSendPageView() {
    return !pageViewHistory.some(pv => pv.id === pageloadId);
  }

  // ===========================================================================
  // BEACON PAYLOAD
  // ===========================================================================

  function buildPayload(url) {
    const currentUrl = url || getUrl();
    const nav = performance.getEntriesByType("navigation")[0];
    const paint = performance.getEntriesByType("paint");
    
    return {
      type: "page_view",
      mode: MODE,
      pageloadId,
      location: currentUrl,
      referrer: getReferrer(),
      title: document.title,
      timestamp: Date.now(),
      timing: {
        timeOrigin: performance.timeOrigin,
        firstPaint: paint.find(e => e.name === "first-paint")?.startTime || 0,
        firstContentfulPaint: paint.find(e => e.name === "first-contentful-paint")?.startTime || 0,
        domContentLoaded: nav?.domContentLoadedEventEnd || 0,
        load: nav?.loadEventEnd || 0
      }
    };
  }

  function sendPageView(url, reason) {
    const data = buildPayload(url);
    data.reason = reason; // For debugging: "initial", "navigation", "visibility", etc.
    send(data);
    console.log("📊 [Local Beacon]", reason + ":", data.location);
  }

  // ===========================================================================
  // EVENT HANDLERS
  // ===========================================================================

  // Initial page load - always send immediately
  function onLoad() {
    sendPageView(null, "initial");
    currentPageView = { id: pageloadId, url: getUrl(), ts: Date.now(), triggered: true };
  }

  if (document.readyState === "complete") {
    onLoad();
  } else {
    addEventListener("load", () => setTimeout(onLoad));
  }

  // Page visibility change - send beacon for current page if not already recorded
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "hidden") return;
    
    const currentUrl = getUrl();
    
    if (shouldSendPageView()) {
      if (currentPageView?.url !== currentUrl || !currentPageView?.triggered) {
        sendPageView(currentUrl, "visibility-hidden");
      }
      recordPageView(currentUrl);
    }
  });

  // ===========================================================================
  // SPA: History API Patching
  // ===========================================================================

  const origPushState = window.history.pushState;

  window.history.pushState = function(state, title, url) {
    const currentUrl = getUrl();
    nextNavigationUrl = getUrl(url);
    
    if (nextNavigationUrl !== currentUrl) {
      if (MODE === "eager") {
        // EAGER MODE: Send beacon for the NEW page immediately
        // Record the old page first
        recordPageView(currentUrl);
        // Generate new ID for new page
        pageloadId = uuid();
        // Send beacon for new page right away
        sendPageView(nextNavigationUrl, "navigation");
        currentPageView = { id: pageloadId, url: nextNavigationUrl, ts: Date.now(), triggered: true };
      } else {
        // LAZY MODE (CF behavior): Send beacon for OLD page, record it, then switch
        if (shouldSendPageView()) {
          if (currentPageView?.url !== currentUrl || !currentPageView?.triggered) {
            sendPageView(currentUrl, "leaving-page");
          }
          recordPageView(currentUrl);
        }
        pageloadId = uuid();
      }
    }
    
    return origPushState.apply(this, arguments);
  };

  addEventListener("popstate", () => {
    const prevUrl = nextNavigationUrl || getUrl();
    nextNavigationUrl = getUrl();
    
    if (MODE === "eager") {
      // EAGER: Send for new page immediately
      recordPageView(prevUrl);
      pageloadId = uuid();
      sendPageView(nextNavigationUrl, "popstate");
      currentPageView = { id: pageloadId, url: nextNavigationUrl, ts: Date.now(), triggered: true };
    } else {
      // LAZY (CF behavior): Just record and update state
      if (shouldSendPageView()) {
        if (currentPageView?.url !== prevUrl || !currentPageView?.triggered) {
          sendPageView(prevUrl, "leaving-page-popstate");
        }
        recordPageView(prevUrl);
      }
      pageloadId = uuid();
    }
  });

  console.log("📊 [Local Beacon] Initialized (mode: " + MODE + ") - events → " + ENDPOINT);
})();
`.trim();
}
