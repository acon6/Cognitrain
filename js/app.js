/**
 * CogniTrain - Main App Module
 * Handles dashboard updates and navigation
 */

const App = {
    /**
     * Initialize the app
     */
    init() {
        this.updateDashboard();
        this.setupEventListeners();
    },

    /**
     * Update dashboard statistics
     */
    updateDashboard() {
        // Update streak
        const streakEl = document.getElementById('streak-count');
        if (streakEl) {
            streakEl.textContent = Storage.getStreak();
        }

        // Update today's count
        const todayEl = document.getElementById('today-exercises');
        if (todayEl) {
            todayEl.textContent = Storage.getTodayCount();
        }

        // Update total count
        const totalEl = document.getElementById('total-exercises');
        if (totalEl) {
            totalEl.textContent = Storage.getTotalCount();
        }

        // Update daily suggestion
        this.updateDailySuggestion();
    },

    /**
     * Update the daily suggestion message
     */
    updateDailySuggestion() {
        const suggestionEl = document.getElementById('daily-suggestion');
        if (!suggestionEl) return;

        const todayCount = Storage.getTodayCount();
        const streak = Storage.getStreak();

        if (todayCount === 0) {
            suggestionEl.textContent = "Start your day with a quick memory exercise!";
        } else if (todayCount < 3) {
            suggestionEl.textContent = `Great start! Try ${3 - todayCount} more exercise${3 - todayCount > 1 ? 's' : ''} for a full session.`;
        } else {
            suggestionEl.textContent = `Excellent work today! You've completed ${todayCount} exercises.`;
        }

        if (streak >= 7) {
            suggestionEl.textContent += ` ${streak} day streak - keep it going!`;
        }
    },

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Add fade-in animation to cards
        const cards = document.querySelectorAll('.category-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('fade-in');
        });
    },

    /**
     * Format a score for display
     * @param {number} score - The score to format
     * @returns {string} Formatted score
     */
    formatScore(score) {
        if (score >= 1000) {
            return (score / 1000).toFixed(1) + 'k';
        }
        return score.toString();
    },

    /**
     * Show a temporary message
     * @param {string} message - Message to display
     * @param {string} type - 'success', 'error', or 'info'
     */
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existing = document.querySelector('.app-message');
        if (existing) existing.remove();

        const messageEl = document.createElement('div');
        messageEl.className = `app-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 30px;
            border-radius: 10px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#6366f1'};
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;

        document.body.appendChild(messageEl);

        setTimeout(() => {
            messageEl.style.opacity = '0';
            messageEl.style.transition = 'opacity 0.3s ease';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
