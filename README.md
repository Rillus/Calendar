# Circular Calendar

A modern SVG-based circular calendar visualisation with seasonal colour gradients and notched design for varying month lengths.

## Features

- **Circular Design**: 12-month radial calendar with custom seasonal colour palette
- **Notched Months**: Visual representation of month lengths (30-day months and February are notched)
- **Interactive**: Hover and click segments to see month names in the centre
- **Responsive**: Scales beautifully with SVG viewBox
- **Modern Architecture**: Modular ES6 codebase for maintainability

## Setup

### Prerequisites

- Node.js and npm (for local development server)
- Or any local web server (Python, PHP, etc.)

### Installation

1. Clone or download this repository
2. Install dependencies (optional - only needed for dev server):
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
├── cal.js                  # Main entry point (initialisation)
├── config.js               # Constants and configuration
├── colorUtils.js           # Colour conversion utilities
├── mathUtils.js             # Mathematical helper functions
├── svgUtils.js              # SVG path creation utilities
├── calendarRenderer.js      # Calendar drawing and rendering logic
├── bootstrap.css            # Styles (legacy Bootstrap)
├── package.json             # npm configuration
├── README.md                # This file
└── .cursorrules             # Cursor AI instructions for the project
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

### Adding Features

When adding new features:

1. Keep modules focused on single responsibilities
2. Use ES6 modules (import/export)
3. Follow the existing code style (British English, descriptive names)
4. Update this README if adding new dependencies or setup steps

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

