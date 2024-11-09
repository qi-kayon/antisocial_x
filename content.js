function modifyTwitter() {
  // Hide metric counts, retweet icon, and following/followers elements
  const elementsToHide = [
    '[data-testid="retweet"]',
    '[data-testid="like"] div[dir="ltr"] span',
    '[data-testid="reply"] div[dir="ltr"] span',
    '[data-testid="views"]',
    'a[href$="/followers"]',
    'a[href$="/following"]',
    'a[href$="/verified_followers"]'
  ];
  elementsToHide.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      element.style.display = 'none';
    });
  });

  // Hide elements with links ending in "/analytics" and their parent elements
  document.querySelectorAll('a[href$="/analytics"]').forEach(element => {
    element.style.display = 'none';
    if (element.parentElement) {
      element.parentElement.style.display = 'none';
    }
  });

  // Hide any remaining metrics and "Followed by" section
  const additionalElementsToHide = [
    '[data-testid="app-text-transition-container"]',
    '[data-testid="socialContext"]', // "Followed by" section
    '[data-testid="UserName"] span:not(:first-child)', // Hide additional spans but keep the username
    'a[href$="/followers_you_follow"]', // "Followers you know" section
    '[role="link"][aria-label="Followers you know"]' // Another possible selector for "Followers you know"
  ];
  additionalElementsToHide.forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      element.style.display = 'none';
    });
  });

  // Hide any elements with text containing "Followed by", "following", or "followers"
  document.querySelectorAll('*').forEach(element => {
    if (element.childNodes.length === 1 && 
        element.childNodes[0].nodeType === Node.TEXT_NODE && 
        !element.closest('[role="tab"]')) { // Exclude tabs from being hidden
      const text = element.textContent.toLowerCase();
      if (text.includes('followed by') || text.includes('followers')) { // Remove 'following' from this check
        element.style.display = 'none';
      }
    }
  });
}

// Run the function initially
modifyTwitter();

// Create a MutationObserver to watch for changes in the DOM
const observer = new MutationObserver(modifyTwitter);

// Start observing the document with the configured parameters
observer.observe(document.body, { childList: true, subtree: true, characterData: true });

// Run the function periodically to catch any missed elements
setInterval(modifyTwitter, 1000);