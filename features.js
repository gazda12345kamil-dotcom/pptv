// ===== AURA DETECTOR MODE =====
const auraColors = [
    { name: 'Czerwona', color: '#ff0000', meaning: 'Pasja, siła, gniew lub strach. Silna energia życiowa.' },
    { name: 'Pomarańczowa', color: '#ff8c00', meaning: 'Kreatywność, emocje, radość. Otwartość na nowe doświadczenia.' },
    { name: 'Żółta', color: '#ffd700', meaning: 'Optymizm, intelekt, szczęście. Jasność umysłu.' },
    { name: 'Zielona', color: '#00ff00', meaning: 'Harmonia, uzdrowienie, natura. Równowaga i spokój.' },
    { name: 'Niebieska', color: '#00bfff', meaning: 'Spokój, prawda, intuicja. Duchowe połączenie.' },
    { name: 'Indygo', color: '#4b0082', meaning: 'Wizja, mądrość, zdolności psychiczne. Głęboka intuicja.' },
    { name: 'Fioletowa', color: '#9400d3', meaning: 'Duchowość, transformacja, magia. Wysoka świadomość.' },
    { name: 'Biała', color: '#ffffff', meaning: 'Czystość, oświecenie, ochrona. Bardzo rzadka i potężna.' },
    { name: 'Złota', color: '#ffd700', meaning: 'Mądrość duchowa, ochrona boska. Wysoka energia.' }
];

let auraAnimationId = null;

function initializeAura() {
    const canvas = document.getElementById('auraCanvas');
    if (!canvas) return;

    canvas.width = canvas.offsetWidth || 350;
    canvas.height = canvas.offsetHeight || 350;

    document.getElementById('auraScan')?.addEventListener('click', scanAura);

    drawAuraIdle(canvas);
}

function drawAuraIdle(canvas) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw pulsing aura background
        const time = Date.now() * 0.002;
        const pulseSize = 100 + Math.sin(time) * 20;

        const gradient = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, pulseSize);
        gradient.addColorStop(0, 'rgba(138, 43, 226, 0.3)');
        gradient.addColorStop(0.5, 'rgba(75, 0, 130, 0.2)');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        ctx.fill();

        // Draw silhouette
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 20, 35, 60, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY - 50, 25, 0, Math.PI * 2);
        ctx.fill();

        auraAnimationId = requestAnimationFrame(animate);
    }

    animate();
}

async function scanAura() {
    const btn = document.getElementById('auraScan');
    const meaningEl = document.getElementById('auraMeaning');

    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span><span>Skanowanie...</span>';
    meaningEl.innerHTML = '<p>Analizuję pole energetyczne...</p>';

    // Simulate scanning with sensor data
    let sensorSum = 0;
    const readings = [];

    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 100));
        const magnitude = Math.sqrt(motionData.x ** 2 + motionData.y ** 2 + motionData.z ** 2);
        sensorSum += magnitude;
        readings.push(magnitude);
    }

    // Calculate aura based on sensor data
    const avgReading = sensorSum / 30;
    const variance = readings.reduce((sum, val) => sum + Math.abs(val - avgReading), 0) / readings.length;

    // Select aura color based on sensor data + randomness
    const auraIndex = Math.floor((avgReading * 1000 + variance * 100 + Date.now()) % auraColors.length);
    const selectedAura = auraColors[auraIndex];

    // Calculate strength
    const strength = Math.min(100, Math.max(20, avgReading * 50 + variance * 100 + Math.random() * 30));

    // Update UI
    document.getElementById('auraSwatch').style.background = selectedAura.color;
    document.getElementById('auraSwatch').style.boxShadow = `0 0 30px ${selectedAura.color}`;
    document.getElementById('auraName').textContent = selectedAura.name;
    document.getElementById('auraStrength').style.width = strength + '%';
    document.getElementById('auraValue').textContent = Math.round(strength) + '%';
    meaningEl.innerHTML = `<p><strong>${selectedAura.name} Aura:</strong> ${selectedAura.meaning}</p>`;

    // Animate the detected aura
    animateDetectedAura(selectedAura.color);

    btn.disabled = false;
    btn.innerHTML = '<span>🔮</span><span>Skanuj Aurę</span>';

    // Trigger vibration
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
}

