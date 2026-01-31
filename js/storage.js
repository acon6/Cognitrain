/**
 * CogniTrain - Storage Module
 * Handles all LocalStorage operations for saving progress
 */

const Storage = {
    KEYS: {
        SCORES: 'cognitrain_scores',
        STREAK: 'cognitrain_streak',
        LAST_PLAYED: 'cognitrain_last_played',
        SETTINGS: 'cognitrain_settings'
    },

    /**
     * Initialize storage with default values if empty
     */
    init() {
        if (!localStorage.getItem(this.KEYS.SCORES)) {
            localStorage.setItem(this.KEYS.SCORES, JSON.stringify({}));
        }
        if (!localStorage.getItem(this.KEYS.STREAK)) {
            localStorage.setItem(this.KEYS.STREAK, JSON.stringify({
                count: 0,
                lastDate: null
            }));
        }
        this.updateStreak();
    },

    /**
     * Save a game score
     * @param {string} game - Game identifier (e.g., 'memory-match')
     * @param {number} score - The score achieved
     * @param {string} difficulty - 'easy', 'medium', or 'hard'
     */
    saveScore(game, score, difficulty) {
        const scores = this.getAllScores();
        const today = this.getDateString();

        if (!scores[game]) {
            scores[game] = [];
        }

        scores[game].push({
            score: score,
            difficulty: difficulty,
            date: today,
            timestamp: Date.now()
        });

        // Keep only last 100 scores per game
        if (scores[game].length > 100) {
            scores[game] = scores[game].slice(-100);
        }

        localStorage.setItem(this.KEYS.SCORES, JSON.stringify(scores));
        this.updateStreak();
    },

    /**
     * Get all scores for a specific game
     * @param {string} game - Game identifier
     * @returns {Array} Array of score objects
     */
    getScores(game) {
        const scores = this.getAllScores();
        return scores[game] || [];
    },

    /**
     * Get all scores
     * @returns {Object} All scores organized by game
     */
    getAllScores() {
        try {
            return JSON.parse(localStorage.getItem(this.KEYS.SCORES)) || {};
        } catch {
            return {};
        }
    },

    /**
     * Get the best score for a game
     * @param {string} game - Game identifier
     * @param {string} difficulty - Optional difficulty filter
     * @returns {number} Best score or 0
     */
    getBestScore(game, difficulty = null) {
        let scores = this.getScores(game);

        if (difficulty) {
            scores = scores.filter(s => s.difficulty === difficulty);
        }

        if (scores.length === 0) return 0;
        return Math.max(...scores.map(s => s.score));
    },

    /**
     * Get today's scores
     * @returns {Array} All scores from today
     */
    getTodayScores() {
        const today = this.getDateString();
        const allScores = this.getAllScores();
        const todayScores = [];

        for (const game in allScores) {
            const gameScores = allScores[game].filter(s => s.date === today);
            todayScores.push(...gameScores.map(s => ({ ...s, game })));
        }

        return todayScores;
    },

    /**
     * Get count of exercises completed today
     * @returns {number} Number of exercises completed today
     */
    getTodayCount() {
        return this.getTodayScores().length;
    },

    /**
     * Get total exercises completed
     * @returns {number} Total number of exercises
     */
    getTotalCount() {
        const allScores = this.getAllScores();
        let total = 0;

        for (const game in allScores) {
            total += allScores[game].length;
        }

        return total;
    },

    /**
     * Get current streak
     * @returns {number} Current streak count
     */
    getStreak() {
        try {
            const streak = JSON.parse(localStorage.getItem(this.KEYS.STREAK));
            return streak?.count || 0;
        } catch {
            return 0;
        }
    },

    /**
     * Update streak based on activity
     */
    updateStreak() {
        const today = this.getDateString();
        const yesterday = this.getDateString(new Date(Date.now() - 86400000));

        let streak;
        try {
            streak = JSON.parse(localStorage.getItem(this.KEYS.STREAK)) || { count: 0, lastDate: null };
        } catch {
            streak = { count: 0, lastDate: null };
        }

        // Check if played today
        const todayScores = this.getTodayScores();

        if (todayScores.length > 0) {
            if (streak.lastDate === today) {
                // Already counted today
                return;
            } else if (streak.lastDate === yesterday) {
                // Continuing streak
                streak.count += 1;
                streak.lastDate = today;
            } else {
                // Starting new streak
                streak.count = 1;
                streak.lastDate = today;
            }
        } else if (streak.lastDate !== today && streak.lastDate !== yesterday) {
            // Streak broken
            streak.count = 0;
        }

        localStorage.setItem(this.KEYS.STREAK, JSON.stringify(streak));
    },

    /**
     * Get date string in YYYY-MM-DD format
     * @param {Date} date - Date object (defaults to today)
     * @returns {string} Date string
     */
    getDateString(date = new Date()) {
        return date.toISOString().split('T')[0];
    },

    /**
     * Get recent scores for progress display
     * @param {number} days - Number of days to look back
     * @returns {Object} Scores organized by date
     */
    getRecentScores(days = 7) {
        const allScores = this.getAllScores();
        const result = {};
        const cutoff = Date.now() - (days * 86400000);

        for (const game in allScores) {
            for (const score of allScores[game]) {
                if (score.timestamp >= cutoff) {
                    if (!result[score.date]) {
                        result[score.date] = [];
                    }
                    result[score.date].push({ ...score, game });
                }
            }
        }

        return result;
    },

    /**
     * Get statistics for a specific game
     * @param {string} game - Game identifier
     * @returns {Object} Game statistics
     */
    getGameStats(game) {
        const scores = this.getScores(game);

        if (scores.length === 0) {
            return {
                played: 0,
                bestScore: 0,
                averageScore: 0,
                lastPlayed: null
            };
        }

        const scoreValues = scores.map(s => s.score);

        return {
            played: scores.length,
            bestScore: Math.max(...scoreValues),
            averageScore: Math.round(scoreValues.reduce((a, b) => a + b, 0) / scores.length),
            lastPlayed: scores[scores.length - 1].date
        };
    },

    /**
     * Clear all data (for testing/reset)
     */
    clearAll() {
        localStorage.removeItem(this.KEYS.SCORES);
        localStorage.removeItem(this.KEYS.STREAK);
        localStorage.removeItem(this.KEYS.LAST_PLAYED);
        localStorage.removeItem(this.KEYS.SETTINGS);
        this.init();
    }
};

// Initialize storage on load
Storage.init();
