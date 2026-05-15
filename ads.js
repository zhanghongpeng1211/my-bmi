// My-BMI.net Unified Ad System
// Placeholder for Google AdSense / Affiliate ads
// Replace ad-slot content with real ad code when approved

(function() {
  'use strict';

  // Ad configuration
  const AD_CONFIG = {
    // Google AdSense (replace with your publisher ID)
    adsense: {
      enabled: false,
      client: 'ca-pub-XXXXXXXXXXXXXXXX',
      slots: {
        inline: 'XXXXXXXXXX',
        sidebar: 'XXXXXXXXXX'
      }
    },
    // Affiliate placeholders
    affiliate: {
      enabled: false,
      links: []
    }
  };

  // Initialize ads when DOM ready
  function initAds() {
    const slots = document.querySelectorAll('.ad-slot, .ad-slot-inline');

    slots.forEach(slot => {
      // If AdSense enabled, inject real ads
      if (AD_CONFIG.adsense.enabled) {
        injectAdSense(slot);
      }
      // Otherwise keep placeholder (for development/preview)
    });
  }

  function injectAdSense(slot) {
    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.style.display = 'block';
    ins.setAttribute('data-ad-client', AD_CONFIG.adsense.client);
    ins.setAttribute('data-ad-slot', AD_CONFIG.adsense.slots.inline);
    ins.setAttribute('data-ad-format', 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');

    slot.innerHTML = '';
    slot.appendChild(ins);

    if (window.adsbygoogle) {
      adsbygoogle.push({});
    }
  }

  // Run when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAds);
  } else {
    initAds();
  }
})();
