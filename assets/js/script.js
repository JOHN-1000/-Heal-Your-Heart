// ==========================================
// ส่วนตั้งค่าระบบฐานข้อมูล (Google Sheets)
// ==========================================
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyzqJb0rqqaMR7lXSfTIl6PXQsuBU5aX-fpWH8rbE8bDrSOSCwPi8T5Rqlg5cvrH3USfAA/exec"; 

// ==========================================
// 1. โหลดระบบพื้นฐานเมื่อเปิดเว็บ
// ==========================================
window.onload = function() {
    checkUser();
    showDailyQuote();
    
    // ตรวจสอบหน้าเพื่อเรียกฟังก์ชันให้ตรงกับ Element ที่มี
    if (document.getElementById('questions-2q') || document.getElementById('questions-9q')) renderQuestions();
    if (document.getElementById('result-content')) loadResult();
    if (document.getElementById('dailyChart')) renderRealStats(); 
};

function showDailyQuote() {
    const quotes = [
        "ไม่เป็นไรนะ ถ้าวันนี้จะรู้สึกเหนื่อย การพักผ่อนไม่ใช่ความพ่ายแพ้ 💖",
        "คุณเก่งมากแล้วที่ผ่านเรื่องราวต่างๆ มาได้จนถึงวันนี้ 🌻",
        "อย่าลืมใจดีกับตัวเองให้มากๆ นะ คุณคู่ควรกับความรักเสมอ 🥰",
        "ท้องฟ้ายังมีมืดมิดและสว่าง ใจเราก็มีวันอ่อนแอและเข้มแข็งได้เหมือนกัน ⛅",
        "วันนี้ทำเต็มที่แล้ว พรุ่งนี้ค่อยว่ากันใหม่นะ คืนนี้ฝันดี 🌙"
    ];
    const quoteElement = document.getElementById('daily-quote');
    if (quoteElement) {
        const randomIndex = Math.floor(Math.random() * quotes.length);
        quoteElement.innerText = quotes[randomIndex];
    }
}

function checkUser() {
    const user = localStorage.getItem('userName');
    const displayElement = document.getElementById('user-display');
    if (user && displayElement) {
        displayElement.innerText = `สวัสดีคุณ ${user} 👋`;
    }
}

function toggleMobileMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
}

// ==========================================
// 2. ระบบเรนเดอร์คำถาม (สร้างจาก ASSESSMENT_DATA ใน data.js)
// ==========================================
function renderQuestions() {
    const container2Q = document.getElementById('questions-2q');
    const container9Q = document.getElementById('questions-9q');
    const containerST5 = document.getElementById('questions-st5');

    // เรนเดอร์คำถาม 2Q (เพิ่มส่วนนี้เพื่อให้เห็นคำถาม q2)
    if (container2Q) {
        container2Q.innerHTML = "";
        ASSESSMENT_DATA.q2.forEach((q) => {
            container2Q.innerHTML += `
                <div class="form-group" style="border-bottom:1px solid #f0f0f0; padding-bottom:15px;">
                    <label class="form-label">${q.text}</label>
                    <div class="radio-tile-group">
                        <label class="radio-tile-label"><input type="radio" name="${q.id}" value="yes"> <div class="radio-tile">มี</div></label>
                        <label class="radio-tile-label"><input type="radio" name="${q.id}" value="no"> <div class="radio-tile">ไม่มี</div></label>
                    </div>
                </div>`;
        });
    }

    // เรนเดอร์ 9Q
    if (container9Q) {
        container9Q.innerHTML = "";
        ASSESSMENT_DATA.q9.forEach((q, i) => {
            container9Q.innerHTML += createRadioHtml(`q9_${i}`, q, [0, 1, 2, 3], ["ไม่เลย", "บางวัน", "บ่อย", "ทุกวัน"]);
        });
    }

    // เรนเดอร์ ST-5
    if (containerST5) {
        containerST5.innerHTML = "";
        ASSESSMENT_DATA.st5.forEach((q, i) => {
            containerST5.innerHTML += createRadioHtml(`st5_${i}`, q, [0, 1, 2, 3], ["แทบไม่มี", "บางครั้ง", "บ่อยครั้ง", "ประจำ"]);
        });
    }
}

function createRadioHtml(name, question, values, labels) {
    let html = `<div class="form-group" style="border-bottom:1px solid #f0f0f0; padding-bottom:15px;">
        <label class="form-label">${question}</label>
        <div class="radio-tile-group">`;
    values.forEach((val, idx) => {
        html += `<label class="radio-tile-label">
                <input type="radio" name="${name}" value="${val}">
                <div class="radio-tile">${labels[idx]} (${val})</div>
            </label>`;
    });
    html += `</div></div>`;
    return html;
}

