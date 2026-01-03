import { svgSize } from '../config/config.js';
import { createCalendarRenderer } from '../renderer/calendarRenderer.js';

const parseIsoDate = (value) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  return new Date(year, month - 1, day);
};

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export class CircularCalendarElement extends HTMLElement {
  static observedAttributes = ['value', 'name'];

  constructor() {
    super();
    this._selectedDate = null;
    this._renderer = null;
    this._isConnected = false;
    this._isApplyingExternalValue = false;
    this._suppressRendererNotification = false;

    const root = this.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      :host { display: block; }
      .wrap { display: grid; gap: 10px; }
      svg { width: 100%; height: auto; display: block; aspect-ratio: 1; }
      .controls { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
      label { font: 500 0.95rem system-ui, -apple-system, Segoe UI, Roboto, Helvetica Neue, Arial, sans-serif; color: #333; }
      input[type="date"] { padding: 6px 10px; border: 1px solid #ccc; border-radius: 6px; font: inherit; }
    `.trim();

    const wrap = document.createElement('div');
    wrap.className = 'wrap';

    const controls = document.createElement('div');
    controls.className = 'controls';

    const label = document.createElement('label');
    label.textContent = 'Selected date:';

    this._dateInput = document.createElement('input');
    this._dateInput.type = 'date';

    controls.appendChild(label);
    controls.appendChild(this._dateInput);

    this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this._svg.setAttribute('part', 'svg');
    this._svg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
    this._svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    wrap.appendChild(controls);
    wrap.appendChild(this._svg);

    root.appendChild(style);
    root.appendChild(wrap);

    // Proxy input (light DOM) so regular <form> submission works everywhere (including jsdom).
    this._proxyInput = document.createElement('input');
    this._proxyInput.type = 'hidden';
    this._proxyInput.setAttribute('data-circular-calendar-proxy', 'true');
  }

  connectedCallback() {
    if (this._isConnected) return;
    this._isConnected = true;

    if (!this._proxyInput.isConnected) {
      this.appendChild(this._proxyInput);
    }

    this._renderer = createCalendarRenderer(this._svg);
    this._renderer.drawCalendar();
    this._renderer.drawCircle();

    const initial = parseIsoDate(this.getAttribute('value')) ?? new Date();
    this._applyDate(initial, { emit: false, updateRenderer: true });

    this._unsubscribe = this._renderer.subscribeToDateChanges((date) => {
      if (this._suppressRendererNotification) return;
      // Sun drag (and other internal changes) should behave like user input.
      this._applyDate(date, { emit: true, updateRenderer: false });
    });

    this._dateInput.addEventListener('input', () => {
      const date = parseIsoDate(this._dateInput.value);
      if (!date) return;
      // Native input event is already composed and bubbles to the host.
      this._applyDate(date, { emit: false, updateRenderer: true });
    });

    this._dateInput.addEventListener('change', () => {
      const date = parseIsoDate(this._dateInput.value);
      if (!date) return;
      // Native change event is already composed and bubbles to the host.
      this._applyDate(date, { emit: false, updateRenderer: true });
    });
  }

  disconnectedCallback() {
    this._unsubscribe?.();
    this._unsubscribe = null;
    this._isConnected = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;

    if (name === 'name') {
      this._syncProxyName();
      return;
    }

    if (name === 'value') {
      if (this._isApplyingExternalValue) return;
      const date = parseIsoDate(newValue);
      if (!date) return;
      this._applyDate(date, { emit: false, updateRenderer: true });
    }
  }

  get value() {
    return this._selectedDate ? toIsoDate(this._selectedDate) : '';
  }

  set value(next) {
    const date = parseIsoDate(next);
    if (!date) return;
    this._applyDate(date, { emit: false, updateRenderer: true });
  }

  get name() {
    return this.getAttribute('name') ?? '';
  }

  set name(next) {
    if (next == null) {
      this.removeAttribute('name');
      return;
    }
    this.setAttribute('name', String(next));
  }

  _syncProxyName() {
    const name = this.getAttribute('name') ?? '';
    this._proxyInput.name = name;
  }

  _syncProxyValue() {
    this._proxyInput.value = this.value;
  }

  _applyDate(date, { emit, updateRenderer }) {
    const safeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const iso = toIsoDate(safeDate);

    if (this.value === iso) {
      if (emit === 'input') {
        this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      } else if (emit === 'change') {
        this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      } else if (emit) {
        this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
      }
      return;
    }

    // Reflect into attribute without recursively re-processing it.
    this._isApplyingExternalValue = true;
    try {
      this.setAttribute('value', iso);
    } finally {
      this._isApplyingExternalValue = false;
    }

    this._selectedDate = safeDate;
    this._dateInput.value = iso;

    this._syncProxyName();
    this._syncProxyValue();

    if (updateRenderer && this._renderer) {
      // Keep calendar year consistent with selected date.
      this._suppressRendererNotification = true;
      try {
        this._renderer.setYear(safeDate.getFullYear());
        this._renderer.drawCalendar();
        this._renderer.drawCircle();
        this._renderer.selectDate(safeDate);
      } finally {
        this._suppressRendererNotification = false;
      }
    }

    if (emit === 'input') {
      this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    } else if (emit === 'change') {
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    } else if (emit) {
      this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }
  }
}

export function defineCircularCalendarElement() {
  if (customElements.get('circular-calendar')) return;
  customElements.define('circular-calendar', CircularCalendarElement);
}

