window.onload = function() {
    checkUser();
    showDailyQuote();
    
    if (document.getElementById('questions-9q')) renderQuestions();
    if (document.getElementById('result-content')) loadResult();
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

function renderQuestions() {
    const container9Q = document.getElementById('questions-9q');
    const containerST5 = document.getElementById('questions-st5');

    ASSESSMENT_DATA.q9.forEach((q, i) => {
        container9Q.innerHTML += createRadioHtml(`q9_${i}`, q, [0, 1, 2, 3], ["ไม่เลย", "บางวัน", "บ่อย", "ทุกวัน"]);
    });

    ASSESSMENT_DATA.st5.forEach((q, i) => {
        containerST5.innerHTML += createRadioHtml(`st5_${i}`, q, [0, 1, 2, 3], ["แทบไม่มี", "เป็นบางครั้ง", "บ่อยครั้ง", "ประจำ"]);
    });
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

function goToStep2() {
    const consent = document.getElementById('pdpa-consent').checked;
    if (!consent) {
        alert("⚠️ กรุณากดยอมรับเงื่อนไขการใช้งานก่อนดำเนินการต่อครับ");
        return;
    }

    const age = document.getElementById('age').value;
    const job = document.getElementById('job').value;
    const gender = document.getElementById('gender').value;

    if (!age) { alert("กรุณาระบุอายุก่อนครับ"); return; }

    const q2_1 = document.querySelector('input[name="q2_1"]:checked')?.value;
    const q2_2 = document.querySelector('input[name="q2_2"]:checked')?.value;
    
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
        score9Q += parseInt(document.querySelector(`input[name="q9_${i}"]:checked`).value);
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

function saveData(s9, s5, age, gender, job) {
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} เวลา ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')} น.`;

    const newData = { score9Q: s9, scoreST5: s5, age, gender, job, date: dateStr };
    
    let history = JSON.parse(localStorage.getItem('healHeartHistory')) || [];
    history.push(newData);
    localStorage.setItem('healHeartHistory', JSON.stringify(history));

    localStorage.setItem('healHeartResult', JSON.stringify(newData));
    window.location.href = 'result.html';
}

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

    if (history.length > 1) {
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
        historyList.innerHTML = historyHTML;
    }
}

function downloadResultImage() {
    const resultCard = document.getElementById('result-content');
    html2canvas(resultCard, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'Heal-Your-Heart-Result.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function clearHistory() {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการประเมินทั้งหมด?")) {
        localStorage.removeItem('healHeartHistory');
        localStorage.removeItem('healHeartResult');
        window.location.reload();
    }
}

function renderStatsCharts() {
    new Chart(document.getElementById('dailyChart'), {
        type: 'line',
        data: {
            labels: ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัส', 'ศุกร์', 'เสาร์', 'อาทิตย์'],
            datasets: [{
                label: 'ผู้เข้าชม (คน)',
                data: [15, 22, 18, 25, 30, 45, 40],
                borderColor: '#ff758c',
                backgroundColor: 'rgba(255, 117, 140, 0.2)',
                fill: true,
                tension: 0.4
            }]
        }
    });

    new Chart(document.getElementById('jobChart'), {
        type: 'doughnut',
        data: {
            labels: ['นักเรียน/นศ.', 'ข้าราชการ', 'พนักงานบริษัท', 'ธุรกิจ/ค้าขาย', 'ฟรีแลนซ์/อื่นๆ'],
            datasets: [{
                data: [35, 15, 25, 10, 15],
                backgroundColor: ['#ff758c', '#a29bfe', '#74b9ff', '#ffeaa7', '#fab1a0']
            }]
        }
    });

    new Chart(document.getElementById('ageChart'), {
        type: 'bar',
        data: {
            labels: ['<15', '15-20', '21-30', '31-40', '41-50', '50+'],
            datasets: [{
                label: 'จำนวนคน',
                data: [5, 20, 40, 25, 15, 10],
                backgroundColor: '#fdcb6e',
                borderRadius: 5
            }]
        }
    });
}