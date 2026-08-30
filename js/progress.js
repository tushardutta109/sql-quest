// SQL Quest User Progress State Management
const Progress = (function() {
  const SAVE_KEY = 'sql_quest_save';

  const defaultState = {
    playerName: 'SQL Explorer',
    currentLevel: 1,
    completedLevels: [],
    xp: 0,
    streak: 0,
    bestStreak: 0,
    totalQueriesRun: 0,
    totalCorrect: 0,
    totalMistakes: 0,
    accuracy: 100,
    hearts: 3,
    badges: [],
    mistakesPerTopic: {
      basics: 0,       // L1-L10
      foundations: 0,  // L11-L20
      joins: 0,        // L23-L28
      subqueries: 0,   // L29-L30, L31-L32, L44
      analytics: 0,    // L39-L42
      modifications: 0 // L46-L48
    },
    examAnswers: [],    // Store Level 50 exam answers
    soundEnabled: true,
    musicEnabled: true,
    activeMusicTrack: 0,
    theme: 'dark'
  };

  let currentState = null;

  function load() {
    if (currentState) return currentState;

    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        currentState = Object.assign({}, defaultState, JSON.parse(saved));
        return currentState;
      }
    } catch (e) {
      console.error("Failed to load progress from LocalStorage:", e);
    }

    currentState = JSON.parse(JSON.stringify(defaultState));
    return currentState;
  }

  function save() {
    if (!currentState) return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(currentState));
    } catch (e) {
      console.error("Failed to save progress to LocalStorage:", e);
    }
  }

  function reset() {
    currentState = JSON.parse(JSON.stringify(defaultState));
    save();
    return currentState;
  }

  function setName(name) {
    const state = load();
    state.playerName = name || 'SQL Explorer';
    save();
  }

  function awardXp(amount) {
    const state = load();
    state.xp += amount;
    save();
  }

  function loseHeart() {
    const state = load();
    state.hearts = Math.max(0, state.hearts - 1);
    save();
    return state.hearts;
  }

  function resetHearts() {
    const state = load();
    state.hearts = 3;
    save();
  }

  function getTopicForLevel(levelId) {
    if (levelId <= 10) return 'basics';
    if (levelId <= 20) return 'foundations';
    if (levelId >= 23 && levelId <= 28) return 'joins';
    if (levelId === 29 || levelId === 30 || levelId === 31 || levelId === 32 || levelId === 44) return 'subqueries';
    if (levelId >= 39 && levelId <= 42) return 'analytics';
    if (levelId >= 46 && levelId <= 48) return 'modifications';
    return null;
  }

  function recordAttempt(levelId, isCorrect) {
    const state = load();
    state.totalQueriesRun++;

    if (isCorrect) {
      state.totalCorrect++;
      state.streak++;
      if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
      }

      // Unlock next level
      if (levelId === state.currentLevel && state.currentLevel < 50) {
        state.currentLevel++;
      }
      if (!state.completedLevels.includes(levelId)) {
        state.completedLevels.push(levelId);
      }
    } else {
      state.totalMistakes++;
      state.streak = 0;
      loseHeart();

      // Track topic mistakes
      const topic = getTopicForLevel(levelId);
      if (topic) {
        state.mistakesPerTopic[topic]++;
      }
    }

    // Recompute accuracy
    state.accuracy = Math.round((state.totalCorrect / state.totalQueriesRun) * 100) || 0;
    save();
  }

  function getReviewRecommendation() {
    const state = load();
    const suggestions = [];

    if (state.mistakesPerTopic.joins >= 3) {
      suggestions.push({
        topic: 'JOINs',
        message: 'You are struggling with JOINs.',
        levels: [23, 24, 28],
        action: 'Practice 10 JOIN questions'
      });
    }
    if (state.mistakesPerTopic.subqueries >= 3) {
      suggestions.push({
        topic: 'Subqueries',
        message: 'You are struggling with Subqueries.',
        levels: [29, 30],
        action: 'Review nested query operations'
      });
    }
    if (state.mistakesPerTopic.analytics >= 3) {
      suggestions.push({
        topic: 'Window/Analytic Functions',
        message: 'You are struggling with Window/Analytic functions.',
        levels: [39, 40],
        action: 'Practice partitioned ranking questions'
      });
    }

    return suggestions.length > 0 ? suggestions[0] : null; // Return the first relevant recommendation
  }

  function toggleMusic() {
    const state = load();
    state.musicEnabled = !state.musicEnabled;
    save();
    return state.musicEnabled;
  }

  function toggleSound() {
    const state = load();
    state.soundEnabled = !state.soundEnabled;
    save();
    return state.soundEnabled;
  }

  function toggleTheme() {
    const state = load();
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    save();
    return state.theme;
  }

  return {
    load,
    save,
    reset,
    setName,
    awardXp,
    loseHeart,
    resetHearts,
    recordAttempt,
    getReviewRecommendation,
    toggleMusic,
    toggleSound,
    toggleTheme
  };

})();

// Expose to window/global scope
if (typeof window !== 'undefined') {
  window.Progress = Progress;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Progress };
}
