// Listen for messages from popup
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log('Message received:', request); // Debug log
    if (request.type === 'settingsChanged') {
      if (request.antisocialMode !== undefined) {
        antisocialMode = request.antisocialMode;
      }
      if (request.notificationsDisabled !== undefined) {
        notificationsDisabled = request.notificationsDisabled;
      }
      modifyTwitter(); // Apply changes immediately
    }
  }
);

let antisocialMode = true;
let notificationsDisabled = true;

// Load initial settings
chrome.storage.sync.get(['antisocialMode', 'notificationsDisabled'], function(result) {
  antisocialMode = result.antisocialMode !== false;
  notificationsDisabled = result.notificationsDisabled !== false;
  modifyTwitter();
});

// Listen for setting changes
chrome.storage.onChanged.addListener(function(changes) {
  if (changes.antisocialMode) {
    antisocialMode = changes.antisocialMode.newValue;
  }
  if (changes.notificationsDisabled) {
    notificationsDisabled = changes.notificationsDisabled.newValue;
  }
  modifyTwitter();
});

function modifyTwitter() {
  // Define selectors for elements to hide
  const elementsToHide = [
    '[data-testid="retweet"] [data-testid="app-text-transition-container"]',
    '[data-testid="like"] div[dir="ltr"] span',
    '[data-testid="reply"] div[dir="ltr"] span',
    '[data-testid="views"]',
    'a[href$="/followers"]',
    'a[href$="/following"]',
    'a[href$="/verified_followers"]',
    // For retweeted posts
    'div[style*="color: rgb(0, 186, 124)"] [data-testid="app-text-transition-container"]',
    // For like counts on retweeted posts
    'div[style*="color: rgb(249, 24, 128)"] [data-testid="app-text-transition-container"]'
  ];

  const additionalElementsToHide = [
    '[data-testid="socialContext"]', // "Followed by" section
    '[data-testid="UserName"] span:not(:first-child)', // Hide additional spans but keep the username
    'a[href$="/followers_you_follow"]', // "Followers you know" section
    '[role="link"][aria-label="Followers you know"]' // Another possible selector for "Followers you know"
  ];

  // First, restore elements if features are disabled
  if (!antisocialMode) {
    // Restore all elements hidden by antisocial mode
    elementsToHide.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.style.display = '';
      });
    });
    document.querySelectorAll('a[href$="/analytics"]').forEach(element => {
      element.style.display = '';
    });
    additionalElementsToHide.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.style.display = '';
      });
    });
    // Restore text-based hidden elements
    document.querySelectorAll('*').forEach(element => {
      if (element.childNodes.length === 1 && 
          element.childNodes[0].nodeType === Node.TEXT_NODE && 
          !element.closest('[role="tab"]')) {
        const text = element.textContent.toLowerCase();
        if (text.includes('followed by') || text.includes('followers')) {
          element.style.display = '';
        }
      }
    });
  }

  if (!notificationsDisabled) {
    // Restore notification elements
    document.querySelectorAll('div[aria-label*="unread items"], .css-146c3p1[aria-live="polite"]')
      .forEach(element => {
        element.style.display = '';
      });
  }

  // Then proceed with hiding elements if features are enabled
  if (antisocialMode) {
    // Hide metric counts and other elements
    elementsToHide.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.style.display = 'none';
      });
    });

    // Hide analytics
    document.querySelectorAll('a[href$="/analytics"]').forEach(element => {
      element.style.display = 'none';
    });

    // Hide additional elements
    additionalElementsToHide.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.style.display = 'none';
      });
    });

    // Hide text-based elements
    document.querySelectorAll('*').forEach(element => {
      if (element.childNodes.length === 1 && 
          element.childNodes[0].nodeType === Node.TEXT_NODE && 
          !element.closest('[role="tab"]')) {
        const text = element.textContent.toLowerCase();
        if (text.includes('followed by') || text.includes('followers')) {
          element.style.display = 'none';
        }
      }
    });
  }

  // Handle notification dot/number
  if (notificationsDisabled) {
    // Hide the notification number/dot
    document.querySelectorAll('div[aria-label*="unread items"]').forEach(element => {
      element.style.display = 'none';
    });
    
    // Also hide by specific class combination
    document.querySelectorAll('.css-146c3p1[aria-live="polite"]').forEach(element => {
      element.style.display = 'none';
    });
  }
}

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver(modifyTwitter);

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true, characterData: true });

// Run the function periodically to catch any missed elements
setInterval(modifyTwitter, 1000);