function animateDetectedAura(color) {
    const canvas = document.getElementById('auraCanvas');
    if (!canvas) return;

    cancelAnimationFrame(auraAnimationId);

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const time = Date.now() * 0.003;

        // Multiple aura layers
        for (let layer = 3; layer >= 0; layer--) {
            const size = 80 + layer * 30 + Math.sin(time + layer) * 15;
            const alpha = 0.3 - layer * 0.05;

            const gradient = ctx.createRadialGradient(centerX, centerY, 30, centerX, centerY, size);
            gradient.addColorStop(0, color.replace(')', `, ${alpha})`).replace('rgb', 'rgba'));
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw silhouette
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + 20, 35, 60, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX, centerY - 50, 25, 0, Math.PI * 2);
        ctx.fill();

        auraAnimationId = requestAnimationFrame(animate);
    }

    animate();
}

// ===== PENDULUM MODE =====
let pendulumAngle = 0;
let pendulumVelocity = 0;
let pendulumActive = false;
let pendulumAnimation = null;

function initializePendulum() {
    document.getElementById('askSpirit')?.addEventListener('click', askPendulum);
    setupVoiceInput();
    animatePendulum();
}

function setupVoiceInput() {
    const voiceBtn = document.getElementById('voiceInput');
    const voiceStatus = document.getElementById('voiceStatus');
    const questionInput = document.getElementById('pendulumQuestion');

    if (!voiceBtn || !questionInput) return;

    // Check browser support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        voiceBtn.style.display = 'none';
        console.log('Speech recognition not supported in this browser');
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pl-PL';
    recognition.continuous = false;
    recognition.interimResults = false;

    voiceBtn.addEventListener('click', () => {
        try {
            recognition.start();
        } catch (e) {
            console.log('Recognition restart', e);
            try { recognition.stop(); } catch (e2) { }
        }
    });

    recognition.onstart = () => {
        if (voiceStatus) voiceStatus.style.display = 'flex';
        voiceBtn.classList.add('pulse-animation');
    };

    recognition.onend = () => {
        if (voiceStatus) voiceStatus.style.display = 'none';
        voiceBtn.classList.remove('pulse-animation');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        questionInput.value = transcript;
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        if (voiceStatus) voiceStatus.style.display = 'none';
        voiceBtn.classList.remove('pulse-animation');

        if (event.error === 'not-allowed') {
            alert('Aplikacja potrzebuje dostępu do mikrofonu, aby ta funkcja działała.');
        }
    };
}

function animatePendulum() {
    const bob = document.getElementById('pendulumBob');
    const string = document.getElementById('pendulumString');
    if (!bob || !string) {
        setTimeout(animatePendulum, 100);
        return;
    }

    function animate() {
        // Apply physics
        const gravity = 0.002;
        const damping = 0.995;

        if (!pendulumActive) {
            // Small idle motion based on sensor
            const sensorInfluence = (motionData.x || 0) * 0.01;
            pendulumVelocity += sensorInfluence;
        }

        pendulumVelocity -= Math.sin(pendulumAngle) * gravity;
        pendulumVelocity *= damping;
        pendulumAngle += pendulumVelocity;

        // Apply visual
        const degrees = pendulumAngle * (180 / Math.PI);
        bob.style.transform = `translateX(-50%) rotate(${degrees}deg)`;
        string.style.transform = `translateX(-50%) rotate(${degrees}deg)`;

        pendulumAnimation = requestAnimationFrame(animate);
    }

    animate();
}

