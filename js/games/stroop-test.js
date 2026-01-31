/**
 * Stroop Test Game
 * Name the color of the text, not the word itself
 * Trains focus, inhibition control, and attention
 */

const StroopTest = {
    // Configuration per difficulty
    config: {
        easy: { time: 45, congruent: 0.5 },      // 50% matching word/color
        medium: { time: 30, congruent: 0.3 },    // 30% matching
        hard: { time: 20, congruent: 0.1 }       // 10% matching (mostly incongruent)
    },

    // Colors used in the game
    colors: [
        { name: 'Red', hex: '#ef4444' },
        { name: 'Green', hex: '#22c55e' },
        { name: 'Blue', hex: '#3b82f6' },
        { name: 'Yellow', hex: '#eab308' }
    ],

    // Game state
    currentColor: null,
    correct: 0,
    incorrect: 0,
    round: 0,
    totalRounds: 20,
    timer: null,
    timeLeft: 30,
    difficulty: 'easy',
    isPlaying: false,

    /**
     * Start a new game
     */
    start() {
        // Get difficulty
        const activeBtn = document.querySelector('#stroop-test-game .diff-btn.active');
        this.difficulty = activeBtn ? activeBtn.dataset.diff : 'easy';

        // Reset state
        this.correct = 0;
        this.incorrect = 0;
        this.round = 0;
        this.timeLeft = this.config[this.difficulty].time;
        this.isPlaying = true;

        // Clear timer
        if (this.timer) clearInterval(this.timer);

        // Hide elements
        document.getElementById('st-message').style.display = 'none';
        document.getElementById('st-start').style.display = 'none';
        document.getElementById('st-difficulty').style.display = 'none';

        // Setup buttons
        this.setupButtons();

        // Update UI
        this.updateUI();

        // Generate first challenge
        this.nextChallenge();

        // Start timer
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('st-time').textContent = this.timeLeft;

            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    },

    /**
     * Setup color buttons
     */
    setupButtons() {
        const options = document.getElementById('st-options');
        options.innerHTML = '';

        this.colors.forEach(color => {
            const btn = document.createElement('button');
            btn.className = 'stroop-btn';
            btn.style.backgroundColor = color.hex;
            btn.textContent = color.name;
            btn.addEventListener('click', () => this.handleAnswer(color.name));
            options.appendChild(btn);
        });
    },

    /**
     * Generate next challenge
     */
    nextChallenge() {
        if (!this.isPlaying) return;

        this.round++;
        if (this.round > this.totalRounds) {
            this.endGame();
            return;
        }

        const config = this.config[this.difficulty];

        // Decide if congruent (word matches color) or incongruent
        const isCongruent = Math.random() < config.congruent;

        // Pick random word and color
        const wordIndex = Math.floor(Math.random() * this.colors.length);
        let colorIndex;

        if (isCongruent) {
            colorIndex = wordIndex;
        } else {
            // Pick a different color
            do {
                colorIndex = Math.floor(Math.random() * this.colors.length);
            } while (colorIndex === wordIndex);
        }

        const word = this.colors[wordIndex].name;
        const color = this.colors[colorIndex];

        this.currentColor = color.name;

        // Update display
        const display = document.getElementById('st-display');
        display.textContent = word.toUpperCase();
        display.style.color = color.hex;

        this.updateUI();
    },

    /**
     * Handle user answer
     */
    handleAnswer(colorName) {
        if (!this.isPlaying) return;

        const display = document.getElementById('st-display');

        if (colorName === this.currentColor) {
            // Correct!
            this.correct++;
            display.classList.add('correct-flash');
        } else {
            // Incorrect
            this.incorrect++;
            display.classList.add('incorrect-flash');
        }

        // Remove animation class after animation
        setTimeout(() => {
            display.classList.remove('correct-flash', 'incorrect-flash');
        }, 500);

        // Next challenge
        this.nextChallenge();
    },

    /**
     * Update UI
     */
    updateUI() {
        document.getElementById('st-correct').textContent = this.correct;
        document.getElementById('st-round').textContent = `${this.round}/${this.totalRounds}`;
        document.getElementById('st-time').textContent = this.timeLeft;
    },

    /**
     * End the game
     */
    endGame() {
        this.isPlaying = false;
        clearInterval(this.timer);

        // Calculate score
        const baseScore = this.correct * 50;
        const accuracy = this.correct / (this.correct + this.incorrect) || 0;
        const accuracyBonus = Math.round(accuracy * 200);
        const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2.5 };

        const score = Math.round((baseScore + accuracyBonus) * difficultyMultiplier[this.difficulty]);

        // Save score
        Storage.saveScore('stroop-test', score, this.difficulty);

        // Show results
        document.getElementById('st-final-score').textContent = score;
        document.getElementById('st-stats').textContent =
            `${this.correct} correct, ${this.incorrect} incorrect (${Math.round(accuracy * 100)}% accuracy)`;

        document.getElementById('st-message').style.display = 'block';
        document.getElementById('st-difficulty').style.display = 'flex';
    }
};
