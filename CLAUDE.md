# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running the App

No build step required. Open `index.html` directly in a browser to run the app.

For local development with live reload, use any static server:
```bash
npx serve .
# or
python -m http.server 8000
```

## Architecture

### Core Modules

**Storage (`js/storage.js`)** - Singleton object handling all LocalStorage operations:
- Keys prefixed with `cognitrain_` (scores, streak, settings)
- `Storage.saveScore(game, score, difficulty)` - saves game results
- `Storage.getStreak()`, `Storage.getTodayCount()`, `Storage.getBestScore(game)` - retrieval methods
- Auto-initializes on script load via `Storage.init()`

**App (`js/app.js`)** - Dashboard controller:
- Updates stats display on page load
- Depends on Storage being loaded first

### Game Pattern

All games in `js/games/` follow this object-literal structure:

```javascript
const GameName = {
    config: { easy: {...}, medium: {...}, hard: {...} },  // Difficulty settings
    // State properties
    difficulty: 'easy',
    score: 0,
    isPlaying: false,

    start() { },      // Reset state, setup UI, begin game
    updateUI() { },   // Sync DOM with state
    endGame() { Storage.saveScore('game-id', score, this.difficulty); }
};
```

Game identifiers used in Storage: `memory-match`, `sequence-recall`, `stroop-test`, `pattern-puzzle`

### Page Structure

- `index.html` - Dashboard with category links
- `pages/*.html` - Category pages containing game selection and game containers
- Each page includes `storage.js` first, then relevant game scripts
- Games are shown/hidden via `showGame(gameId)` function defined inline in each page

### CSS Organization

Single stylesheet `css/styles.css` with:
- CSS variables in `:root` for theming (colors, spacing, shadows)
- Category-specific colors: `--memory-color`, `--attention-color`, `--problem-color`
- Game-specific sections (`.memory-grid`, `.stroop-display`, `.pattern-grid`)
- Responsive breakpoint at 600px

## Conventions

- Difficulty levels: `'easy'`, `'medium'`, `'hard'` (strings)
- Difficulty selection via `.diff-btn.active` data attribute
- Score multipliers applied per difficulty in each game's `endGame()`
- DOM IDs prefixed by game abbreviation (e.g., `mm-` for memory-match, `sr-` for sequence-recall)
