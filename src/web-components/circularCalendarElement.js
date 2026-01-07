import { svgSize } from '../config/config.js';
import { createCalendarRenderer } from '../renderer/calendarRenderer.js';

const parseIsoValue = (value) => {
  const raw = String(value);
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (dateMatch) {
    const year = Number(dateMatch[1]);
    const month = Number(dateMatch[2]);
    const day = Number(dateMatch[3]);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  const dateTimeMatch = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(raw);
  if (!dateTimeMatch) return null;
  const year = Number(dateTimeMatch[1]);
  const month = Number(dateTimeMatch[2]);
  const day = Number(dateTimeMatch[3]);
  const hour = Number(dateTimeMatch[4]);
  const minute = Number(dateTimeMatch[5]);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;
  return new Date(year, month - 1, day, hour, minute, 0, 0);
};

const toIsoDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const toIsoDateTime = (date) => {
  const base = toIsoDate(date);
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${base}T${hh}:${mm}`;
};

const parseBooleanAttributeValue = (value) => {
  // Boolean attribute semantics: present => true, unless explicitly "false"/"0".
  if (value == null) return true;
  const raw = String(value).trim().toLowerCase();
  if (raw === '' || raw === 'true' || raw === '1') return true;
  if (raw === 'false' || raw === '0') return false;
  return true;
};

export class CircularCalendarElement extends HTMLElement {
  static observedAttributes = ['value', 'name', 'include-time', 'is12hourclock'];

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

    this._renderer = createCalendarRenderer(this._svg, {
      timeSelectionEnabled: this.includeTime,
      is12HourClock: this.is12HourClock
    });
    this._renderer.drawCalendar();
    this._renderer.drawCircle();

    const initial = parseIsoValue(this.getAttribute('value')) ?? new Date();
    this._applyDate(initial, { emit: false, updateRenderer: true });

    this._unsubscribe = this._renderer.subscribeToDateChanges((date) => {
      if (this._suppressRendererNotification) return;
      // Sun drag (and other internal changes) should behave like user input.
      this._applyDate(date, { emit: true, updateRenderer: false });
    });

    this._dateInput.addEventListener('input', () => {
      const parsed = parseIsoValue(this._dateInput.value);
      if (!parsed) return;
      const hours = this.includeTime && this._selectedDate ? this._selectedDate.getHours() : 0;
      const minutes = this.includeTime && this._selectedDate ? this._selectedDate.getMinutes() : 0;
      const date = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), hours, minutes, 0, 0);
      // Native input event is already composed and bubbles to the host.
      this._applyDate(date, { emit: false, updateRenderer: true });
    });

    this._dateInput.addEventListener('change', () => {
      const parsed = parseIsoValue(this._dateInput.value);
      if (!parsed) return;
      const hours = this.includeTime && this._selectedDate ? this._selectedDate.getHours() : 0;
      const minutes = this.includeTime && this._selectedDate ? this._selectedDate.getMinutes() : 0;
      const date = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate(), hours, minutes, 0, 0);
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

    if (name === 'include-time' || name === 'is12hourclock') {
      this._renderer?.setTimeSelectionOptions?.({
        timeSelectionEnabled: this.includeTime,
        is12HourClock: this.is12HourClock
      });
      // Re-apply to ensure attribute/value formatting matches the current mode.
      if (this._selectedDate) {
        this._applyDate(this._selectedDate, { emit: false, updateRenderer: true });
      }
      return;
    }

    if (name === 'value') {
      if (this._isApplyingExternalValue) return;
      const date = parseIsoValue(newValue);
      if (!date) return;
      this._applyDate(date, { emit: false, updateRenderer: true });
    }
  }

  get includeTime() {
    return this.hasAttribute('include-time');
  }

  set includeTime(next) {
    const enabled = Boolean(next);
    if (enabled) this.setAttribute('include-time', '');
    else this.removeAttribute('include-time');
  }

  get is12HourClock() {
    // Boolean attribute (preferred): present => true, absent => false,
    // but allow explicit "false"/"0" values.
    if (!this.hasAttribute('is12HourClock')) return false;
    return parseBooleanAttributeValue(this.getAttribute('is12HourClock'));
  }

  set is12HourClock(next) {
    const enabled = Boolean(next);
    if (enabled) this.setAttribute('is12HourClock', '');
    else this.removeAttribute('is12HourClock');
  }

  get value() {
    if (!this._selectedDate) return '';
    return this.includeTime ? toIsoDateTime(this._selectedDate) : toIsoDate(this._selectedDate);
  }

  set value(next) {
    const date = parseIsoValue(next);
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
    const hours = this.includeTime ? date.getHours() : 0;
    const minutes = this.includeTime ? date.getMinutes() : 0;
    const safeDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
    const iso = this.includeTime ? toIsoDateTime(safeDate) : toIsoDate(safeDate);

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
    this._dateInput.value = toIsoDate(safeDate);

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

