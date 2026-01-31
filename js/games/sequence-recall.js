/**
 * Sequence Recall Game
 * Remember and repeat growing sequences to train working memory
 */

const SequenceRecall = {
    // Game configuration
    config: {
        easy: { items: 4, speed: 800, startLength: 2 },
        medium: { items: 6, speed: 600, startLength: 3 },
        hard: { items: 8, speed: 400, startLength: 4 }
    },

    // Colors for sequence items
    colors: [
        '#ef4444', // red
        '#f97316', // orange
        '#eab308', // yellow
        '#22c55e', // green
        '#06b6d4', // cyan
        '#3b82f6', // blue
        '#8b5cf6', // purple
        '#ec4899'  // pink
    ],

    // Game state
    sequence: [],
    userInput: [],
    level: 1,
    score: 0,
    difficulty: 'easy',
    isPlaying: false,
    isShowingSequence: false,

    /**
     * Start a new game
     */
    start() {
        // Get selected difficulty
        const activeBtn = document.querySelector('#sequence-recall-game .diff-btn.active');
        this.difficulty = activeBtn ? activeBtn.dataset.diff : 'easy';

        // Reset state
        this.sequence = [];
        this.userInput = [];
        this.level = 1;
        this.score = 0;
        this.isPlaying = true;

        // Hide elements
        document.getElementById('sr-message').style.display = 'none';
        document.getElementById('sr-start').style.display = 'none';
        document.getElementById('sr-difficulty').style.display = 'none';

        // Update best score
        const best = Storage.getBestScore('sequence-recall', this.difficulty);
        document.getElementById('sr-best').textContent = best;

        // Create buttons
        this.createButtons();

        // Update UI
        this.updateUI();

        // Start first round
        this.nextRound();
    },

    /**
     * Create input buttons
     */
    createButtons() {
        const display = document.getElementById('sr-display');
        const input = document.getElementById('sr-input');
        const config = this.config[this.difficulty];

        display.innerHTML = '';
        input.innerHTML = '';

        for (let i = 0; i < config.items; i++) {
            // Display item
            const displayItem = document.createElement('div');
            displayItem.className = 'sequence-item';
            displayItem.id = `sr-item-${i}`;
            displayItem.style.backgroundColor = this.colors[i];
            displayItem.textContent = i + 1;
            display.appendChild(displayItem);

            // Input button
            const btn = document.createElement('button');
            btn.className = 'sequence-btn';
            btn.style.backgroundColor = this.colors[i];
            btn.textContent = i + 1;
            btn.addEventListener('click', () => this.handleInput(i));
            input.appendChild(btn);
        }
    },

    /**
     * Start next round
     */
    nextRound() {
        this.userInput = [];
        const config = this.config[this.difficulty];

        // Add to sequence
        const newItem = Math.floor(Math.random() * config.items);
        this.sequence.push(newItem);

        // Ensure minimum length
        while (this.sequence.length < config.startLength) {
            this.sequence.push(Math.floor(Math.random() * config.items));
        }

        // Update UI
        this.updateUI();

        // Show instruction
        document.getElementById('sr-instruction').textContent = 'Watch the sequence...';
        document.getElementById('sr-input').style.display = 'none';

        // Play sequence
        setTimeout(() => this.playSequence(), 500);
    },

    /**
     * Play the current sequence
     */
    playSequence() {
        this.isShowingSequence = true;
        const config = this.config[this.difficulty];

        let i = 0;
        const interval = setInterval(() => {
            // Clear previous highlight
            document.querySelectorAll('.sequence-item').forEach(item => {
                item.classList.remove('highlight');
            });

            if (i < this.sequence.length) {
                // Highlight current item
                const item = document.getElementById(`sr-item-${this.sequence[i]}`);
                item.classList.add('highlight');
                i++;
            } else {
                // Sequence complete
                clearInterval(interval);
                this.isShowingSequence = false;

                document.querySelectorAll('.sequence-item').forEach(item => {
                    item.classList.remove('highlight');
                });

                // Show input
                document.getElementById('sr-instruction').textContent = 'Your turn! Repeat the sequence.';
                document.getElementById('sr-input').style.display = 'flex';
            }
        }, config.speed);
    },

    /**
     * Handle user input
     */
    handleInput(index) {
        if (this.isShowingSequence || !this.isPlaying) return;

        this.userInput.push(index);

        // Highlight clicked item briefly
        const item = document.getElementById(`sr-item-${index}`);
        item.classList.add('highlight');
        setTimeout(() => item.classList.remove('highlight'), 200);

        // Check input
        const currentIndex = this.userInput.length - 1;

        if (this.userInput[currentIndex] !== this.sequence[currentIndex]) {
            // Wrong!
            this.endGame(false);
            return;
        }

        // Check if sequence complete
        if (this.userInput.length === this.sequence.length) {
            // Correct!
            this.level++;
            this.score += this.sequence.length * 10 * this.getDifficultyMultiplier();
            this.updateUI();

            document.getElementById('sr-instruction').textContent = 'Correct! Get ready...';
            document.getElementById('sr-input').style.display = 'none';

            // Next round
            setTimeout(() => this.nextRound(), 1000);
        }
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
        document.getElementById('sr-level').textContent = this.level;
        document.getElementById('sr-score').textContent = Math.round(this.score);
    },

    /**
     * End the game
     */
    endGame(success) {
        this.isPlaying = false;

        // Final score
        const finalScore = Math.round(this.score);

        // Save score
        Storage.saveScore('sequence-recall', finalScore, this.difficulty);

        // Update best
        const best = Storage.getBestScore('sequence-recall', this.difficulty);
        document.getElementById('sr-best').textContent = best;

        // Show message
        document.getElementById('sr-result-title').textContent = success ? 'Amazing!' : 'Game Over';
        document.getElementById('sr-final-score').textContent = finalScore;
        document.getElementById('sr-stats').textContent = `You reached level ${this.level} with a sequence of ${this.sequence.length} items`;

        document.getElementById('sr-message').style.display = 'block';
        document.getElementById('sr-input').style.display = 'none';
        document.getElementById('sr-instruction').textContent = '';
        document.getElementById('sr-difficulty').style.display = 'flex';
    }
};
