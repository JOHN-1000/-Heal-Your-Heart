// ==========================================
// ส่วนตั้งค่าระบบฐานข้อมูล (Google Sheets)
// ==========================================
// ลิงก์ Web App URL ของคุณ
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
    
    // ถ้าอยู่หน้าสถิติ ให้ดึงข้อมูลจริงจาก Google Sheets
    if (document.getElementById('dailyChart')) renderStatsCharts(); 
};

function showDailyQuote() {
    const quotes = [
        "ไม่เป็นไรนะ ถ้าวันนี้จะรู้สึกเหนื่อย การพักผ่อนไม่ใช่ความพ่ายแพ้ 💖",
        "คุณเก่งมากแล้วที่ผ่านเรื่องราวต่างๆ มาได้จนถึงวันนี้ 🌻",
        "ร้องไห้บ้างก็ได้นะ น้ำตาจะช่วยชะล้างความเศร้าในใจ 🌧️",
        "ท้องฟ้ายังมีมืดมิดและสว่าง ใจเราก็มีวันอ่อนแอและเข้มแข็งได้เหมือนกัน ⛅",
        "อย่าลืมใจดีกับตัวเองให้มากๆ นะ คุณคู่ควรกับความรักเสมอ 🥰",
        "ความผิดพลาดคือบทเรียน ไม่ใช่ตัวตัดสินคุณค่าในตัวคุณ 🌱",
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
// 2. เรนเดอร์คำถามแบบประเมิน (ดึงข้อมูลจากไฟล์ data.js)
// ==========================================
function renderQuestions() {
    const container2Q = document.getElementById('questions-2q');
    const container9Q = document.getElementById('questions-9q');
    const containerST5 = document.getElementById('questions-st5');

    // เรนเดอร์ 2Q
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
                <div class="radio-tile">${labels[idx]}</div>
            </label>`;
    });
    html += `</div></div>`;
    return html;
}

// ==========================================
// 3. ควบคุมการเปลี่ยนหน้าแบบประเมิน
// ==========================================
function goToStep2() {
    const consent = document.getElementById('pdpa-consent')?.checked;
    if (document.getElementById('pdpa-consent') && !consent) {
        alert("⚠️ กรุณากดยอมรับเงื่อนไขการใช้งานก่อนดำเนินการต่อครับ");
        return;
    }

    const age = document.getElementById('age').value;
    const job = document.getElementById('job').value;
    const gender = document.getElementById('gender').value;

    if (!age || !gender || !job) { 
        alert("กรุณาระบุข้อมูลส่วนตัวให้ครบถ้วนก่อนครับ"); 
        return; 
    }

    const q2_1 = document.querySelector('input[name="q2_1"]:checked')?.value;
    const q2_2 = document.querySelector('input[name="q2_2"]:checked')?.value;

    if (!q2_1 || !q2_2) {
        alert("กรุณาตอบคำถาม 2Q ให้ครบทั้ง 2 ข้อครับ");
        return;
    }
    
    // ถ้า 2Q ตอบไม่มีทั้งคู่ ถือว่าปกติ ส่งผลทันที
    if (q2_1 === 'no' && q2_2 === 'no') {
        saveData(0, 0, age, gender, job);
        return;
    }

    document.getElementById('step-1').classList.add('hidden');
    document.getElementById('step-2').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goToStep3() {
    let answered9Q = true;
    for (let i = 0; i < ASSESSMENT_DATA.q9.length; i++) {
        if (!document.querySelector(`input[name="q9_${i}"]:checked`)) answered9Q = false;
    }

    if (!answered9Q) {
        alert("กรุณาตอบคำถาม 9Q ให้ครบทุกข้อครับ 📝");
        return;
    }

    document.getElementById('step-2').classList.add('hidden');
    document.getElementById('step-3').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function submitAll() {
    let score9Q = 0, scoreST5 = 0;
    let answeredST5 = true;

    for (let i = 0; i < ASSESSMENT_DATA.q9.length; i++) {
        const sel = document.querySelector(`input[name="q9_${i}"]:checked`);
        if (sel) score9Q += parseInt(sel.value);
    }

    for (let i = 0; i < ASSESSMENT_DATA.st5.length; i++) {
        const sel = document.querySelector(`input[name="st5_${i}"]:checked`);
        if (sel) scoreST5 += parseInt(sel.value); else answeredST5 = false;
    }

    if (!answeredST5) {
        alert("กรุณาตอบคำถาม ST-5 ให้ครบทุกข้อครับ 📝");
        return;
    }

    const age = document.getElementById('age').value;
    const gender = document.getElementById('gender').value;
    const job = document.getElementById('job').value;

    saveData(score9Q, scoreST5, age, gender, job);
}

// ==========================================
// 4. บันทึกผลและส่งข้อมูลไป Google Sheets
// ==========================================
function saveData(s9, s5, age, gender, job) {
    document.body.style.cursor = "wait";
    
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newData = { score9Q: s9, scoreST5: s5, age: age, gender: gender, job: job, date: dateStr };
    
    // บันทึกประวัติลงในเครื่องผู้ใช้
    let history = JSON.parse(localStorage.getItem('healHeartHistory')) || [];
    history.push(newData);
    localStorage.setItem('healHeartHistory', JSON.stringify(history));
    localStorage.setItem('healHeartResult', JSON.stringify(newData));

    // ส่งข้อมูลเข้าฐานข้อมูล Google Sheets
    fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        body: JSON.stringify(newData)
    })
    .then(response => response.json())
    .then(result => {
        document.body.style.cursor = "default"; 
        window.location.href = 'result.html'; 
    })
    .catch(error => {
        console.error('Error:', error);
        document.body.style.cursor = "default";
        window.location.href = 'result.html'; 
    });
}

// ==========================================
// 5. แสดงผลลัพธ์และประวัติ
// ==========================================
function loadResult() {
    const data = JSON.parse(localStorage.getItem('healHeartResult'));
    const container = document.getElementById('result-content');
    
    if (!data) { container.innerHTML = "ไม่พบข้อมูล กรุณาทำแบบประเมินก่อนครับ"; return; }

    let level, color, advice;
    if (data.score9Q < 7) {
        level = "ปกติ"; color = "#00b894"; advice = "สุขภาพจิตดีเยี่ยม! รักษาความสดใสไว้นะครับ ✨";
    } else if (data.score9Q <= 12) {
        level = "ระดับน้อย (Mild)"; color = "#fdcb6e"; advice = "มีความเครียดนิดหน่อย ลองพักผ่อนฟังเพลงดูนะครับ 🎧";
    } else if (data.score9Q <= 18) {
        level = "ระดับปานกลาง"; color = "#e17055"; advice = "เริ่มมีความเสี่ยง ควรปรึกษาผู้เชี่ยวชาญครับ 🧡";
    } else {
        level = "ระดับรุนแรง"; color = "#d63031"; advice = "⚠️ ควรไปพบแพทย์โดยเร็วที่สุด เพื่อรับการดูแลครับ";
    }

    let emergencyBtn = (data.score9Q > 12) ? 
        `<a href="tel:1323" class="btn-main" style="background:#d63031; margin-top:10px;">🚨 โทรสายด่วน 1323</a>` : "";

    container.innerHTML = `
        <div class="text-center">
            <h3 style="color:#636e72;">ผลการประเมินของคุณ</h3>
            <h1 style="font-size:4.5rem; color:${color}; margin: 0;">${data.score9Q}</h1>
            <h2 style="color:${color}; margin-top: -10px;">${level}</h2>
            <p style="color:#636e72; margin-bottom: 20px;">(คะแนนความเครียด ST-5: <b>${data.scoreST5}</b>)</p>
            
            <div style="background:#f8f9fa; padding:10px; border-radius:10px; font-size: 0.9rem;">
                เพศ: ${data.gender} | อายุ: ${data.age} ปี | อาชีพ: ${data.job} <br>
                <small style="color:#b2bec3;">ทำรายการเมื่อ: ${data.date}</small>
            </div>
            
            <div style="background:${color}15; padding:20px; border-radius:15px; margin-top:20px; text-align: left;">
                <h3 style="margin-bottom: 10px;">💡 คำแนะนำ:</h3>
                <p>${advice}</p>
                <div class="text-center">${emergencyBtn}</div>
            </div>
        </div>
    `;

    const history = JSON.parse(localStorage.getItem('healHeartHistory')) || [];
    const historySection = document.getElementById('history-section');
    const historyList = document.getElementById('history-list');

    if (historySection && history.length > 1) {
        historySection.classList.remove('hidden');
        const reversedHistory = [...history].reverse();
        
        let historyHTML = '';
        reversedHistory.forEach((item, index) => {
            historyHTML += `
                <div style="border-bottom: 1px dashed #eee; padding: 10px 0;">
                    <b>ครั้งที่ ${history.length - index}</b> <span style="color:#b2bec3; font-size:0.8rem;">(${item.date})</span><br>
                    <span style="color:#2d3436">คะแนนซึมเศร้า: <b>${item.score9Q}</b> | คะแนนความเครียด: <b>${item.scoreST5}</b></span>
                </div>
            `;
        });
        if(historyList) historyList.innerHTML = historyHTML;
    }
}

// ==========================================
// 6. 📊 ดึงข้อมูลจริงจาก Google Sheets มาสร้างกราฟและตัวเลข
// ==========================================
async function renderStatsCharts() {
    try {
        const response = await fetch(GOOGLE_SHEET_URL);
        const allData = await response.json(); 

        let jobCounts = { "นักเรียน/นศ.": 0, "ข้าราชการ": 0, "พนักงานบริษัท": 0, "ธุรกิจ/ค้าขาย": 0, "ฟรีแลนซ์/อื่นๆ": 0 };
        let ageGroups = { "<15": 0, "15-20": 0, "21-30": 0, "31-40": 0, "41-50": 0, "50+": 0 };
        let visitDates = {};
        
        // ตัวแปรนับจำนวนคนสำหรับกล่องด้านบน
        const totalUsers = allData.length;
        let dailyUsers = 0;
        let riskUsers = 0;
        
        const today = new Date();
        const todayString = `${today.getDate()}/${today.getMonth()+1}/${today.getFullYear()}`;

        // วนลูปนับข้อมูลจริงจากตาราง Google Sheets
        allData.forEach(row => {
            if(row[0]) {
                const dateStr = row[0].split(' ')[0]; 
                visitDates[dateStr] = (visitDates[dateStr] || 0) + 1;
                if(dateStr === todayString) dailyUsers++; // นับคนเข้าวันนี้
            }

            const score9Q = parseInt(row[4]); // คอลัมน์ที่ 4 คือคะแนน 9Q
            if(!isNaN(score9Q) && score9Q > 12) riskUsers++; // นับคนที่ความเสี่ยงสูง

            const age = parseInt(row[2]);
            if (!isNaN(age)) {
                if (age < 15) ageGroups["<15"]++;
                else if (age <= 20) ageGroups["15-20"]++;
                else if (age <= 30) ageGroups["21-30"]++;
                else if (age <= 40) ageGroups["31-40"]++;
                else if (age <= 50) ageGroups["41-50"]++;
                else ageGroups["50+"]++;
            }

            const job = row[3];
            if (jobCounts.hasOwnProperty(job)) jobCounts[job]++;
            else if (job) jobCounts["ฟรีแลนซ์/อื่นๆ"]++;
        });

        // 🟢 เปลี่ยนตัวเลข 128, 8540, 15% เป็นข้อมูลจริง
        if (document.getElementById('total-users')) document.getElementById('total-users').innerText = totalUsers.toLocaleString();
        if (document.getElementById('daily-users')) document.getElementById('daily-users').innerText = dailyUsers.toLocaleString();
        
        const riskPercent = totalUsers > 0 ? Math.round((riskUsers / totalUsers) * 100) : 0;
        if (document.getElementById('risk-users')) document.getElementById('risk-users').innerText = riskPercent + "%";

        // 📈 วาดกราฟเส้น
        new Chart(document.getElementById('dailyChart'), {
            type: 'line',
            data: {
                labels: Object.keys(visitDates),
                datasets: [{ label: 'ผู้ใช้งานจริง (คน)', data: Object.values(visitDates), borderColor: '#ff758c', backgroundColor: 'rgba(255, 117, 140, 0.2)', fill: true, tension: 0.4 }]
            }
        });

        // 🍩 วาดกราฟวงกลม
        new Chart(document.getElementById('jobChart'), {
            type: 'doughnut',
            data: {
                labels: Object.keys(jobCounts),
                datasets: [{ data: Object.values(jobCounts), backgroundColor: ['#ff758c', '#a29bfe', '#74b9ff', '#ffeaa7', '#fab1a0'] }]
            }
        });

        // 📊 วาดกราฟแท่ง
        new Chart(document.getElementById('ageChart'), {
            type: 'bar',
            data: {
                labels: Object.keys(ageGroups),
                datasets: [{ label: 'จำนวนคน', data: Object.values(ageGroups), backgroundColor: '#fdcb6e', borderRadius: 5 }]
            }
        });

    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดสถิติจริง:", error);
    }
}
