// SQL Quest Badges and Achievements System
const Achievements = (function() {
  
  const BADGES = [
    {
      id: 'sql_beginner',
      title: 'SQL Beginner',
      description: 'Unlock and complete World 1 (Levels 1 to 10)',
      icon: '🌱',
      check: (state) => {
        // Complete levels 1 to 10
        const required = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        return required.every(lvl => state.completedLevels.includes(lvl));
      }
    },
    {
      id: 'query_explorer',
      title: 'Query Explorer',
      description: 'Run a total of 50 SQL queries in the terminal',
      icon: '🔍',
      check: (state) => state.totalQueriesRun >= 50
    },
    {
      id: 'join_master',
      title: 'JOIN Master',
      description: 'Complete all JOIN types in World 3 (Levels 23 to 28)',
      icon: '⚔️',
      check: (state) => {
        const required = [23, 24, 25, 26, 27, 28];
        return required.every(lvl => state.completedLevels.includes(lvl));
      }
    },
    {
      id: 'subquery_ninja',
      title: 'Subquery Ninja',
      description: 'Complete nested and correlated subqueries (Levels 29 and 30)',
      icon: '🥷',
      check: (state) => state.completedLevels.includes(29) && state.completedLevels.includes(30)
    },
    {
      id: 'oracle_specialist',
      title: 'Oracle Specialist',
      description: 'Complete all Advanced SQL topics in World 4 (Levels 31 to 40)',
      icon: '🔥',
      check: (state) => {
        const required = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40];
        return required.every(lvl => state.completedLevels.includes(lvl));
      }
    },
    {
      id: 'analytics_master',
      title: 'Analytics Master',
      description: 'Master Window functions and Running Totals (Levels 39 to 42)',
      icon: '📊',
      check: (state) => {
        const required = [39, 40, 41, 42];
        return required.every(lvl => state.completedLevels.includes(lvl));
      }
    },
    {
      id: 'sql_master',
      title: 'SQL Master',
      description: 'Complete the entire curriculum and unlock level 50',
      icon: '🏆',
      check: (state) => state.completedLevels.includes(50)
    }
  ];

  // Scans all locked badges in user state and updates/saves achievements
  function checkUnlocks(progressState) {
    let newlyUnlocked = [];
    BADGES.forEach(badge => {
      if (!progressState.badges.includes(badge.id)) {
        if (badge.check(progressState)) {
          progressState.badges.push(badge.id);
          newlyUnlocked.push(badge);
        }
      }
    });

    return newlyUnlocked;
  }

  return {
    BADGES,
    checkUnlocks
  };

})();

// Expose to window/global scope
if (typeof window !== 'undefined') {
  window.Achievements = Achievements;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Achievements };
}
