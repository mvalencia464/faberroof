/**
 * DOM adapter for US address autocomplete.
 * Works with plain inputs + a listbox container.
 */

import {
  enrichAddressWithZip,
  fetchUsAddressSuggestions,
  type AddressParts,
  type FetchOptions,
} from './usAddressAutocomplete';

export type AttachAddressAutocompleteOptions = FetchOptions & {
  root: HTMLElement;
  addressInput: HTMLInputElement;
  cityInput?: HTMLInputElement | null;
  zipInput?: HTMLInputElement | null;
  stateInput?: HTMLInputElement | null;
  listbox: HTMLElement;
  debounceMs?: number;
};

export function attachAddressAutocomplete(opts: AttachAddressAutocompleteOptions): () => void {
  const {
    root,
    addressInput,
    cityInput,
    zipInput,
    stateInput,
    listbox,
    debounceMs = 320,
    ...fetchOpts
  } = opts;

  let timer: ReturnType<typeof setTimeout> | null = null;
  let items: AddressParts[] = [];
  let activeIndex = -1;
  let requestId = 0;
  let open = false;
  let abort: AbortController | null = null;

  const listId = listbox.id || 'address-suggestions';
  listbox.id = listId;
  listbox.setAttribute('role', 'listbox');
  listbox.hidden = true;

  addressInput.setAttribute('role', 'combobox');
  addressInput.setAttribute('aria-autocomplete', 'list');
  addressInput.setAttribute('aria-expanded', 'false');
  addressInput.setAttribute('aria-controls', listId);
  addressInput.setAttribute('autocomplete', 'off');

  function setOpen(next: boolean) {
    open = next;
    listbox.hidden = !next;
    addressInput.setAttribute('aria-expanded', next ? 'true' : 'false');
    if (!next) {
      activeIndex = -1;
      addressInput.removeAttribute('aria-activedescendant');
    }
  }

  function render() {
    listbox.replaceChildren();
    if (!items.length) {
      setOpen(false);
      return;
    }

    items.forEach((item, i) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'address-ac__option';
      option.id = `${listId}-opt-${i}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', i === activeIndex ? 'true' : 'false');
      if (i === activeIndex) option.classList.add('is-active');
      option.textContent = item.display;
      option.addEventListener('mousedown', (e) => {
        e.preventDefault();
        void selectIndex(i);
      });
      listbox.appendChild(option);
    });
    setOpen(true);
  }

  function highlight(index: number) {
    activeIndex = index;
    const options = listbox.querySelectorAll<HTMLElement>('[role="option"]');
    options.forEach((el, i) => {
      const on = i === activeIndex;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) el.scrollIntoView({ block: 'nearest' });
    });
    if (activeIndex >= 0) {
      addressInput.setAttribute('aria-activedescendant', `${listId}-opt-${activeIndex}`);
    } else {
      addressInput.removeAttribute('aria-activedescendant');
    }
  }

  async function selectIndex(index: number) {
    const raw = items[index];
    if (!raw) return;

    let selected = raw;
    if (!selected.zip || !selected.city) {
      selected = await enrichAddressWithZip(selected, fetchOpts);
    }

    addressInput.value = selected.line1;
    if (cityInput) cityInput.value = selected.city || cityInput.value;
    if (zipInput && selected.zip) zipInput.value = selected.zip;
    if (stateInput && selected.state) stateInput.value = selected.state;

    items = [];
    setOpen(false);
    addressInput.dispatchEvent(new Event('change', { bubbles: true }));
  }

  async function runSearch(query: string) {
    const id = ++requestId;
    abort?.abort();
    abort = new AbortController();
    const signal = abort.signal;
    try {
      const results = await fetchUsAddressSuggestions(query, { ...fetchOpts, signal });
      if (id !== requestId || signal.aborted) return;
      items = results;
      activeIndex = results.length ? 0 : -1;
      render();
      if (activeIndex >= 0) highlight(activeIndex);
    } catch {
      if (id !== requestId || signal.aborted) return;
      items = [];
      setOpen(false);
    }
  }

  function onInput() {
    if (timer) clearTimeout(timer);
    const q = addressInput.value;
    timer = setTimeout(() => {
      void runSearch(q);
    }, debounceMs);
  }

  function onKeyDown(e: KeyboardEvent) {
    const key = e.key;

    if (key === 'Escape') {
      if (open) {
        e.preventDefault();
        setOpen(false);
      }
      return;
    }

    // Open / fetch on arrow if the list isn't showing yet
    if ((key === 'ArrowDown' || key === 'ArrowUp') && !open) {
      const q = addressInput.value.trim();
      if (q.length >= 3) {
        e.preventDefault();
        if (items.length) {
          setOpen(true);
          highlight(key === 'ArrowUp' ? items.length - 1 : 0);
        } else {
          void runSearch(q);
        }
      }
      return;
    }

    if (!open || !items.length) return;

    if (key === 'ArrowDown') {
      e.preventDefault();
      e.stopPropagation();
      const next = activeIndex < 0 ? 0 : Math.min(activeIndex + 1, items.length - 1);
      highlight(next);
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      const next = activeIndex < 0 ? items.length - 1 : Math.max(activeIndex - 1, 0);
      highlight(next);
    } else if (key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      e.stopPropagation();
      void selectIndex(activeIndex);
    } else if (key === 'Home') {
      e.preventDefault();
      highlight(0);
    } else if (key === 'End') {
      e.preventDefault();
      highlight(items.length - 1);
    }
  }

  function onDocPointer(e: MouseEvent) {
    if (!open) return;
    const t = e.target as Node | null;
    if (t && root.contains(t)) return;
    setOpen(false);
  }

  function onBlur() {
    // Delay so mousedown on option can fire first
    window.setTimeout(() => {
      if (!listbox.contains(document.activeElement) && document.activeElement !== addressInput) {
        setOpen(false);
      }
    }, 150);
  }

  addressInput.addEventListener('input', onInput);
  addressInput.addEventListener('keydown', onKeyDown);
  addressInput.addEventListener('blur', onBlur);
  document.addEventListener('mousedown', onDocPointer);

  return () => {
    if (timer) clearTimeout(timer);
    abort?.abort();
    addressInput.removeEventListener('input', onInput);
    addressInput.removeEventListener('keydown', onKeyDown);
    addressInput.removeEventListener('blur', onBlur);
    document.removeEventListener('mousedown', onDocPointer);
    setOpen(false);
  };
}
