/**
 * Memory Match Game
 * Find matching pairs of cards to train visual memory
 */

const MemoryMatch = {
    // Game configuration per difficulty
    config: {
        easy: { pairs: 6, gridClass: 'easy' },
        medium: { pairs: 8, gridClass: 'medium' },
        hard: { pairs: 12, gridClass: 'hard' }
    },

    // Card symbols
    symbols: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'],

    // Game state
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    timer: null,
    seconds: 0,
    difficulty: 'easy',
    isLocked: false,

    /**
     * Start a new game
     */
    start() {
        // Get selected difficulty
        const activeBtn = document.querySelector('#memory-match-game .diff-btn.active');
        this.difficulty = activeBtn ? activeBtn.dataset.diff : 'easy';

        // Reset state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.seconds = 0;
        this.isLocked = false;

        // Clear timer
        if (this.timer) clearInterval(this.timer);

        // Hide message, show grid
        document.getElementById('mm-message').style.display = 'none';
        document.getElementById('mm-start').style.display = 'none';

        // Setup grid
        const grid = document.getElementById('mm-grid');
        const config = this.config[this.difficulty];

        grid.className = `memory-grid ${config.gridClass}`;
        grid.innerHTML = '';

        // Create cards
        this.createCards(config.pairs);

        // Update UI
        this.updateUI();

        // Start timer
        this.timer = setInterval(() => {
            this.seconds++;
            this.updateTimer();
        }, 1000);
    },

    /**
     * Create shuffled card pairs
     */
    createCards(pairs) {
        const symbols = this.symbols.slice(0, pairs);
        const cardPairs = [...symbols, ...symbols];

        // Shuffle
        for (let i = cardPairs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cardPairs[i], cardPairs[j]] = [cardPairs[j], cardPairs[i]];
        }

        // Create card elements
        const grid = document.getElementById('mm-grid');

        cardPairs.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.symbol = symbol;
            card.dataset.index = index;

            card.innerHTML = `
                <div class="card-front"></div>
                <div class="card-back">${symbol}</div>
            `;

            card.addEventListener('click', () => this.flipCard(card));
            grid.appendChild(card);
            this.cards.push(card);
        });
    },

    /**
     * Handle card flip
     */
    flipCard(card) {
        // Ignore if locked, already flipped, or already matched
        if (this.isLocked ||
            card.classList.contains('flipped') ||
            card.classList.contains('matched')) {
            return;
        }

        // Flip card
        card.classList.add('flipped');
        this.flippedCards.push(card);

        // Check for match when 2 cards are flipped
        if (this.flippedCards.length === 2) {
            this.moves++;
            this.updateUI();
            this.checkMatch();
        }
    },

    /**
     * Check if flipped cards match
     */
    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const match = card1.dataset.symbol === card2.dataset.symbol;

        this.isLocked = true;

        setTimeout(() => {
            if (match) {
                card1.classList.add('matched');
                card2.classList.add('matched');
                this.matchedPairs++;
                this.updateUI();

                // Check for win
                if (this.matchedPairs === this.config[this.difficulty].pairs) {
                    this.endGame();
                }
            } else {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }

            this.flippedCards = [];
            this.isLocked = false;
        }, match ? 300 : 800);
    },

    /**
     * Update UI elements
     */
    updateUI() {
        const pairs = this.config[this.difficulty].pairs;
        document.getElementById('mm-moves').textContent = this.moves;
        document.getElementById('mm-pairs').textContent = `${this.matchedPairs}/${pairs}`;
    },

    /**
     * Update timer display
     */
    updateTimer() {
        const mins = Math.floor(this.seconds / 60);
        const secs = this.seconds % 60;
        document.getElementById('mm-time').textContent =
            `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * End the game
     */
    endGame() {
        clearInterval(this.timer);

        // Calculate score
        const pairs = this.config[this.difficulty].pairs;
        const baseScore = pairs * 100;
        const moveBonus = Math.max(0, (pairs * 3 - this.moves) * 10);
        const timeBonus = Math.max(0, (pairs * 10 - this.seconds) * 2);
        const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2 };

        const score = Math.round((baseScore + moveBonus + timeBonus) * difficultyMultiplier[this.difficulty]);

        // Save score
        Storage.saveScore('memory-match', score, this.difficulty);

        // Show message
        document.getElementById('mm-final-score').textContent = score;
        document.getElementById('mm-stats').textContent =
            `${this.moves} moves in ${Math.floor(this.seconds / 60)}:${(this.seconds % 60).toString().padStart(2, '0')}`;

        document.getElementById('mm-message').style.display = 'block';
        document.getElementById('mm-start').style.display = 'none';
    }
};
