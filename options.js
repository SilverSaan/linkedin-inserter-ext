
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['linkedinUrl'], (result) => {
    if (result.linkedinUrl) {
      document.getElementById('linkedin-url').value = result.linkedinUrl;
    }
  });
});


document.getElementById('save').addEventListener('click', () =>
  {
    const url = document.getElementById('linkedin-url').value;
    chrome.storage.sync.set({linkedinUrl: url }, () => {
      console.log("Saved");
      status.textContent = 'Saved successfully!';
      setTimeout(() => { status.textContent = ''; }, 2000);
    });
  });
