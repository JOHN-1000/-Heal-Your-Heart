// ==========================================
// 🚨 นำลิงก์ Web App URL ตัวใหม่สุด มาวางในบรรทัดนี้ครับ 🚨
// ==========================================
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbyskl0lWrc-O_nXfpBNSjopLQLvc_A878JjIaPPPp02SH7CxhYIq6t5l3T6GBy7bCCX/exec"; 

window.onload = function() {
    checkUser();
    showDailyQuote();
    if (document.getElementById('questions-2q') || document.getElementById('questions-9q')) renderQuestions();
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
        "ความผิดพลาดคือบทเรียน ไม่ใช่ตัวตัดสินคุณค่าในตัวคุณ 🌱"
    ];
    const quoteElement = document.getElementById('daily-quote');
    if (quoteElement) quoteElement.innerText = quotes[Math.floor(Math.random() * quotes.length)];
}

function checkUser() {
    const user = localStorage.getItem('userName');
    const displayElement = document.getElementById('user-display');
    if (user && displayElement) displayElement.innerText = `สวัสดีคุณ ${user} 👋`;
}

function toggleMobileMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
}

function renderQuestions() {
    const container2Q = document.getElementById('questions-2q');
    const container9Q = document.getElementById('questions-9q');
    const containerST5 = document.getElementById('questions-st5');

    if (container2Q && typeof ASSESSMENT_DATA !== 'undefined' && ASSESSMENT_DATA.q2) {
        container2Q.innerHTML = "";
        ASSESSMENT_DATA.q2.forEach((q) => {
            container2Q.innerHTML += `
                <div class="form-group" style="border-bottom:1px solid #f0f0f0; padding-bottom:15px;">
                    <label class="form-label">${q.text}</label>
                    <div class="radio-tile-group">
                        <label class="radio-tile-label"><input type="radio" name="${q.id}" value="no"> <div class="radio-tile">ไม่มี</div></label>
                        <label class="radio-tile-label"><input type="radio" name="${q.id}" value="yes"> <div class="radio-tile">มี</div></label>
                    </div>
                </div>`;
        });
    }

    if (container9Q && typeof ASSESSMENT_DATA !== 'undefined' && ASSESSMENT_DATA.q9) {
        container9Q.innerHTML = "";
        ASSESSMENT_DATA.q9.forEach((q, i) => {
            container9Q.innerHTML += createRadioHtml(`q9_${i}`, q, [0, 1, 2, 3], ["ไม่เลย", "บางวัน", "บ่อย", "ทุกวัน"]);
        });
    }

    if (containerST5 && typeof ASSESSMENT_DATA !== 'undefined' && ASSESSMENT_DATA.st5) {
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

function goToStep2() {
    const pdpaCheckbox = document.getElementById('pdpa-consent');
    if (pdpaCheckbox && !pdpaCheckbox.checked) {
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
        alert("กรุณาตอบคำถามเบื้องต้น (2Q) ให้ครบทั้ง 2 ข้อครับ");
        return;
    }
    
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
// 4. บันทึกและส่งข้อมูลไป Google Sheets
// ==========================================
function saveData(s9, s5, age, gender, job) {
    document.body.style.cursor = "wait";
    
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newData = { score9Q: s9, scoreST5: s5, age: age, gender: gender, job: job, date: dateStr };
    
    let history = JSON.parse(localStorage.getItem('healHeartHistory')) || [];
    history.push(newData);
    localStorage.setItem('healHeartHistory', JSON.stringify(history));
    localStorage.setItem('healHeartResult', JSON.stringify(newData));

    // ✅ ลบแจ้งเตือน Alert ออกเรียบร้อย ส่งข้อมูลเข้าเงียบๆ อย่างโปร
    fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors', 
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(newData)
    })
    .then(() => {
        document.body.style.cursor = "default"; 
        window.location.href = 'result.html'; 
    })
    .catch(error => {
        console.error("ส่งข้อมูลมีปัญหา: ", error.message);
        document.body.style.cursor = "default";
        window.location.href = 'result.html'; 
    });
}

// ==========================================
// 5. แสดงผลลัพธ์หน้า result.html
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

    let emergencyBtn = (data.score9Q > 12) ? `<a href="tel:1323" class="btn-main" style="background:#d63031; margin-top:10px;">🚨 โทรสายด่วน 1323</a>` : "";

    container.innerHTML = `
        <div class="text-center" id="capture-area">
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
                <div class="text-center" data-html2canvas-ignore="true">${emergencyBtn}</div>
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

function downloadResultImage() {
    const captureArea = document.getElementById('capture-area') || document.getElementById('result-content');
    if (typeof html2canvas !== 'undefined') {
        html2canvas(captureArea, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'Heal-Your-Heart-Result.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    } else {
        alert("ขออภัยครับ ระบบจับภาพยังไม่พร้อมทำงาน (ไม่มี html2canvas)");
    }
}

function clearHistory() {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการประเมินทั้งหมด?")) {
        localStorage.removeItem('healHeartHistory');
        localStorage.removeItem('healHeartResult');
        window.location.reload();
    }
}

// ==========================================
// 6. 📊 กราฟสถิติ (แก้ปัญหา Google Sheets แปลงวันที่ + อัปเกรดหน้าตา)
// ==========================================
async function renderStatsCharts() {
    try {
        Chart.defaults.font.family = "'Sarabun', sans-serif";
        Chart.defaults.color = "#636e72";

        const response = await fetch(GOOGLE_SHEET_URL);
        const allData = await response.json(); 

        let jobCounts = { "นักเรียน/นศ.": 0, "ข้าราชการ": 0, "พนักงานบริษัท": 0, "ธุรกิจ/ค้าขาย": 0, "ฟรีแลนซ์/อื่นๆ": 0 };
        let ageGroups = { "<15": 0, "15-20": 0, "21-30": 0, "31-40": 0, "41-50": 0, "50+": 0 };
        let visitDates = {};
        
        const totalUsers = allData.length;
        let dailyUsers = 0;
        let riskUsers = 0;
        
        const today = new Date();

        allData.forEach(row => {
            if(row[0]) {
                // 🚨 ดักจับและแปลงวันที่ ที่ Google Sheets แอบเปลี่ยน
                let d, m, y;
                let dateString = String(row[0]);
                
                if (dateString.includes('T')) {
                    // กรณี Google Sheets แปลงเป็นเวลาสากล
                    let dt = new Date(dateString);
                    d = dt.getDate();
                    m = dt.getMonth() + 1;
                    y = dt.getFullYear();
                } else {
                    // กรณีเป็นข้อความปกติที่เราส่งไป
                    let parts = dateString.split(' ')[0].split('/');
                    d = parseInt(parts[0]);
                    m = parseInt(parts[1]);
                    y = parseInt(parts[2]);
                }

                // สร้างวันที่แบบสวยงามสำหรับโชว์ในกราฟ (เช่น 13/3/2026)
                const cleanDateStr = `${d}/${m}/${y}`;
                visitDates[cleanDateStr] = (visitDates[cleanDateStr] || 0) + 1;

                // ตรวจสอบว่าเป็น "วันนี้" หรือไม่
                if (d === today.getDate() && m === (today.getMonth() + 1) && y === today.getFullYear()) {
                    dailyUsers++; 
                }
            }

            const score9Q = parseInt(row[4]); 
            if(!isNaN(score9Q) && score9Q >= 13) riskUsers++;

            const age = parseInt(row[2]);
            if (!isNaN(age)) {
                if (age < 15) ageGroups["<15"]++;
                else if (age <= 20) ageGroups["15-20"]++;
                else if (age <= 30) ageGroups["21-30"]++;
                else if (age <= 40) ageGroups["31-40"]++;
                else if (age <= 50) ageGroups["41-50"]++;
                else ageGroups["50+"]++;
            }

            let job = row[3];
            if(job === "student" || job === "นักเรียน/นักศึกษา") job = "นักเรียน/นศ."; 

            if (jobCounts.hasOwnProperty(job)) jobCounts[job]++;
            else if (job) jobCounts["ฟรีแลนซ์/อื่นๆ"]++;
        });

        if (document.getElementById('total-users')) document.getElementById('total-users').innerText = totalUsers.toLocaleString();
        if (document.getElementById('daily-users')) document.getElementById('daily-users').innerText = dailyUsers.toLocaleString();
        
        const riskPercent = totalUsers > 0 ? Math.round((riskUsers / totalUsers) * 100) : 0;
        if (document.getElementById('risk-users')) document.getElementById('risk-users').innerText = riskPercent + "%";

        // 📈 1. กราฟจำนวนผู้ใช้งาน
        new Chart(document.getElementById('dailyChart'), {
            type: 'line',
            data: { 
                labels: Object.keys(visitDates), 
                datasets: [{ 
                    label: ' ผู้ใช้งาน (คน)', 
                    data: Object.values(visitDates), 
                    borderColor: '#ff758c', 
                    backgroundColor: 'rgba(255, 117, 140, 0.15)', 
                    fill: true, 
                    tension: 0.4,
                    pointBackgroundColor: '#ff758c',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }] 
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { borderDash: [5, 5] } },
                    x: { grid: { display: false } }
                }
            }
        });

        // 🍩 2. กราฟวงกลมอาชีพ
        new Chart(document.getElementById('jobChart'), {
            type: 'doughnut',
            data: { 
                labels: Object.keys(jobCounts), 
                datasets: [{ 
                    data: Object.values(jobCounts), 
                    backgroundColor: ['#ff758c', '#a29bfe', '#74b9ff', '#ffeaa7', '#fab1a0'],
                    borderWidth: 2,
                    hoverOffset: 5
                }] 
            },
            options: {
                responsive: true,
                cutout: '70%', 
                plugins: { 
                    legend: { position: 'bottom', labels: { padding: 20, usePointStyle: true } } 
                }
            }
        });

        // 📊 3. กราฟอายุ
        new Chart(document.getElementById('ageChart'), {
            type: 'bar',
            data: { 
                labels: Object.keys(ageGroups), 
                datasets: [{ 
                    label: ' จำนวนคน', 
                    data: Object.values(ageGroups), 
                    backgroundColor: '#fdcb6e', 
                    borderRadius: 8, 
                    barPercentage: 0.6
                }] 
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { borderDash: [5, 5] } },
                    x: { grid: { display: false } }
                }
            }
        });

    } catch (error) {
        console.error("เกิดข้อผิดพลาดในการโหลดสถิติจริง:", error);
    }
}
// ==========================================
// 7. 📰 ระบบอัปเดตบทความฮีลใจประจำวันอัตโนมัติ
// ==========================================
function loadDailyArticle() {
    const container = document.getElementById('daily-article-container');
    if (!container) return; // ถ้าไม่ใช่หน้าแรก ให้ข้ามไป

    // คลังบทความ (สามารถมาเพิ่มทีหลังได้เรื่อยๆ)
    const articles = [
        {
            title: "5 วิธีรับมือกับความเครียดจากการทำงาน (Burnout)",
            excerpt: "ความเครียดเป็นเรื่องธรรมชาติ แต่เราสามารถจัดการได้ด้วยการพักเบรกสั้นๆ การจัดลำดับความสำคัญ และการฝึกหายใจ...",
            image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80"
        },
        {
            title: "ทำไมการนอนหลับถึงสำคัญต่อสุขภาพจิต?",
            excerpt: "การอดนอนไม่เพียงส่งผลต่อร่างกาย แต่ยังทำให้อารมณ์แปรปรวนและเสี่ยงต่อภาวะซึมเศร้า มาดูวิธีปรับพฤติกรรมการนอนกัน...",
            image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=800&q=80"
        },
        {
            title: "Digital Detox: พักหน้าจอ เพื่อพักใจ",
            excerpt: "ในยุคที่ข้อมูลท่วมท้น การลองปิดมือถือและโซเชียลมีเดียสักวันหยุดสุดสัปดาห์ จะช่วยลดความวิตกกังวลได้อย่างน่าเหลือเชื่อ...",
            image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80"
        },
        {
            title: "พลังแห่งการเขียนบันทึก (Journaling)",
            excerpt: "การเขียนระบายความรู้สึกระบายลงในกระดาษ เป็นหนึ่งในวิธีบำบัดจิตใจที่แพทย์แนะนำ เพราะช่วยให้เราจัดระเบียบความคิดได้ดีขึ้น...",
            image: "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=800&q=80"
        }
    ];

    // คำนวณหาวันที่ในรอบปี เพื่อเลือกบทความสลับกันไปทุกวัน
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const article = articles[dayOfYear % articles.length];

    // วาดกล่องบทความพร้อมรูปภาพระดับพรีเมียม
    container.innerHTML = `
        <div style="flex: 1; min-width: 300px;">
            <img src="${article.image}" alt="Article Image" style="width: 100%; height: 100%; object-fit: cover; min-height: 280px;">
        </div>
        <div style="flex: 1.2; min-width: 300px; padding: 40px; display: flex; flex-direction: column; justify-content: center;">
            <span style="display: inline-block; padding: 6px 15px; background: #ffe0e6; color: #ff758c; border-radius: 20px; font-size: 0.85rem; font-weight: bold; margin-bottom: 15px; width: fit-content;">✨ บทความแนะนำวันนี้</span>
            <h3 style="color: #2d3436; margin-bottom: 15px; font-size: 1.5rem; line-height: 1.4;">${article.title}</h3>
            <p style="color: #636e72; line-height: 1.6; margin-bottom: 25px;">${article.excerpt}</p>
            <button class="btn-main" style="padding: 10px 25px; border-radius: 25px; font-size: 1rem; width: fit-content; border: none; cursor: pointer;" onclick="alert('ระบบอ่านบทความฉบับเต็ม กำลังอยู่ในช่วงพัฒนาครับ 💖')">อ่านเพิ่มเติม ➔</button>
        </div>
    `;
}
