/**
 * 刷题记录追踪器（纯静态版）
 * 在用户提交答案时，将答案和判分结果保存到 localStorage
 */
(function() {
    'use strict';

    // 题型分值
    const SCORE_MAP = {
        p1: 1,
        p2: 2,
        task1: 1,
        task2: 1,
        part4: 2,
        part5: 1.5,
        part6: 1.5
    };

    const PART_NAMES = {
        'p1': '阅读判断',
        'p2': '阅读选择',
        'task1': '段落标题',
        'task2': '补全句子',
        'part4': '填句补文',
        'part5': '填词补文',
        'part6': '完形补文'
    };

    // 从当前页面提取考试信息
    function getExamInfo() {
        const title = document.title;
        let match = title.match(/(\d{4})年(\d{1,2})月/);
        if (match) {
            return {
                examTitle: title.replace(/\s*·\s*.*$/, '').trim(),
                examYear: parseInt(match[1]),
                examMonth: parseInt(match[2])
            };
        }
        const urlMatch = window.location.pathname.match(/(\d{4})年(\d{1,2})月/);
        if (urlMatch) {
            return {
                examTitle: document.title || (urlMatch[1] + '年' + urlMatch[2] + '月 真题'),
                examYear: parseInt(urlMatch[1]),
                examMonth: parseInt(urlMatch[2])
            };
        }
        return null;
    }

    // 收集当前页面的所有答案（带判分）
    function collectAndGradeAnswers() {
        if (typeof ANSWERS === 'undefined') return [];

        const results = [];

        // Part 1: 阅读判断 (1-10)
        for (let i = 1; i <= 10; i++) {
            const selected = document.querySelector(`input[name="p1_${i}"]:checked`);
            if (selected) {
                const correct = ANSWERS.p1[i - 1];
                results.push({
                    part: 'p1',
                    questionNum: i,
                    userAnswer: selected.value,
                    correctAnswer: correct,
                    isCorrect: selected.value === correct,
                    explanation: ANSWERS.p1Explain ? ANSWERS.p1Explain[i - 1] : ''
                });
            }
        }

        // Part 2: 阅读选择 (11-15)
        for (let i = 11; i <= 15; i++) {
            const selected = document.querySelector(`input[name="p2_${i}"]:checked`);
            if (selected) {
                const correct = ANSWERS.p2[i - 11];
                const userAns = selected.value.charAt(0);
                results.push({
                    part: 'p2',
                    questionNum: i,
                    userAnswer: userAns,
                    correctAnswer: correct,
                    isCorrect: userAns === correct,
                    explanation: ANSWERS.p2Explain ? ANSWERS.p2Explain[i - 11] : ''
                });
            }
        }

        // Task 1: 段落标题 (16-20)
        for (let i = 16; i <= 20; i++) {
            const sel = document.getElementById(`sel_task1_${i}`);
            if (sel && sel.value) {
                const correct = ANSWERS.task1[i - 16];
                results.push({
                    part: 'task1',
                    questionNum: i,
                    userAnswer: sel.value,
                    correctAnswer: correct,
                    isCorrect: sel.value === correct,
                    explanation: ANSWERS.task1Explain ? ANSWERS.task1Explain[i - 16] : ''
                });
            }
        }

        // Task 2: 补全句子 (21-25)
        for (let i = 21; i <= 25; i++) {
            const sel = document.getElementById(`sel_task2_${i}`);
            if (sel && sel.value) {
                const correct = ANSWERS.task2[i - 21];
                results.push({
                    part: 'task2',
                    questionNum: i,
                    userAnswer: sel.value,
                    correctAnswer: correct,
                    isCorrect: sel.value === correct,
                    explanation: ANSWERS.task2Explain ? ANSWERS.task2Explain[i - 21] : ''
                });
            }
        }

        // Part 4: 填句补文 (26-30)
        for (let i = 26; i <= 30; i++) {
            const sel = document.getElementById(`part4_${i}`);
            if (sel && sel.value) {
                const correct = ANSWERS.part4[i - 26];
                results.push({
                    part: 'part4',
                    questionNum: i,
                    userAnswer: sel.value,
                    correctAnswer: correct,
                    isCorrect: sel.value === correct,
                    explanation: ANSWERS.part4Explain ? ANSWERS.part4Explain[i - 26] : ''
                });
            }
        }

        // Part 5: 填词补文 (31-40)
        for (let i = 31; i <= 40; i++) {
            const sel = document.getElementById(`part5_${i}`);
            if (sel && sel.value) {
                const correct = ANSWERS.part5[i - 31];
                results.push({
                    part: 'part5',
                    questionNum: i,
                    userAnswer: sel.value,
                    correctAnswer: correct,
                    isCorrect: sel.value === correct,
                    explanation: ANSWERS.part5Explain ? ANSWERS.part5Explain[i - 31] : ''
                });
            }
        }

        // Part 6: 完形补文 (41-50)
        for (let i = 41; i <= 50; i++) {
            const inp = document.getElementById(`part6_${i}`);
            if (inp && inp.value.trim()) {
                const correct = ANSWERS.part6[i - 41];
                const userAns = inp.value.trim().toLowerCase();
                const isCorrect = userAns === correct.toLowerCase();
                results.push({
                    part: 'part6',
                    questionNum: i,
                    userAnswer: inp.value.trim(),
                    correctAnswer: correct,
                    isCorrect: isCorrect,
                    explanation: ANSWERS.part6Explain ? ANSWERS.part6Explain[i - 41] : ''
                });
            }
        }

        return results;
    }

    // 保存到 localStorage
    function saveToLocalStorage(examInfo, answers) {
        if (!QuizApp || !QuizApp.User.isLoggedIn()) return;

        if (answers.length === 0) return;

        QuizApp.Data.saveExamAnswers(examInfo, answers);

        // 计算得分统计
        const correctCount = answers.filter(a => a.isCorrect).length;
        const wrongCount = answers.filter(a => !a.isCorrect).length;

        console.log(
            '[刷题记录] 已保存 ' + answers.length + ' 题 | ' +
            '正确 ' + correctCount + ' | 错误 ' + wrongCount +
            ' | 考试: ' + examInfo.examTitle
        );
    }

    // 在结果区域添加辅助链接
    function addHelperLinks() {
        const resultArea = document.getElementById('resultArea');
        if (!resultArea || resultArea.style.display === 'none') return;
        if (document.getElementById('trackerLinks')) return;

        const isLoggedIn = QuizApp && QuizApp.User.isLoggedIn();
        const loginHint = isLoggedIn ? '' :
            '<span style="margin-left:12px;color:#888;font-size:0.8rem;">（<a href="login.html" style="color:#e9a;">登录</a>后可保存错题记录）</span>';

        const linkArea = document.createElement('div');
        linkArea.id = 'trackerLinks';
        linkArea.style.cssText = 'margin-top:16px;padding-top:16px;border-top:1px dashed #ccc;text-align:center;';
        linkArea.innerHTML = `
            <a href="wrong-questions.html" style="display:inline-block;background:#e9a;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-weight:600;font-size:0.95rem;transition:background 0.2s;margin:0 6px;" onmouseover="this.style.background='#d89'" onmouseout="this.style.background='#e9a'">
                查看错题本
            </a>
            <a href="index.html" style="display:inline-block;background:#333;color:#fff;text-decoration:none;padding:10px 24px;border-radius:6px;font-weight:600;font-size:0.95rem;transition:background 0.2s;margin:0 6px;" onmouseover="this.style.background='#555'" onmouseout="this.style.background='#333'">
                返回试卷列表
            </a>
            ${loginHint}
        `;
        resultArea.appendChild(linkArea);
    }

    // 拦截提交按钮
    function hookSubmitButton() {
        const submitBtn = document.getElementById('submitBtn');
        if (!submitBtn) return;

        submitBtn.addEventListener('click', function () {
            setTimeout(function () {
                const examInfo = getExamInfo();
                if (!examInfo) {
                    console.warn('[刷题记录] 无法确定考试信息');
                    return;
                }

                const answers = collectAndGradeAnswers();
                if (answers.length > 0) {
                    saveToLocalStorage(examInfo, answers);
                }

                addHelperLinks();
            }, 300);
        });
    }

    // 恢復上次答題進度（標記已選中的選項）
    function restorePreviousAnswers() {
        if (!QuizApp || !QuizApp.User.isLoggedIn()) return;

        const examInfo = getExamInfo();
        if (!examInfo) return;

        const progress = QuizApp.Data.getExamProgress(examInfo.examYear, examInfo.examMonth);
        const entries = Object.entries(progress);
        if (entries.length === 0) return;

        // 创建恢复提示条
        const container = document.querySelector('.container');
        if (!container) return;

        const restoreBar = document.createElement('div');
        restoreBar.id = 'restoreBar';
        restoreBar.style.cssText = 'background:#fffbe6;border:1px solid #ffe58f;padding:10px 16px;margin-bottom:16px;border-radius:4px;text-align:center;font-size:0.85rem;color:#8c6d00;';
        restoreBar.innerHTML = `
            检测到你之前做过这份试卷（${entries.length} 题有记录），
            <a href="javascript:void(0)" id="restoreBtn" style="color:#d48806;font-weight:600;text-decoration:underline;">点击恢复答案</a>
            <span id="restoreDone" style="display:none;"> ✅ 已恢复</span>
        `;

        const headerWrapper = container.querySelector('.header-wrapper');
        if (headerWrapper) {
            headerWrapper.insertAdjacentElement('afterend', restoreBar);
        } else {
            container.insertBefore(restoreBar, container.firstChild);
        }

        document.getElementById('restoreBtn').addEventListener('click', function () {
            let restored = 0;
            for (const [subKey, val] of entries) {
                // subKey format: "p1_1", "part5_32", etc.
                const parts = subKey.split('_');
                if (parts.length < 2) continue;
                const partPrefix = parts[0];
                const num = parts[parts.length - 1];

                if (partPrefix === 'p1' || partPrefix === 'p2') {
                    const radio = document.querySelector(`input[name="${partPrefix}_${num}"][value="${val.userAnswer}"]`);
                    if (radio) { radio.checked = true; restored++; }
                } else if (partPrefix === 'task1' || partPrefix === 'task2') {
                    const sel = document.getElementById(`sel_${subKey}`);
                    if (sel) { sel.value = val.userAnswer; restored++; }
                } else if (partPrefix === 'part4' || partPrefix === 'part5') {
                    const sel = document.getElementById(`${partPrefix}_${num}`);
                    if (sel) { sel.value = val.userAnswer; restored++; }
                } else if (partPrefix === 'part6') {
                    const inp = document.getElementById(`part6_${num}`);
                    if (inp) { inp.value = val.userAnswer; restored++; }
                }
            }
            document.getElementById('restoreBtn').style.display = 'none';
            document.getElementById('restoreDone').style.display = 'inline';
            console.log('[刷题记录] 恢复了 ' + restored + ' 题');
        });
    }

    // 初始化
    function init() {
        // 等待 QuizApp 加载完成
        if (typeof QuizApp === 'undefined') {
            setTimeout(init, 100);
            return;
        }
        hookSubmitButton();
        restorePreviousAnswers();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 300);
    }

})();
