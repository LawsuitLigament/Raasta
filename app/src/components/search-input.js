// ============================================
// Search Input Component — Searchable Dropdown
// ============================================

import { searchStations, LINES } from '../data/metro-data.js';

export function createSearchInput({ id, label, icon, placeholder, onSelect, initialValue }) {
  const wrapper = document.createElement('div');
  wrapper.className = 'input-group';
  wrapper.id = id;

  wrapper.innerHTML = `
    <label class="input-label" for="${id}-input">${label}</label>
    <div class="input-wrapper">
      <span class="input-icon">${icon}</span>
      <input
        type="text"
        id="${id}-input"
        class="input-field"
        placeholder="${placeholder}"
        autocomplete="off"
        spellcheck="false"
        value="${initialValue || ''}"
      />
      <button class="input-clear" id="${id}-clear" aria-label="Clear">✕</button>
      <div class="dropdown-list" id="${id}-dropdown"></div>
    </div>
  `;

  const input = wrapper.querySelector(`#${id}-input`);
  const dropdown = wrapper.querySelector(`#${id}-dropdown`);
  const clearBtn = wrapper.querySelector(`#${id}-clear`);
  let selectedStation = null;
  let highlightIndex = -1;
  let currentResults = [];

  function showDropdown(query) {
    currentResults = searchStations(query);
    highlightIndex = -1;
    
    if (currentResults.length === 0) {
      dropdown.innerHTML = '<div class="dropdown-empty">No stations found</div>';
    } else {
      dropdown.innerHTML = currentResults.slice(0, 50).map((station, i) => `
        <div class="dropdown-item" data-id="${station.id}" data-index="${i}">
          <span class="station-name">${highlightMatch(station.name, query)}</span>
          <span class="line-badges">
            ${station.lines.map(l => 
              `<span class="line-badge-mini" style="background-color: ${LINES[l]?.color || '#888'}"></span>`
            ).join('')}
          </span>
        </div>
      `).join('');
    }
    
    dropdown.classList.add('open');
  }

  function hideDropdown() {
    setTimeout(() => {
      dropdown.classList.remove('open');
    }, 150);
  }

  function highlightMatch(name, query) {
    if (!query) return name;
    const idx = name.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return name;
    return name.slice(0, idx) + 
      `<strong style="color: var(--accent-primary)">${name.slice(idx, idx + query.length)}</strong>` + 
      name.slice(idx + query.length);
  }

  function selectStation(stationId, stationName) {
    selectedStation = stationId;
    input.value = stationName;
    dropdown.classList.remove('open');
    if (onSelect) onSelect(stationId);
  }

  // Event listeners
  input.addEventListener('focus', () => {
    showDropdown(input.value);
  });

  input.addEventListener('input', (e) => {
    selectedStation = null;
    showDropdown(e.target.value);
    if (onSelect) onSelect(null);
  });

  input.addEventListener('blur', hideDropdown);

  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.dropdown-item');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      highlightIndex = Math.min(highlightIndex + 1, items.length - 1);
      updateHighlight(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      highlightIndex = Math.max(highlightIndex - 1, 0);
      updateHighlight(items);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightIndex >= 0 && items[highlightIndex]) {
        const id = items[highlightIndex].dataset.id;
        const station = currentResults.find(s => s.id === id);
        if (station) selectStation(station.id, station.name);
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      input.blur();
    }
  });

  dropdown.addEventListener('mousedown', (e) => {
    e.preventDefault(); // Prevent blur
    const item = e.target.closest('.dropdown-item');
    if (item) {
      const id = item.dataset.id;
      const station = currentResults.find(s => s.id === id);
      if (station) selectStation(station.id, station.name);
    }
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    selectedStation = null;
    input.focus();
    if (onSelect) onSelect(null);
  });

  function updateHighlight(items) {
    items.forEach((item, i) => {
      item.classList.toggle('highlighted', i === highlightIndex);
    });
    if (items[highlightIndex]) {
      items[highlightIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  // Public API
  wrapper.getSelectedStation = () => selectedStation;
  wrapper.setStation = (stationId, stationName) => {
    selectedStation = stationId;
    input.value = stationName || '';
  };
  wrapper.clear = () => {
    input.value = '';
    selectedStation = null;
  };
  wrapper.focus = () => input.focus();

  return wrapper;
}
