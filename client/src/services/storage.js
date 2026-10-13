// CodeFlow Client Storage Service (Guest Mode & Persistent Client State)

const STORAGE_KEYS = {
  THEME: 'cf_theme',
  USER: 'cf_user',
  LESSON_PROGRESS: 'cf_lesson_progress',
  CODING_ATTEMPTS: 'cf_coding_attempts',
  QUIZ_ATTEMPTS: 'cf_quiz_attempts',
  ASSESSMENT_ATTEMPTS: 'cf_assessment_attempts',
  PROJECTS: 'cf_projects',
  DAILY_ACTIVITY: 'cf_daily_activity',
  XP_TOTAL: 'cf_xp_total',
  STREAK: 'cf_streak'
};

export const storage = {
  getUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : { id: 'guest', username: 'Guest Student', isGuest: true, xp: 0 };
    } catch {
      return { id: 'guest', username: 'Guest Student', isGuest: true, xp: 0 };
    }
  },

  setUser(user) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  getLessonProgress() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LESSON_PROGRESS)) || [];
    } catch {
      return [];
    }
  },

  markLessonComplete(lessonId, lessonSlug) {
    const list = this.getLessonProgress();
    if (!list.includes(lessonId)) {
      list.push(lessonId);
      localStorage.setItem(STORAGE_KEYS.LESSON_PROGRESS, JSON.stringify(list));
      this.recordActivity('lesson_completed');
      this.addXP(25);
    }
    return list;
  },

  getQuizAttempts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUIZ_ATTEMPTS)) || [];
    } catch {
      return [];
    }
  },

  recordQuizAttempt(attempt) {
    const attempts = this.getQuizAttempts();
    attempts.push({
      ...attempt,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.QUIZ_ATTEMPTS, JSON.stringify(attempts));
    this.recordActivity('quiz_attempt');
    if (attempt.correct) {
      this.addXP(10);
    }
  },

  getAssessmentAttempts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ASSESSMENT_ATTEMPTS)) || [];
    } catch {
      return [];
    }
  },

  recordAssessmentAttempt(attempt) {
    const list = this.getAssessmentAttempts();
    list.push({
      ...attempt,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.ASSESSMENT_ATTEMPTS, JSON.stringify(list));
    this.recordActivity('assessment_completed');
    this.addXP(attempt.score || 50);
  },

  getXP() {
    try {
      const xp = localStorage.getItem(STORAGE_KEYS.XP_TOTAL);
      return xp ? parseInt(xp, 10) : 0;
    } catch {
      return 0;
    }
  },

  addXP(amount) {
    const current = this.getXP();
    const updated = current + amount;
    localStorage.setItem(STORAGE_KEYS.XP_TOTAL, updated.toString());
    return updated;
  },

  getStreak() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEYS.STREAK));
      if (!data) return { count: 0, lastDate: null };

      const today = new Date().toISOString().slice(0, 10);
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      if (data.lastDate === today) {
        return data;
      } else if (data.lastDate === yesterday) {
        return data;
      } else {
        // Streak expired
        return { count: 0, lastDate: null };
      }
    } catch {
      return { count: 0, lastDate: null };
    }
  },

  recordActivity(type) {
    const today = new Date().toISOString().slice(0, 10);
    const streak = this.getStreak();

    if (streak.lastDate !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1;
      const updatedStreak = { count: newCount, lastDate: today };
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updatedStreak));
    }

    try {
      const activity = JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_ACTIVITY)) || [];
      activity.unshift({
        type,
        timestamp: new Date().toISOString()
      });
      // Keep last 50 activities
      localStorage.setItem(STORAGE_KEYS.DAILY_ACTIVITY, JSON.stringify(activity.slice(0, 50)));
    } catch {
      // ignore
    }
  },

  getRecentActivity() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DAILY_ACTIVITY)) || [];
    } catch {
      return [];
    }
  },

  clearAllData() {
    Object.values(STORAGE_KEYS).forEach(k => {
      if (k !== STORAGE_KEYS.THEME) {
        localStorage.removeItem(k);
      }
    });
  }
};
