/**
 * Pattern Puzzle Game
 * Find the missing element in a logical pattern
 * Trains logical reasoning and pattern recognition
 */

const PatternPuzzle = {
    // Configuration per difficulty
    config: {
        easy: { lives: 5, optionCount: 3 },
        medium: { lives: 3, optionCount: 4 },
        hard: { lives: 2, optionCount: 5 }
    },

    // Pattern types
    patterns: {
        // Number sequences
        numbers: {
            generate: (level) => {
                const start = Math.floor(Math.random() * 10) + 1;
                const step = Math.floor(Math.random() * (level + 2)) + 1;
                const sequence = [];
                for (let i = 0; i < 9; i++) {
                    sequence.push(start + (step * i));
                }
                return { sequence, answer: sequence[8], type: 'number' };
            }
        },
        // Shape sequences
        shapes: {
            symbols: ['●', '■', '▲', '◆', '★', '○', '□', '△', '◇', '☆'],
            generate: (level) => {
                const patternLength = Math.min(2 + Math.floor(level / 3), 4);
                const pattern = [];
                const usedSymbols = [];

                for (let i = 0; i < patternLength; i++) {
                    let symbol;
                    do {
                        symbol = PatternPuzzle.patterns.shapes.symbols[
                            Math.floor(Math.random() * PatternPuzzle.patterns.shapes.symbols.length)
                        ];
                    } while (usedSymbols.includes(symbol));
                    usedSymbols.push(symbol);
                    pattern.push(symbol);
                }

                const sequence = [];
                for (let i = 0; i < 9; i++) {
                    sequence.push(pattern[i % patternLength]);
                }

                return { sequence, answer: sequence[8], type: 'shape' };
            }
        },
        // Alternating patterns
        alternating: {
            generate: (level) => {
                const symbols = ['○', '●'];
                if (level > 2) symbols.push('◐');
                if (level > 5) symbols.push('◑');

                const sequence = [];
                for (let i = 0; i < 9; i++) {
                    sequence.push(symbols[i % symbols.length]);
                }

                return { sequence, answer: sequence[8], type: 'shape' };
            }
        },
        // Math patterns (A + B = C in each row)
        math: {
            generate: (level) => {
                const sequence = [];
                for (let row = 0; row < 3; row++) {
                    const a = Math.floor(Math.random() * 5) + 1 + (row * 2);
                    const b = Math.floor(Math.random() * 5) + 1;
                    const c = a + b;
                    sequence.push(a, b, c);
                }

                return { sequence, answer: sequence[8], type: 'number' };
            }
        }
    },

    // Game state
    currentPattern: null,
    level: 1,
    score: 0,
    streak: 0,
    lives: 3,
    difficulty: 'easy',
    isPlaying: false,

    /**
     * Start a new game
     */
    start() {
        // Get difficulty
        const activeBtn = document.querySelector('#pattern-puzzle-game .diff-btn.active');
        this.difficulty = activeBtn ? activeBtn.dataset.diff : 'easy';

        // Reset state
        this.level = 1;
        this.score = 0;
        this.streak = 0;
        this.lives = this.config[this.difficulty].lives;
        this.isPlaying = true;

        // Hide elements
        document.getElementById('pp-message').style.display = 'none';
        document.getElementById('pp-start').style.display = 'none';
        document.getElementById('pp-difficulty').style.display = 'none';

        // Update UI
        this.updateUI();

        // Generate first puzzle
        this.nextPuzzle();
    },

    /**
     * Generate next puzzle
     */
    nextPuzzle() {
        if (!this.isPlaying) return;

        // Select pattern type based on level
        const patternTypes = Object.keys(this.patterns);
        const typeIndex = (this.level - 1) % patternTypes.length;
        const patternType = patternTypes[typeIndex];

        // Generate pattern
        this.currentPattern = this.patterns[patternType].generate(this.level);

        // Render grid
        this.renderGrid();

        // Render options
        this.renderOptions();

        this.updateUI();
    },

    /**
     * Render the pattern grid
     */
    renderGrid() {
        const grid = document.getElementById('pp-grid');
        grid.innerHTML = '';

        const sequence = this.currentPattern.sequence;

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.className = 'pattern-cell';

            if (i === 8) {
                // Mystery cell
                cell.classList.add('mystery');
                cell.textContent = '?';
            } else {
                cell.textContent = sequence[i];
            }

            grid.appendChild(cell);
        }
    },

    /**
     * Render answer options
     */
    renderOptions() {
        const options = document.getElementById('pp-options');
        options.innerHTML = '';

        const correctAnswer = this.currentPattern.answer;
        const optionCount = this.config[this.difficulty].optionCount;

        // Generate wrong answers
        const allOptions = [correctAnswer];

        while (allOptions.length < optionCount) {
            let wrongAnswer;

            if (this.currentPattern.type === 'number') {
                // Generate nearby wrong numbers
                const offset = Math.floor(Math.random() * 5) - 2;
                wrongAnswer = correctAnswer + offset;
                if (wrongAnswer === correctAnswer) wrongAnswer = correctAnswer + 3;
            } else {
                // Generate random wrong shapes
                const shapes = this.patterns.shapes.symbols;
                wrongAnswer = shapes[Math.floor(Math.random() * shapes.length)];
            }

            if (!allOptions.includes(wrongAnswer)) {
                allOptions.push(wrongAnswer);
            }
        }

        // Shuffle options
        for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
        }

        // Create buttons
        allOptions.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'pattern-option';
            btn.textContent = option;
            btn.addEventListener('click', () => this.handleAnswer(option));
            options.appendChild(btn);
        });
    },

    /**
     * Handle answer selection
     */
    handleAnswer(answer) {
        if (!this.isPlaying) return;

        const mysteryCell = document.querySelector('.pattern-cell.mystery');
        const correctAnswer = this.currentPattern.answer;

        if (answer === correctAnswer) {
            // Correct!
            this.streak++;
            const points = (10 + (this.level * 5)) * (1 + this.streak * 0.1);
            this.score += Math.round(points * this.getDifficultyMultiplier());
            this.level++;

            mysteryCell.textContent = correctAnswer;
            mysteryCell.classList.remove('mystery');
            mysteryCell.classList.add('correct-flash');

            // Next puzzle after brief delay
            setTimeout(() => this.nextPuzzle(), 800);
        } else {
            // Wrong!
            this.streak = 0;
            this.lives--;

            mysteryCell.classList.add('incorrect-flash');
            setTimeout(() => mysteryCell.classList.remove('incorrect-flash'), 500);

            if (this.lives <= 0) {
                this.endGame();
            }
        }

        this.updateUI();
    },

    /**
     * Get difficulty multiplier
     */
    getDifficultyMultiplier() {
        const multipliers = { easy: 1, medium: 1.5, hard: 2 };
        return multipliers[this.difficulty];
    },

    /**
     * Update UI
     */
    updateUI() {
        document.getElementById('pp-level').textContent = this.level;
        document.getElementById('pp-score').textContent = Math.round(this.score);
        document.getElementById('pp-streak').textContent = this.streak;
    },

    /**
     * End the game
     */
    endGame() {
        this.isPlaying = false;

        // Final score
        const finalScore = Math.round(this.score);

        // Save score
        Storage.saveScore('pattern-puzzle', finalScore, this.difficulty);

        // Show results
        document.getElementById('pp-result-title').textContent =
            this.level > 10 ? 'Excellent!' : this.level > 5 ? 'Good Job!' : 'Game Over';
        document.getElementById('pp-final-score').textContent = finalScore;
        document.getElementById('pp-stats').textContent =
            `Reached level ${this.level} with best streak of ${this.streak}`;

        document.getElementById('pp-message').style.display = 'block';
        document.getElementById('pp-options').innerHTML = '';
        document.getElementById('pp-difficulty').style.display = 'flex';
    }
};
