
const insertablesBody = document.getElementById('insertables-body');
const snackbar = document.getElementById('snackbar');
const toastMessage = document.getElementById('toast-message');
const toast = bootstrap.Toast.getOrCreateInstance(snackbar, {
  delay: 2500,
  autohide: true
});

function showToast(message, type = 'success') {
  toastMessage.textContent = message;
  snackbar.classList.toggle('text-bg-success', type !== 'error');
  snackbar.classList.toggle('text-bg-danger', type === 'error');
  toast.show();
}

// Function to create a new row in the insertables table
function createInsertableRow(insertable = {}) {
  const row = document.createElement('tr');
  row.dataset.id = insertable.id || crypto.randomUUID();

  const keyCell = document.createElement('td');
  const keyInput = document.createElement('input');
  keyInput.type = 'text';
  keyInput.className = 'form-control';
  keyInput.value = insertable.key || '';
  keyInput.setAttribute('aria-label', 'Insertable name');
  keyInput.placeholder = 'e.g. LinkedIn';
  keyCell.append(keyInput);

  const valueCell = document.createElement('td');
  const valueInput = document.createElement('textarea');
  valueInput.className = 'form-control';
  valueInput.value = insertable.value || '';
  valueInput.setAttribute('aria-label', 'Text to insert');
  valueInput.placeholder = 'Enter the text to insert';
  valueCell.append(valueInput);

  const actionCell = document.createElement('td');
  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'btn btn-outline-danger btn-sm';
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', () => row.remove());
  actionCell.append(removeButton);

  row.append(keyCell, valueCell, actionCell);
  insertablesBody.append(row);
}

// Chrome storage retrieval and initialization
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['insertables'], (result) => {
    const insertables = Array.isArray(result.insertables)
      ? result.insertables
      : [];

    insertables.forEach(createInsertableRow);
  });
});

document.getElementById('add').addEventListener('click', () => {
  createInsertableRow();
});

document.getElementById('save').addEventListener('click', () => {
  const insertables = Array.from(insertablesBody.rows, (row) => {
    const [keyInput, valueInput] = row.querySelectorAll('input, textarea');
    return {
      id: row.dataset.id,
      key: keyInput.value.trim(),
      value: valueInput.value
    };
  }).filter((insertable) => insertable.key || insertable.value);

  if (insertables.some((insertable) => !insertable.key || !insertable.value)) {
    showToast('Each insertable needs a name and text.', 'error');
    return;
  }

  chrome.storage.sync.set({ insertables }, () => {
    if (chrome.runtime.lastError) {
      showToast('Could not save insertables. Try removing some entries.', 'error');
      return;
    }

    showToast('Saved successfully!');
  });
});
