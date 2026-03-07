// ==========================================
// ส่วนตั้งค่าระบบฐานข้อมูล (Google Sheets)
// ==========================================
// ลิงก์ Web App URL จากเวอร์ชันล่าสุด (เวอร์ชัน 4)
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyzqJb0rqqaMR7lXSfTIl6PXQsuBU5aX-fpWH8rbE8bDrSOSCwPi8T5Rqlg5cvrH3USfAA/exec"; 

// ==========================================
// 1. โหลดระบบพื้นฐานเมื่อเปิดเว็บ
// ==========================================
window.onload = function() {
    checkUser();
    showDailyQuote();
    
    // ตรวจสอบ ID ของ Element ในหน้า HTML เพื่อเรียกใช้งานฟังก์ชันให้ถูกต้อง
    if (document.getElementById('questions-9q')) renderQuestions();
    if (document.getElementById('result-content')) loadResult();
    // ถ้าพบกราฟ dailyChart แสดงว่าอยู่หน้า stats.html ให้ดึงข้อมูลจริงมาโชว์
    if (document.getElementById('dailyChart')) renderRealStats(); 
};

function showDailyQuote() {
    const quotes = [
        "ไม่เป็นไรนะ ถ้าวันนี้จะรู้สึกเหนื่อย การพักผ่อนไม่ใช่ความพ่ายแพ้ 💖",
        "คุณเก่งมากแล้วที่ผ่านเรื่องราวต่างๆ มาได้จนถึงวันนี้ 🌻",
        "ร้องไห้บ้างก็ได้นะ น้ำตาจะช่วยชะล้างความเศร้าในใจ 🌧️",
        "ท้องฟ้ายังมีมืดมิดและสว่าง ใจเราก็มีวันอ่อนแอและเข้มแข็งได้เหมือนกัน ⛅",
        "อย่าลืมใจดีกับตัวเองให้มากๆ นะ คุณคู่ควรกับความรักเสมอ 🥰",
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
// 2. ระบบเรนเดอร์คำถาม (ดึงข้อมูลจาก ASSESSMENT_DATA)
// ==========================================
function renderQuestions() {
    const container9Q = document.getElementById('questions-9q');
    const containerST5 = document.getElementById('questions-st5');

    if(container9Q) {
        ASSESSMENT_DATA.q9.forEach((q, i) => {
            container9Q.innerHTML += createRadioHtml(`q9_${i}`, q, [0, 1, 2, 3], ["ไม่เลย", "บางวัน", "บ่อย", "ทุกวัน"]);
        });
    }

    if(containerST5) {
        ASSESSMENT_DATA.st5.forEach((q, i) => {
            containerST5.innerHTML += createRadioHtml(`st5_${i}`, q, [0, 1, 2, 3], ["แทบไม่มี", "เป็นบางครั้ง", "บ่อยครั้ง", "ประจำ"]);
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
// 3. ระบบบันทึกข้อมูล (ส่งค่าไป Google Sheets)
// ==========================================
function submitAll() {
    let score9Q = 0, scoreST5 = 0;
    
    // รวมคะแนน 9Q
    for (let i = 0; i < 9; i++) {
        const sel = document.querySelector(`input[name="q9_${i}"]:checked`);
        if (sel) score9Q += parseInt(sel.value);
    }
    // รวมคะแนน ST-5
    for (let i = 0; i < 5; i++) {
        const sel = document.querySelector(`input[name="st5_${i}"]:checked`);
        if (sel) scoreST5 += parseInt(sel.value);
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
    
    // ข้อมูลที่จะส่งตรงกับโครงสร้างใน Apps Script
    const newData = { date: dateStr, gender: gender, age: age, job: job, score9Q: s9, scoreST5: s5 };
    
    localStorage.setItem('healHeartResult', JSON.stringify(newData));

    // ส่งข้อมูลแบบ POST ไปยัง Google Sheets
    fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        body: JSON.stringify(newData)
    })
    .then(() => {
        document.body.style.cursor = "default";
        window.location.href = 'result.html';
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = 'result.html';
    });
}

// ==========================================
// 4. ระบบดึงข้อมูลมาแสดงสถิติจริง (GET)
// ==========================================
async function renderRealStats() {
    try {
        // ดึงข้อมูลผ่าน doGet ใน Apps Script
        const response = await fetch(GOOGLE_SHEET_URL);
        const allData = await response.json(); 

        let jobCounts = { "นักเรียน/นศ.": 0, "ข้าราชการ": 0, "พนักงานบริษัท": 0, "ธุรกิจ/ค้าขาย": 0, "ฟรีแลนซ์/อื่นๆ": 0 };
        let visitDates = {};

        allData.forEach(row => {
            // row[0]=วันที่, row[3]=อาชีพ
            const dateStr = row[0].split(' ')[0]; 
            visitDates[dateStr] = (visitDates[dateStr] || 0) + 1;
            
            const job = row[3];
            if (jobCounts.hasOwnProperty(job)) jobCounts[job]++;
            else jobCounts["ฟรีแลนซ์/อื่นๆ"]++;
        });

        // อัปเดตตัวเลขรวมในหน้าเว็บ
        const totalUsers = allData.length;
        const totalElement = document.querySelector('.stats-card h1'); // เข้าถึงตัวเลขสรุป
        if (totalElement) totalElement.innerText = totalUsers.toLocaleString();

        // สร้างกราฟเส้น (จำนวนคนทำแบบทดสอบ)
        new Chart(document.getElementById('dailyChart'), {
            type: 'line',
            data: {
                labels: Object.keys(visitDates),
                datasets: [{ 
                    label: 'จำนวนผู้ใช้งาน', 
                    data: Object.values(visitDates), 
                    borderColor: '#ff758c', 
                    backgroundColor: 'rgba(255, 117, 140, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            }
        });

        // สร้างกราฟวงกลม (สัดส่วนอาชีพ)
        new Chart(document.getElementById('jobChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(jobCounts),
                datasets: [{ 
                    data: Object.values(jobCounts), 
                    backgroundColor: ['#ff758c', '#a29bfe', '#74b9ff', '#ffeaa7', '#fab1a0'] 
                }]
            }
        });

    } catch (e) {
        console.error("ไม่สามารถโหลดสถิติได้:", e);
    }
}

// ==========================================
// 5. แสดงผลลัพธ์หน้าสุดท้าย
// ==========================================
function loadResult() {
    const data = JSON.parse(localStorage.getItem('healHeartResult'));
    const container = document.getElementById('result-content');
    if (!data || !container) return;

    let color = data.score9Q < 7 ? "#00b894" : (data.score9Q <= 12 ? "#fdcb6e" : "#d63031");
    
    container.innerHTML = `
        <div class="text-center">
            <h1 style="font-size:4rem; color:${color}; margin:0;">${data.score9Q}</h1>
            <p style="margin-top:0;">(คะแนน ST-5: ${data.scoreST5})</p>
            <div style="background:#f8f9fa; padding:10px; border-radius:10px; margin-top:15px;">
                <small>ทำรายการเมื่อ: ${data.date}</small>
            </div>
        </div>
    `;
}