// ==========================================
// 3. ระบบบันทึกข้อมูลและส่งค่า (POST)
// ==========================================
function submitAll() {
    let score9Q = 0, scoreST5 = 0;
    let allAnswered = true;

    // ตรวจสอบการตอบ 2Q
    const q2_1 = document.querySelector('input[name="q2_1"]:checked');
    const q2_2 = document.querySelector('input[name="q2_2"]:checked');
    if (!q2_1 || !q2_2) allAnswered = false;

    // คำนวณคะแนน 9Q
    for (let i = 0; i < 9; i++) {
        const sel = document.querySelector(`input[name="q9_${i}"]:checked`);
        if (sel) score9Q += parseInt(sel.value); else allAnswered = false;
    }

    // คำนวณคะแนน ST-5
    for (let i = 0; i < 5; i++) {
        const sel = document.querySelector(`input[name="st5_${i}"]:checked`);
        if (sel) scoreST5 += parseInt(sel.value); else allAnswered = false;
    }

    if (!allAnswered) {
        alert("กรุณาตอบคำถามให้ครบทุกข้อก่อนส่งครับ 📝");
        return;
    }

    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const job = document.getElementById('job').value;

    if (!age || !gender || !job) {
        alert("กรุณากรอกข้อมูลส่วนตัวให้ครบถ้วนครับ");
        return;
    }
    saveData(score9Q, scoreST5, age, gender, job);
}

function saveData(s9, s5, age, gender, job) {
    document.body.style.cursor = "wait";
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newData = { date: dateStr, gender: gender, age: age, job: job, score9Q: s9, scoreST5: s5 };
    
    localStorage.setItem('healHeartResult', JSON.stringify(newData));

    fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        body: JSON.stringify(newData)
    })
    .then(() => {
        document.body.style.cursor = "default";
        window.location.href = 'result.html';
    })
    .catch(() => {
        document.body.style.cursor = "default";
        window.location.href = 'result.html';
    });
}

// ==========================================
// 4. ระบบดึงข้อมูลสถิติจริง (GET)
// ==========================================
async function renderRealStats() {
    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        const allData = await response.json(); 

        let jobCounts = { "นักเรียน/นศ.": 0, "ข้าราชการ": 0, "พนักงานบริษัท": 0, "ธุรกิจ/ค้าขาย": 0, "ฟรีแลนซ์/อื่นๆ": 0 };
        let visitDates = {};

        allData.forEach(row => {
            const dateStr = row[0].split(' ')[0]; 
            visitDates[dateStr] = (visitDates[dateStr] || 0) + 1;
            const job = row[3];
            if (jobCounts.hasOwnProperty(job)) jobCounts[job]++;
            else jobCounts["ฟรีแลนซ์/อื่นๆ"]++;
        });

        const totalUsers = allData.length;
        const totalElement = document.querySelector('.stats-card h1'); 
        if (totalElement) totalElement.innerText = totalUsers.toLocaleString();

        new Chart(document.getElementById('dailyChart'), {
            type: 'line',
            data: {
                labels: Object.keys(visitDates),
                datasets: [{ label: 'จำนวนผู้ใช้งานจริง', data: Object.values(visitDates), borderColor: '#ff758c', fill: true, tension: 0.4 }]
            }
        });

        new Chart(document.getElementById('jobChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(jobCounts),
                datasets: [{ data: Object.values(jobCounts), backgroundColor: ['#ff758c', '#a29bfe', '#74b9ff', '#ffeaa7', '#fab1a0'] }]
            }
        });

    } catch (e) { console.error("ไม่สามารถดึงข้อมูลสถิติได้:", e); }
}

// ==========================================
// 5. แสดงผลลัพธ์
// ==========================================
function loadResult() {
    const data = JSON.parse(localStorage.getItem('healHeartResult'));
    const container = document.getElementById('result-content');
    if (!data || !container) return;
    let color = data.score9Q < 7 ? "#00b894" : (data.score9Q <= 12 ? "#fdcb6e" : "#d63031");
    container.innerHTML = `
        <div class="text-center">
            <h1 style="font-size:4rem; color:${color}; margin:0;">${data.score9Q}</h1>
            <p>คะแนนความเครียด ST-5: ${data.scoreST5}</p>
            <small>ทำรายการเมื่อ: ${data.date}</small>
        </div>
    `;
}