async function askPendulum() {
    const question = document.getElementById('pendulumQuestion').value.trim();
    if (!question) {
        alert('Proszę wpisać pytanie!');
        return;
    }

    const answerEl = document.getElementById('pendulumAnswer');
    const btn = document.getElementById('askSpirit');

    btn.disabled = true;
    pendulumActive = true;
    answerEl.innerHTML = '<p>Duchy się naradzają...</p>';

    // Build up swing
    const isYes = Math.random() > 0.5;
    const targetAngle = isYes ? 0.5 : -0.5;

    // Animate swing build-up
    for (let i = 0; i < 50; i++) {
        pendulumVelocity += (targetAngle - pendulumAngle) * 0.02;
        await new Promise(r => setTimeout(r, 60));
    }

    // Show answer
    const answer = isYes ? 'TAK ✓' : 'NIE ✗';
    answerEl.innerHTML = `<p class="${isYes ? 'answer-yes' : 'answer-no'}"><strong>${answer}</strong></p>`;

    // Add to log
    addQuestionToLog(question, answer);

    // Vibrate
    if (navigator.vibrate) navigator.vibrate(isYes ? [200, 100, 200] : [100, 100, 100, 100, 100]);

    // Reset
    setTimeout(() => {
        pendulumActive = false;
        btn.disabled = false;
        document.getElementById('pendulumQuestion').value = '';
    }, 1000);
}

function addQuestionToLog(question, answer) {
    const log = document.getElementById('questionLog');
    if (!log) return;

    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const time = new Date().toLocaleTimeString('pl-PL');
    entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-q">${question}</span> → <strong>${answer}</strong>`;

    log.insertBefore(entry, log.firstChild);

    while (log.children.length > 10) {
        log.lastChild.remove();
    }
}

// ===== ORB DETECTOR MODE =====
let orbsStream = null;
let orbsCount = 0;
let orbsSensitivity = 5;
let capturedOrbs = [];

function initializeOrbs() {
    document.getElementById('orbsStart')?.addEventListener('click', startOrbsCamera);
    document.getElementById('orbsCapture')?.addEventListener('click', captureOrb);
    document.getElementById('orbsSensitivity')?.addEventListener('input', (e) => {
        orbsSensitivity = parseInt(e.target.value);
    });
}

async function startOrbsCamera() {
    try {
        orbsStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        const video = document.getElementById('orbsVideo');
        video.srcObject = orbsStream;

        const canvas = document.getElementById('orbsCanvas');
        setTimeout(() => {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
        }, 500);

        document.getElementById('orbsStart').disabled = true;
        document.getElementById('orbsCapture').disabled = false;

        detectOrbs();

    } catch (err) {
        console.error('Camera error:', err);
        alert('Nie udało się uruchomić kamery. Sprawdź uprawnienia.');
    }
}

function detectOrbs() {
    const video = document.getElementById('orbsVideo');
    const canvas = document.getElementById('orbsCanvas');
    if (!canvas || !video || !orbsStream) return;

    const ctx = canvas.getContext('2d');
    let previousFrame = null;

    function detect() {
        if (!orbsStream) return;

        if (canvas.width === 0) {
            requestAnimationFrame(detect);
            return;
        }

        // Draw current frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Find bright spots (potential orbs)
        const threshold = 255 - orbsSensitivity * 15;
        const orbs = [];

        for (let y = 0; y < canvas.height; y += 10) {
            for (let x = 0; x < canvas.width; x += 10) {
                const i = (y * canvas.width + x) * 4;
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;

                if (brightness > threshold) {
                    orbs.push({ x, y, brightness });
                }
            }
        }

        // Draw detected orbs
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        orbs.forEach(orb => {
            const size = 15 + (orb.brightness / 255) * 20;

            // Glow effect
            const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, size);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(0.3, 'rgba(255, 255, 200, 0.6)');
            gradient.addColorStop(1, 'transparent');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, size, 0, Math.PI * 2);
            ctx.fill();

            // Sparkle
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath();
            ctx.moveTo(orb.x - size / 2, orb.y);
            ctx.lineTo(orb.x + size / 2, orb.y);
            ctx.moveTo(orb.x, orb.y - size / 2);
            ctx.lineTo(orb.x, orb.y + size / 2);
            ctx.stroke();
        });

        // Update count
        const currentOrbsCount = orbs.length;
        document.getElementById('orbsCount').textContent = currentOrbsCount;

        if (currentOrbsCount > 0) {
            orbsCount += currentOrbsCount;
            document.getElementById('totalOrbs').textContent = orbsCount;

            // Update intensity
            let intensity = 'Niska';
            if (currentOrbsCount > 5) intensity = 'Średnia';
            if (currentOrbsCount > 15) intensity = 'Wysoka';
            if (currentOrbsCount > 30) intensity = 'EKSTREMALNA!';
            document.getElementById('orbIntensity').textContent = intensity;

            // Vibrate on high detection
            if (currentOrbsCount > 10 && navigator.vibrate) {
                navigator.vibrate(50);
            }
        }

        requestAnimationFrame(detect);
    }

    detect();
}

