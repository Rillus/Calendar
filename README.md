# Circular Calendar

A modern SVG-based circular calendar visualisation with seasonal colour gradients and notched design for varying month lengths.

## Features

- **Circular Design**: 12-month radial calendar with custom seasonal colour palette
- **Notched Months**: Visual representation of month lengths (30-day months and February are notched)
- **Interactive**: Hover and click segments to see month names in the centre
- **Responsive**: Scales beautifully with SVG viewBox
- **Modern Architecture**: Modular ES6 codebase for maintainability
- **Web component**: Use the calendar as a standalone `<circular-calendar>` custom element, with a selected date value that can be submitted in a form

## Setup

### Prerequisites

- Node.js and npm (for local development server)
- Or any local web server (Python, PHP, etc.)

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

#### Option 1: Using npm (Recommended)

```bash
npm run dev
```

This will start a local development server at `http://localhost:8000`

#### Option 2: Using Python

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

#### Option 3: Using PHP

```bash
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Important Note

**This project uses ES6 modules and requires a web server to run.** You cannot simply open `index.html` in a browser due to CORS restrictions on ES6 module imports. Always use a local web server.

## Project Structure

```
Calendar/
├── index.html              # Main HTML file
├── styles.css              # Styles
├── src/                    # Source code
│   ├── main.js             # Main entry point (initialisation)
│   ├── config/             # Configuration
│   │   └── config.js       # Constants and configuration
│   ├── utils/              # Utility modules
│   │   ├── colorUtils.js   # Colour conversion utilities
│   │   ├── mathUtils.js    # Mathematical helper functions
│   │   └── svgUtils.js     # SVG path creation utilities
│   └── renderer/           # Rendering logic
│       └── calendarRenderer.js  # Calendar drawing and rendering
├── tests/                  # Test files
│   ├── *.test.js           # Unit tests for each module
├── package.json            # npm configuration
├── vitest.config.js        # Vitest configuration
├── README.md               # This file
└── .cursorrules            # Cursor AI instructions
```

**Note**: `cal-bundled.js` exists as a legacy single-file version but is not used. The project uses ES6 modules.

## Architecture

The codebase is split into logical modules:

- **config.js**: All constants (month colours, names, days, dimensions)
- **colorUtils.js**: RGB to hex conversion, colour interpolation
- **mathUtils.js**: Angle conversions, coordinate transformations
- **svgUtils.js**: SVG path generation for arcs
- **calendarRenderer.js**: Main rendering logic (drawCalendar, drawCircle, writeSegmentName)
- **cal.js**: Initialisation and orchestration

## Development

### Test-Driven Development (TDD)

This project uses **TDD (Test-Driven Development)** as the primary development methodology:

1. **Write tests first**: Before implementing any feature, write the test(s) that define the expected behaviour
2. **Red-Green-Refactor cycle**:
   - **Red**: Write a failing test
   - **Green**: Write the minimum code to make it pass
   - **Refactor**: Improve the code while keeping tests green
3. **Run tests**: 
   - `npm test` - Run tests once and exit
   - `npm run test:watch` - Run tests in watch mode

### Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Adding Features

When adding new features:

1. **Write tests first** (TDD requirement)
2. Keep modules focused on single responsibilities
3. Use ES6 modules (import/export)
4. Follow the existing code style (British English, descriptive names)
5. Update this README if adding new dependencies or setup steps

### Test File Organisation

- Test files use `.test.js` or `.spec.js` naming
- Tests are co-located with source files or in `__tests__` directories
- Example: `mathUtils.test.js` tests `mathUtils.js`

### Code Style

- Use `const` and `let` (no `var`)
- Use arrow functions where appropriate
- Keep functions small and focused
- Comment complex logic
- Use British English spelling

## Browser Support

Modern browsers with ES6 module support:
- Chrome 61+
- Firefox 60+
- Safari 11+
- Edge 16+

## Future Enhancements

- [ ] Zoom levels (year → month → week → day)
- [ ] D3.js integration for advanced interactions
- [ ] Date information display
- [ ] Event/calendar data integration
- [ ] Customisable colour schemes

## Web component usage

The project ships a standalone custom element: `<circular-calendar>`.

- **Selected date input**: set/read via the `value` attribute/property (`YYYY-MM-DD`)
- **Form submission**: set `name` and the selected date will be included in `FormData`

## Production build (minified bundle)

To use the web component in production without ES module imports, you can generate a single minified bundle:

```bash
npm run build
```

This outputs `dist/circular-calendar.min.js` (gitignored). When loaded, it **auto-defines** the `<circular-calendar>` element.
This outputs `dist/circular-calendar.min.js` (committed). When loaded, it **auto-defines** the `<circular-calendar>` element.

Example:

```html
<circular-calendar name="selectedDate" value="2026-01-15"></circular-calendar>
<script src="./dist/circular-calendar.min.js"></script>
```

Example:

```html
<form id="demo">
  <circular-calendar name="selectedDate" value="2026-01-15"></circular-calendar>
  <button type="submit">Submit</button>
</form>

<script type="module">
  import { defineCircularCalendarElement } from './src/web-components/circularCalendarElement.js';
  defineCircularCalendarElement();

  document.getElementById('demo').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    console.log(fd.get('selectedDate'));
  });
</script>
```

