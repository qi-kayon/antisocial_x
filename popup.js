document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get(['antisocialMode', 'notificationsDisabled'], function(result) {
    document.getElementById('antisocialToggle').checked = result.antisocialMode !== false;
    document.getElementById('notificationToggle').checked = result.notificationsDisabled !== false;
  });

  // Save settings and notify content script when changed
  document.getElementById('antisocialToggle').addEventListener('change', function(e) {
    chrome.storage.sync.set({
      antisocialMode: e.target.checked
    });
    // Send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'settingsChanged',
        antisocialMode: e.target.checked
      });
    });
  });

  document.getElementById('notificationToggle').addEventListener('change', function(e) {
    chrome.storage.sync.set({
      notificationsDisabled: e.target.checked
    });
    // Send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'settingsChanged',
        notificationsDisabled: e.target.checked
      });
    });
  });
});