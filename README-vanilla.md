# SmartSchool Seating - Vanilla HTML/CSS/JavaScript Version

This is the converted version of the SmartSchool Seating application, now using only HTML, CSS, Tailwind CSS, and vanilla JavaScript instead of Next.js/React/TypeScript.

## Features

- **Layout Editor**: Create classroom layouts with desks, doors, and seats
- **Roster Manager**: Manage student rosters with add, edit, and delete functionality
- **Plan Editor**: Generate seating plans by combining layouts and rosters
- **Local Storage**: All data is stored locally in the browser
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

- **HTML5**: Structure and markup
- **CSS3**: Styling and animations
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **Vanilla JavaScript**: Interactive functionality
- **Local Storage**: Data persistence

## Running the Application

### Option 1: Simple HTTP Server (Recommended)

```bash
# Using Python 3
python3 -m http.server 8080

# Using Python 2
python -m SimpleHTTPServer 8080

# Using Node.js (if you have it installed)
npx serve . -p 8080
```

Then open your browser and navigate to: `http://localhost:8080`

### Option 2: Direct File Opening

You can also open `index.html` directly in your browser, but some features may not work due to browser security restrictions.

## File Structure

```
/
├── index.html              # Main application entry point
├── styles.css              # Main stylesheet
├── app/globals.css         # Global styles (imported by styles.css)
├── js/
│   ├── app.js             # Main application controller
│   ├── storage.js         # Local storage service
│   ├── layout-editor.js   # Layout editor functionality
│   ├── roster-manager.js  # Roster management
│   └── plan-editor.js     # Seating plan generation
└── README-vanilla.md      # This file
```

## Key Features

### Layout Editor
- Create classroom grids with customizable rows and columns
- Place desks (horizontal/vertical orientation), doors, and seats
- Save and load layouts for reuse
- Visual grid interface with drag-free click-to-place system

### Roster Manager
- Create and manage student rosters
- Add students by typing names (one per line)
- Edit existing rosters
- View roster details and student counts

### Plan Editor
- Select saved layouts and rosters
- Generate random seating arrangements
- Manually adjust student assignments by clicking seats
- Save generated seating plans for future reference

## Data Storage

All data is stored locally in your browser using LocalStorage:
- **Layouts**: Classroom grid configurations and furniture placement
- **Rosters**: Student lists with names and metadata
- **Seating Plans**: Generated seating arrangements with student-seat assignments

## Browser Compatibility

This application works in all modern browsers that support:
- ES6+ JavaScript features (const, let, arrow functions, classes)
- LocalStorage API
- CSS Grid and Flexbox
- HTML5 semantic elements

Tested browsers:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Differences from React Version

### Removed Dependencies
- Next.js framework
- React and ReactDOM
- TypeScript
- Node.js build system
- NPM packages (react-beautiful-dnd, etc.)

### Simplified Architecture
- No virtual DOM or component lifecycle
- Direct DOM manipulation
- Event-driven architecture
- Simpler state management

### Maintained Features
- All core functionality preserved
- Same user interface and experience
- Responsive design
- Data persistence
- Modal dialogs and notifications

## Development Notes

The conversion maintains the same functionality as the original React version while simplifying the technology stack:

1. **State Management**: Replaced React state with class properties and direct DOM updates
2. **Event Handling**: Replaced React event handlers with native event listeners
3. **Rendering**: Replaced JSX with template strings and DOM manipulation
4. **Styling**: Kept existing CSS classes and added Tailwind via CDN
5. **Data Persistence**: Maintained local storage approach with simpler API

## Future Enhancements

Potential improvements for the vanilla version:
- Add drag-and-drop functionality using native HTML5 drag API
- Implement data export/import functionality
- Add print-friendly seating chart layouts
- Create mobile-optimized touch interactions
- Add keyboard navigation support