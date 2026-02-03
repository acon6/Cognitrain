/**
 * Flanker Task Game
 * Identify the direction of the center arrow while ignoring flanking arrows
 * Trains selective attention and inhibitory control
 */

const FlankerTask = {
    // Configuration per difficulty
    config: {
        easy: { time: 45, congruent: 0.7, displayTime: 2000 },      // 70% congruent, slower
        medium: { time: 30, congruent: 0.5, displayTime: 1500 },    // 50% congruent
        hard: { time: 20, congruent: 0.3, displayTime: 1000 }       // 30% congruent, faster
    },

    // Arrow directions
    arrows: {
        left: '←',
        right: '→'
    },

    // Game state
    currentDirection: null,
    correct: 0,
    incorrect: 0,
    round: 0,
    totalRounds: 25,
    timer: null,
    timeLeft: 30,
    difficulty: 'easy',
    isPlaying: false,
    canAnswer: false,
    reactionTimes: [],
    stimulusShownAt: null,

    /**
     * Start a new game
     */
    start() {
        // Get difficulty
        const activeBtn = document.querySelector('#flanker-task-game .diff-btn.active');
        this.difficulty = activeBtn ? activeBtn.dataset.diff : 'easy';

        // Reset state
        this.correct = 0;
        this.incorrect = 0;
        this.round = 0;
        this.timeLeft = this.config[this.difficulty].time;
        this.isPlaying = true;
        this.canAnswer = false;
        this.reactionTimes = [];

        // Clear timer
        if (this.timer) clearInterval(this.timer);

        // Hide elements
        document.getElementById('ft-message').style.display = 'none';
        document.getElementById('ft-start').style.display = 'none';
        document.getElementById('ft-difficulty').style.display = 'none';

        // Show game elements
        document.getElementById('ft-display').style.visibility = 'visible';
        document.getElementById('ft-options').style.display = 'flex';

        // Setup buttons
        this.setupButtons();

        // Update UI
        this.updateUI();

        // Start first round after brief delay
        setTimeout(() => this.nextChallenge(), 500);

        // Start timer
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('ft-time').textContent = this.timeLeft;

            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    },

    /**
     * Setup answer buttons
     */
    setupButtons() {
        const leftBtn = document.getElementById('ft-left-btn');
        const rightBtn = document.getElementById('ft-right-btn');

        // Remove old listeners by cloning
        const newLeftBtn = leftBtn.cloneNode(true);
        const newRightBtn = rightBtn.cloneNode(true);
        leftBtn.parentNode.replaceChild(newLeftBtn, leftBtn);
        rightBtn.parentNode.replaceChild(newRightBtn, rightBtn);

        // Add new listeners
        newLeftBtn.addEventListener('click', () => this.handleAnswer('left'));
        newRightBtn.addEventListener('click', () => this.handleAnswer('right'));

        // Keyboard support
        this.keyHandler = (e) => {
            if (!this.isPlaying || !this.canAnswer) return;
            if (e.key === 'ArrowLeft') this.handleAnswer('left');
            if (e.key === 'ArrowRight') this.handleAnswer('right');
        };
        document.removeEventListener('keydown', this.keyHandler);
        document.addEventListener('keydown', this.keyHandler);
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

        this.canAnswer = false;
        const config = this.config[this.difficulty];
        const display = document.getElementById('ft-display');

        // Show fixation cross
        display.textContent = '+';
        display.className = 'flanker-display fixation';

        // After brief fixation, show arrows
        setTimeout(() => {
            if (!this.isPlaying) return;

            // Decide if congruent or incongruent
            const isCongruent = Math.random() < config.congruent;

            // Pick center arrow direction
            const centerDirection = Math.random() < 0.5 ? 'left' : 'right';
            this.currentDirection = centerDirection;

            // Build flanker string
            const centerArrow = this.arrows[centerDirection];
            let flankerArrow;

            if (isCongruent) {
                flankerArrow = centerArrow;
            } else {
                flankerArrow = centerDirection === 'left' ? this.arrows.right : this.arrows.left;
            }

            // Create 5-arrow display: flanker flanker CENTER flanker flanker
            const arrowString = `${flankerArrow} ${flankerArrow} ${centerArrow} ${flankerArrow} ${flankerArrow}`;

            display.textContent = arrowString;
            display.className = 'flanker-display arrows';

            this.canAnswer = true;
            this.stimulusShownAt = Date.now();

            this.updateUI();
        }, 500);
    },

    /**
     * Handle user answer
     */
    handleAnswer(direction) {
        if (!this.isPlaying || !this.canAnswer) return;

        this.canAnswer = false;
        const reactionTime = Date.now() - this.stimulusShownAt;
        const display = document.getElementById('ft-display');

        if (direction === this.currentDirection) {
            // Correct!
            this.correct++;
            this.reactionTimes.push(reactionTime);
            display.classList.add('correct-flash');
        } else {
            // Incorrect
            this.incorrect++;
            display.classList.add('incorrect-flash');
        }

        // Remove animation class after animation
        setTimeout(() => {
            display.classList.remove('correct-flash', 'incorrect-flash');
            // Next challenge
            this.nextChallenge();
        }, 400);
    },

    /**
     * Update UI
     */
    updateUI() {
        document.getElementById('ft-correct').textContent = this.correct;
        document.getElementById('ft-round').textContent = `${this.round}/${this.totalRounds}`;
        document.getElementById('ft-time').textContent = this.timeLeft;
    },

    /**
     * End the game
     */
    endGame() {
        this.isPlaying = false;
        this.canAnswer = false;
        clearInterval(this.timer);
        document.removeEventListener('keydown', this.keyHandler);

        // Calculate score
        const baseScore = this.correct * 50;
        const accuracy = this.correct / (this.correct + this.incorrect) || 0;
        const accuracyBonus = Math.round(accuracy * 200);

        // Reaction time bonus (faster = better, cap at 300ms avg for max bonus)
        let rtBonus = 0;
        if (this.reactionTimes.length > 0) {
            const avgRT = this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length;
            rtBonus = Math.max(0, Math.round((1000 - avgRT) / 5));
        }

        const difficultyMultiplier = { easy: 1, medium: 1.5, hard: 2.5 };
        const score = Math.round((baseScore + accuracyBonus + rtBonus) * difficultyMultiplier[this.difficulty]);

        // Save score
        Storage.saveScore('flanker-task', score, this.difficulty);

        // Calculate average reaction time for display
        const avgReactionTime = this.reactionTimes.length > 0
            ? Math.round(this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length)
            : 0;

        // Show results
        document.getElementById('ft-final-score').textContent = score;
        document.getElementById('ft-stats').textContent =
            `${this.correct} correct, ${this.incorrect} incorrect (${Math.round(accuracy * 100)}% accuracy)\nAvg reaction time: ${avgReactionTime}ms`;

        document.getElementById('ft-display').style.visibility = 'hidden';
        document.getElementById('ft-options').style.display = 'none';
        document.getElementById('ft-message').style.display = 'block';
        document.getElementById('ft-difficulty').style.display = 'flex';
    }
};