function captureOrb() {
    const video = document.getElementById('orbsVideo');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Draw overlay
    const overlayCanvas = document.getElementById('orbsCanvas');
    ctx.drawImage(overlayCanvas, 0, 0);

    const dataUrl = canvas.toDataURL('image/png');
    capturedOrbs.push(dataUrl);

    // Add to gallery
    const gallery = document.getElementById('galleryGrid');
    const img = document.createElement('img');
    img.src = dataUrl;
    img.className = 'gallery-item';
    img.onclick = () => {
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `orb_${Date.now()}.png`;
        link.click();
    };

    gallery.insertBefore(img, gallery.firstChild);

    // Limit gallery
    while (gallery.children.length > 6) {
        gallery.lastChild.remove();
    }

    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}

// ===== VIBRATION & EXPORT =====
let vibrationEnabled = false;

function initializeVibration() {
    const toggleBtn = document.getElementById('toggleVibration');
    toggleBtn?.addEventListener('click', () => {
        vibrationEnabled = !vibrationEnabled;
        toggleBtn.classList.toggle('active');
        const status = document.getElementById('vibrationStatus');
        if (status) status.textContent = vibrationEnabled ? 'ON' : 'OFF';
    });
}

function initializeExport() {
    document.getElementById('exportSession')?.addEventListener('click', exportSessionData);
}

function initializeRecalibration() {
    document.getElementById('recalibrate')?.addEventListener('click', async () => {
        // Reset filters before recalibration
        emfFilter.reset();
        motionFilters.x.reset();
        motionFilters.y.reset();
        motionFilters.z.reset();

        // Perform recalibration
        await performCalibration();

        // Vibrate to confirm
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    });
}

function exportSessionData() {
    const sessionData = {
        timestamp: new Date().toISOString(),
        duration: Math.floor((Date.now() - app.sessionStartTime) / 1000),
        anomalies: app.anomalyCount,
        emfHistory: emfHistory,
        orbsDetected: orbsCount,
        capturedOrbsCount: capturedOrbs.length,
        calibration: {
            emfBaseline: calibration.emf.baseline,
            emfStdDev: calibration.emf.standardDeviation,
            normalThreshold: calibration.emf.normalThreshold,
            elevatedThreshold: calibration.emf.elevatedThreshold,
            anomalyThreshold: calibration.emf.anomalyThreshold,
            motionGravity: calibration.motion.gravityMagnitude
        }
    };

    const jsonStr = JSON.stringify(sessionData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `paranormal_session_${Date.now()}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

// ===== UPDATE MODE SWITCHING =====
const originalSwitchMode = switchMode;
switchMode = function (mode) {
    app.currentMode = mode;

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    document.querySelectorAll('.detector-mode').forEach(section => {
        section.classList.remove('active');
    });

    const modeMap = {
        'emf': 'emfMode',
        'motion': 'motionMode',
        'evp': 'evpMode',
        'spirit': 'spiritMode',
        'aura': 'auraMode',
        'pendulum': 'pendulumMode',
        'orbs': 'orbsMode',
        'overview': 'overviewMode'
    };

    const targetMode = modeMap[mode];
    if (targetMode) {
        document.getElementById(targetMode)?.classList.add('active');
    }

    // Initialize mode-specific features
    if (mode === 'aura') initializeAura();
    if (mode === 'pendulum') initializePendulum();
    if (mode === 'orbs') initializeOrbs();
};

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    initializeVibration();
    initializeExport();
    initializeRecalibration();
});
