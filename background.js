chrome.tabs.onRemoved.addListener(tabId => {
  chrome.declarativeNetRequest.updateSessionRules({ removeRuleIds: [tabId + 1] })
    .catch(error => console.error(error));
});
