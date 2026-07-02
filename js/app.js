/**
 * QuizApp — 自考英语刷题平台 本地数据管理模块
 * ==============================================
 * 全静态架构，数据存储在浏览器 localStorage 中。
 * 
 * 数据结构：
 *   quiz_users            — { username: { passwordHash, salt, createdAt } }
 *   quiz_current_user      — "username" | null
 *   quiz_answers_{username} — { "2024_4_p1_1": { userAnswer, correctAnswer, isCorrect, explanation, examTitle, examYear, examMonth, part, questionNum, answeredAt, reviewed }, ... }
 */
const QuizApp = (function () {
  'use strict';

  // ==================== 工具函数 ====================

  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  }

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + c;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  function hashPassword(password, salt) {
    return simpleHash(salt + password + salt.split('').reverse().join(''));
  }

  function getAnswersKey(username) {
    return 'quiz_answers_' + (username || '');
  }

  function makeQuestionKey(record) {
    return record.examYear + '_' + record.examMonth + '_' + record.part + '_' + record.questionNum;
  }

  // ==================== 用户管理 ====================

  const User = {

    /**
     * 注册新用户
     */
    register(username, password) {
      if (!username || !password) {
        return { success: false, error: '用户名和密码不能为空' };
      }
      username = username.trim();
      if (username.length < 2 || username.length > 20) {
        return { success: false, error: '用户名长度应为 2-20 个字符' };
      }
      if (password.length < 6) {
        return { success: false, error: '密码长度至少 6 个字符' };
      }

      const users = this._getAllUsers();
      if (users[username]) {
        return { success: false, error: '用户名已存在，请换一个' };
      }

      const salt = generateId();
      users[username] = {
        passwordHash: hashPassword(password, salt),
        salt: salt,
        createdAt: new Date().toISOString()
      };

      localStorage.setItem('quiz_users', JSON.stringify(users));
      localStorage.setItem('quiz_current_user', username);
      return { success: true, username: username };
    },

    /**
     * 登录
     */
    login(username, password) {
      if (!username || !password) {
        return { success: false, error: '请输入用户名和密码' };
      }
      username = username.trim();

      const users = this._getAllUsers();
      const user = users[username];
      if (!user) {
        return { success: false, error: '用户名不存在' };
      }

      const inputHash = hashPassword(password, user.salt);
      if (inputHash !== user.passwordHash) {
        return { success: false, error: '密码错误' };
      }

      localStorage.setItem('quiz_current_user', username);
      return { success: true, username: username };
    },

    /**
     * 退出登录
     */
    logout() {
      localStorage.removeItem('quiz_current_user');
    },

    /**
     * 获取当前登录用户
     */
    getCurrent() {
      return localStorage.getItem('quiz_current_user') || null;
    },

    /**
     * 是否已登录
     */
    isLoggedIn() {
      return !!this.getCurrent();
    },

    /**
     * 获取所有用户（内部使用）
     */
    _getAllUsers() {
      try {
        return JSON.parse(localStorage.getItem('quiz_users') || '{}');
      } catch (e) {
        return {};
      }
    }
  };

  // ==================== 数据管理 ====================

  const Data = {

    /**
     * 保存一条答题记录
     * record: { examTitle, examYear, examMonth, part, questionNum, userAnswer, correctAnswer, isCorrect, explanation }
     */
    saveAnswer(record) {
      const username = User.getCurrent();
      if (!username) return;

      const key = getAnswersKey(username);
      const answers = this._getAllAnswers(username);
      const qKey = makeQuestionKey(record);

      answers[qKey] = {
        userAnswer: record.userAnswer,
        correctAnswer: record.correctAnswer,
        isCorrect: record.isCorrect,
        explanation: record.explanation || '',
        examTitle: record.examTitle,
        examYear: record.examYear,
        examMonth: record.examMonth,
        part: record.part,
        questionNum: record.questionNum,
        answeredAt: new Date().toISOString(),
        reviewed: false
      };

      localStorage.setItem(key, JSON.stringify(answers));
    },

    /**
     * 批量保存答题记录（来自一次试卷提交）
     */
    saveExamAnswers(examInfo, answerList) {
      const username = User.getCurrent();
      if (!username) return;

      const key = getAnswersKey(username);
      const answers = this._getAllAnswers(username);
      const now = new Date().toISOString();

      answerList.forEach(a => {
        const qKey = makeQuestionKey({
          examYear: examInfo.examYear,
          examMonth: examInfo.examMonth,
          part: a.part,
          questionNum: a.questionNum
        });

        // 保留之前的 reviewed 状态
        const existed = answers[qKey];
        const reviewed = existed ? existed.reviewed : false;

        answers[qKey] = {
          userAnswer: a.userAnswer,
          correctAnswer: a.correctAnswer,
          isCorrect: a.isCorrect,
          explanation: a.explanation || '',
          examTitle: examInfo.examTitle,
          examYear: examInfo.examYear,
          examMonth: examInfo.examMonth,
          part: a.part,
          questionNum: a.questionNum,
          answeredAt: now,
          reviewed: reviewed
        };
      });

      localStorage.setItem(key, JSON.stringify(answers));
    },

    /**
     * 获取错题列表
     */
    getWrongQuestions() {
      const answers = this._getAllAnswers(User.getCurrent());
      const result = [];

      for (const [key, val] of Object.entries(answers)) {
        if (!val.isCorrect && !val.reviewed) {
          result.push({
            key: key,
            ...val
          });
        }
      }

      // 按时间倒序排列
      result.sort((a, b) => new Date(b.answeredAt) - new Date(a.answeredAt));
      return result;
    },

    /**
     * 标记题目为已掌握（从错题本移除）
     */
    markAsReviewed(examYear, examMonth, part, questionNum) {
      const username = User.getCurrent();
      if (!username) return;

      const answers = this._getAllAnswers(username);
      const qKey = examYear + '_' + examMonth + '_' + part + '_' + questionNum;

      if (answers[qKey]) {
        answers[qKey].reviewed = true;
        localStorage.setItem(getAnswersKey(username), JSON.stringify(answers));
      }
    },

    /**
     * 获取统计信息
     */
    getStats() {
      const answers = this._getAllAnswers(User.getCurrent());
      let total = 0, correct = 0, wrong = 0;

      for (const val of Object.values(answers)) {
        total++;
        if (val.isCorrect) correct++;
        else wrong++;
      }

      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

      return { total, correct, wrong, accuracy };
    },

    /**
     * 获取某次考试的答题情况
     */
    getExamProgress(examYear, examMonth) {
      const answers = this._getAllAnswers(User.getCurrent());
      const result = {};

      for (const [key, val] of Object.entries(answers)) {
        if (val.examYear === examYear && val.examMonth === examMonth) {
          const subKey = val.part + '_' + val.questionNum;
          result[subKey] = val;
        }
      }

      return result;
    },

    /**
     * 清除当前用户所有数据
     */
    clearAll() {
      const username = User.getCurrent();
      if (username) {
        localStorage.removeItem(getAnswersKey(username));
      }
    },

    /**
     * 导出数据为 JSON 字符串
     */
    exportData() {
      const username = User.getCurrent();
      if (!username) return null;

      return JSON.stringify({
        username: username,
        answers: this._getAllAnswers(username),
        exportedAt: new Date().toISOString()
      }, null, 2);
    },

    /**
     * 导入数据
     */
    importData(jsonStr) {
      try {
        const data = JSON.parse(jsonStr);
        if (!data.username || !data.answers) {
          return { success: false, error: '数据格式不正确' };
        }

        const key = getAnswersKey(data.username);
        const existing = this._getAllAnswers(data.username);

        // 合并数据，新数据覆盖旧数据
        const merged = { ...existing, ...data.answers };
        localStorage.setItem(key, JSON.stringify(merged));

        return { success: true, count: Object.keys(data.answers).length };
      } catch (e) {
        return { success: false, error: '数据解析失败' };
      }
    },

    // ---- 内部方法 ----

    _getAllAnswers(username) {
      if (!username) return {};
      try {
        return JSON.parse(localStorage.getItem(getAnswersKey(username)) || '{}');
      } catch (e) {
        return {};
      }
    }
  };

  // ==================== 导出 ====================

  return { User, Data };

})();
