// ===== STATE MANAGEMENT =====
const app = {
    currentMode: 'emf',
    isActive: false,
    sessionStartTime: null,
    anomalyCount: 0,
    sensors: {
        magnetometer: null,
        accelerometer: null,
        gyroscope: null,
        microphone: null
    },
    audio: {
        context: null,
        analyser: null,
        microphone: null,
        mediaRecorder: null,
        recordedChunks: []
    },
    spiritBox: {
        active: false,
        interval: null,
        words: [
            'TAK', 'NIE', 'TUTAJ', 'ODEJDŹ', 'POMOC', 'ZIMNO', 'CIEMNO',
            'ŚWIATŁO', 'STRACH', 'BLISKO', 'DALEKO', 'SŁYSZĘ', 'WIDZĘ',
            'UCIEKAJ', 'ZOSTAŃ', 'PRZYJDŹ', 'ŚMIERĆ', 'ŻYCIE', 'DUSZA',
            'DUCHY', 'PRZEJŚCIE', 'PORTAL', 'ENERGIA', 'OBECNOŚĆ'
        ]
    }
};

// ===== CALIBRATION SYSTEM =====
const calibration = {
    isCalibrated: false,
    isCalibrating: false,
    progress: 0,

    // EMF baseline and thresholds
    emf: {
        baseline: 0,
        samples: [],
        sampleCount: 60,  // 1 second at 60Hz
        standardDeviation: 0,
        // Thresholds are calculated after calibration
        normalThreshold: 0,
        elevatedThreshold: 0,
        anomalyThreshold: 0
    },

    // Motion baseline
    motion: {
        baseline: { x: 0, y: 0, z: 0 },
        samples: [],
        sampleCount: 60,
        gravityMagnitude: 9.8,  // Expected gravity
        threshold: 3  // m/s² above gravity for anomaly
    },

    // Filtering settings
    filter: {
        emfSmoothing: 0.3,      // Lower = smoother (0-1)
        motionSmoothing: 0.4,   // Low-pass filter coefficient
        minReadingInterval: 50,  // ms between display updates
        outlierThreshold: 3      // Standard deviations for outlier rejection
    }
};

// Filtered/smoothed values
let filteredEMF = 0;
let filteredMotion = { x: 0, y: 0, z: 0 };
let lastDisplayUpdate = 0;

// ===== SMOOTHING FILTER CLASS =====
class ExponentialSmoothingFilter {
    constructor(alpha = 0.3) {
        this.alpha = alpha;
        this.value = null;
    }

    filter(newValue) {
        if (this.value === null) {
            this.value = newValue;
        } else {
            this.value = this.alpha * newValue + (1 - this.alpha) * this.value;
        }
        return this.value;
    }

    reset() {
        this.value = null;
    }
}

// Create filters for each axis
const emfFilter = new ExponentialSmoothingFilter(calibration.filter.emfSmoothing);
const motionFilters = {
    x: new ExponentialSmoothingFilter(calibration.filter.motionSmoothing),
    y: new ExponentialSmoothingFilter(calibration.filter.motionSmoothing),
    z: new ExponentialSmoothingFilter(calibration.filter.motionSmoothing)
};

// ===== CALIBRATION FUNCTIONS =====
function showCalibrationOverlay() {
    // Create overlay if it doesn't exist
    let overlay = document.getElementById('calibrationOverlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'calibrationOverlay';
        overlay.className = 'calibration-overlay';
        overlay.innerHTML = `
            <div class="calibration-content">
                <div class="calibration-icon">📡</div>
                <div class="calibration-message">Kalibracja czujników...</div>
                <div class="calibration-progress">
                    <div class="calibration-progress-fill" id="calibrationProgressFill"></div>
                </div>
                <div class="calibration-hint">Trzymaj urządzenie nieruchomo</div>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

function hideCalibrationOverlay() {
    const overlay = document.getElementById('calibrationOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function updateCalibrationProgress(progress) {
    const fill = document.getElementById('calibrationProgressFill');
    if (fill) {
        fill.style.width = `${progress}%`;
    }
}

function calculateStandardDeviation(samples) {
    if (samples.length === 0) return 0;
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const squaredDiffs = samples.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / samples.length;
    return Math.sqrt(variance);
}

async function performCalibration() {
    if (calibration.isCalibrating) return;

    calibration.isCalibrating = true;
    calibration.progress = 0;
    calibration.emf.samples = [];
    calibration.motion.samples = [];

    showCalibrationOverlay();

    // Collect samples for calibration
    return new Promise((resolve) => {
        const calibrationInterval = setInterval(() => {
            calibration.progress++;
            updateCalibrationProgress((calibration.progress / calibration.emf.sampleCount) * 100);

            if (calibration.progress >= calibration.emf.sampleCount) {
                clearInterval(calibrationInterval);

                // Calculate EMF baseline
                if (calibration.emf.samples.length > 0) {
                    calibration.emf.baseline = calibration.emf.samples.reduce((a, b) => a + b, 0) / calibration.emf.samples.length;
                    calibration.emf.standardDeviation = calculateStandardDeviation(calibration.emf.samples);

                    // Set thresholds based on baseline and standard deviation
                    // Use 3-sigma rule: 99.7% of normal readings should be within 3 standard deviations
                    calibration.emf.normalThreshold = calibration.emf.baseline + Math.max(calibration.emf.standardDeviation * 3, 15);
                    calibration.emf.elevatedThreshold = calibration.emf.baseline + Math.max(calibration.emf.standardDeviation * 5, 35);
                    calibration.emf.anomalyThreshold = calibration.emf.baseline + Math.max(calibration.emf.standardDeviation * 7, 60);

                    console.log('EMF Calibration complete:', {
                        baseline: calibration.emf.baseline.toFixed(2),
                        stdDev: calibration.emf.standardDeviation.toFixed(2),
                        normalThreshold: calibration.emf.normalThreshold.toFixed(2),
                        elevatedThreshold: calibration.emf.elevatedThreshold.toFixed(2),
                        anomalyThreshold: calibration.emf.anomalyThreshold.toFixed(2)
                    });
                } else {
                    // Fallback thresholds if no magnetometer
                    calibration.emf.normalThreshold = 25;
                    calibration.emf.elevatedThreshold = 50;
                    calibration.emf.anomalyThreshold = 75;
                }

                // Calculate motion baseline (should be around gravity magnitude)
                if (calibration.motion.samples.length > 0) {
                    let avgX = 0, avgY = 0, avgZ = 0;
                    calibration.motion.samples.forEach(s => {
                        avgX += s.x;
                        avgY += s.y;
                        avgZ += s.z;
                    });
                    calibration.motion.baseline = {
                        x: avgX / calibration.motion.samples.length,
                        y: avgY / calibration.motion.samples.length,
                        z: avgZ / calibration.motion.samples.length
                    };
                    // Calculate expected gravity magnitude for this orientation
                    calibration.motion.gravityMagnitude = Math.sqrt(
                        calibration.motion.baseline.x ** 2 +
                        calibration.motion.baseline.y ** 2 +
                        calibration.motion.baseline.z ** 2
                    );
                    console.log('Motion Calibration complete:', calibration.motion);
                }

                calibration.isCalibrated = true;
                calibration.isCalibrating = false;
                hideCalibrationOverlay();

                // Update status to show calibrated
                updateStatus('Skalibrowane', 'success');

                resolve();
            }
        }, 1000 / 60); // 60 samples per second
    });
}

// Check if reading is an outlier
function isOutlier(value, baseline, stdDev) {
    if (stdDev === 0) return false;
    return Math.abs(value - baseline) > calibration.filter.outlierThreshold * stdDev;
}

// EMF Data
let emfHistory = [];
const maxHistoryPoints = 100;
let emfParticles = [];

// Motion Data
let motionData = { x: 0, y: 0, z: 0 };
let motionTrailPoints = [];

// Raw value storage for calibration
let rawEMFValue = 0;
let rawMotionData = { x: 0, y: 0, z: 0 };

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeUI();
});

function initializeUI() {
    // Permission button
    document.getElementById('requestPermissions').addEventListener('click', requestSensorPermissions);

    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // EVP controls
    document.getElementById('evpRecord').addEventListener('click', startEVPRecording);
    document.getElementById('evpStop').addEventListener('click', stopEVPRecording);
    document.getElementById('evpPlay').addEventListener('click', playEVPRecording);

    // Spirit Box controls
    document.getElementById('spiritStart').addEventListener('click', startSpiritBox);
    document.getElementById('spiritStop').addEventListener('click', stopSpiritBox);

    // Initialize canvases
    initializeCanvases();
}

function initializeCanvases() {
    // EMF Particles Canvas
    const emfCanvas = document.getElementById('emfParticles');
    if (emfCanvas) {
        emfCanvas.width = emfCanvas.offsetWidth;
        emfCanvas.height = emfCanvas.offsetHeight;
    }

    // EMF History Canvas
    const historyCanvas = document.getElementById('emfHistory');
    if (historyCanvas) {
        historyCanvas.width = historyCanvas.offsetWidth;
        historyCanvas.height = historyCanvas.offsetHeight;
    }

    // Motion Trail Canvas
    const motionCanvas = document.getElementById('motionTrail');
    if (motionCanvas) {
        motionCanvas.width = motionCanvas.offsetWidth;
        motionCanvas.height = motionCanvas.offsetHeight;
    }

    // EVP Canvases
    const waveformCanvas = document.getElementById('evpWaveform');
    if (waveformCanvas) {
        waveformCanvas.width = waveformCanvas.offsetWidth;
        waveformCanvas.height = waveformCanvas.offsetHeight;
    }

    const spectrumCanvas = document.getElementById('evpSpectrum');
    if (spectrumCanvas) {
        spectrumCanvas.width = spectrumCanvas.offsetWidth;
        spectrumCanvas.height = spectrumCanvas.offsetHeight;
    }
}

// ===== SENSOR PERMISSIONS =====
async function requestSensorPermissions() {
    try {
        updateStatus('Uzyskiwanie uprawnień...', 'warning');

        // Request microphone permission
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); // Stop immediately, we'll use it later
            console.log('Microphone permission granted');
        } catch (err) {
            console.warn('Microphone permission denied:', err);
        }

        // Initialize sensors
        await initializeSensors();

        // Hide permission screen, show app
        document.getElementById('permissionScreen').style.display = 'none';
        document.getElementById('modeSelector').style.display = 'flex';

        // Perform calibration before starting detection
        updateStatus('Kalibracja...', 'warning');
        await performCalibration();

        // Start the app
        startDetection();

        updateStatus('Aktywny', 'success');

    } catch (error) {
        console.error('Permission error:', error);
        updateStatus('Brak uprawnień', 'danger');
        alert('Nie udało się uzyskać dostępu do czujników. Aplikacja może nie działać poprawnie.');
    }
}

async function initializeSensors() {
    // Try to initialize magnetometer (for EMF)
    if ('Magnetometer' in window) {
        try {
            app.sensors.magnetometer = new Magnetometer({ frequency: 60 });
            app.sensors.magnetometer.addEventListener('reading', handleMagnetometerReading);
            app.sensors.magnetometer.start();
            console.log('Magnetometer initialized');
        } catch (err) {
            console.warn('Magnetometer not available:', err);
        }
    }

    // Try to initialize accelerometer
    if ('Accelerometer' in window) {
        try {
            app.sensors.accelerometer = new Accelerometer({ frequency: 60 });
            app.sensors.accelerometer.addEventListener('reading', handleAccelerometerReading);
            app.sensors.accelerometer.start();
            console.log('Accelerometer initialized');
        } catch (err) {
            console.warn('Accelerometer not available:', err);
        }
    }

    // Fallback to DeviceMotion API
    if (!app.sensors.accelerometer && !app.sensors.magnetometer) {
        console.log('Using DeviceMotion API fallback');
        window.addEventListener('devicemotion', handleDeviceMotion);
        window.addEventListener('deviceorientation', handleDeviceOrientation);
    }

    // Request permission for iOS 13+
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceMotionEvent.requestPermission();
            if (permission === 'granted') {
                window.addEventListener('devicemotion', handleDeviceMotion);
                window.addEventListener('deviceorientation', handleDeviceOrientation);
            }
        } catch (err) {
            console.error('Device motion permission error:', err);
        }
    }
}

// ===== SENSOR HANDLERS =====
function handleMagnetometerReading() {
    const mag = app.sensors.magnetometer;
    if (!mag) return;

    // Calculate raw magnetic field strength
    const rawStrength = Math.sqrt(mag.x ** 2 + mag.y ** 2 + mag.z ** 2);
    rawEMFValue = rawStrength;

    // Collect samples during calibration
    if (calibration.isCalibrating) {
        calibration.emf.samples.push(rawStrength);
        return; // Don't update display during calibration
    }

    // Apply smoothing filter
    filteredEMF = emfFilter.filter(rawStrength);

    // Rate-limit display updates
    const now = Date.now();
    if (now - lastDisplayUpdate < calibration.filter.minReadingInterval) {
        return;
    }
    lastDisplayUpdate = now;

    updateEMFDisplay(filteredEMF);
}

function handleAccelerometerReading() {
    const acc = app.sensors.accelerometer;
    if (!acc) return;

    rawMotionData = {
        x: acc.x || 0,
        y: acc.y || 0,
        z: acc.z || 0
    };

    // Collect samples during calibration
    if (calibration.isCalibrating) {
        calibration.motion.samples.push({ ...rawMotionData });
        return;
    }

    // Apply smoothing filters
    motionData = {
        x: motionFilters.x.filter(rawMotionData.x),
        y: motionFilters.y.filter(rawMotionData.y),
        z: motionFilters.z.filter(rawMotionData.z)
    };

    updateMotionDisplay();
}

function handleDeviceMotion(event) {
    if (event.accelerationIncludingGravity) {
        rawMotionData = {
            x: event.accelerationIncludingGravity.x || 0,
            y: event.accelerationIncludingGravity.y || 0,
            z: event.accelerationIncludingGravity.z || 0
        };

        // Collect samples during calibration
        if (calibration.isCalibrating) {
            calibration.motion.samples.push({ ...rawMotionData });
            return;
        }

        // Apply smoothing filters
        motionData = {
            x: motionFilters.x.filter(rawMotionData.x),
            y: motionFilters.y.filter(rawMotionData.y),
            z: motionFilters.z.filter(rawMotionData.z)
        };
        updateMotionDisplay();
    }

    // Simulate EMF from device motion (fallback) - NO RANDOM NOISE
    if (!app.sensors.magnetometer && event.accelerationIncludingGravity) {
        // Calculate a stable value based on deviation from calibrated gravity
        const magnitude = Math.sqrt(
            (event.accelerationIncludingGravity.x || 0) ** 2 +
            (event.accelerationIncludingGravity.y || 0) ** 2 +
            (event.accelerationIncludingGravity.z || 0) ** 2
        );

        // Deviation from expected gravity as pseudo-EMF
        const deviation = Math.abs(magnitude - calibration.motion.gravityMagnitude);
        const pseudoEMF = deviation * 8; // Scale factor

        rawEMFValue = pseudoEMF;

        if (calibration.isCalibrating) {
            calibration.emf.samples.push(pseudoEMF);
            return;
        }

        filteredEMF = emfFilter.filter(pseudoEMF);

        const now = Date.now();
        if (now - lastDisplayUpdate >= calibration.filter.minReadingInterval) {
            lastDisplayUpdate = now;
            updateEMFDisplay(filteredEMF);
        }
    }
}

function handleDeviceOrientation(event) {
    // Can use orientation data for additional effects
    // console.log('Orientation:', event.alpha, event.beta, event.gamma);
}

// ===== MODE SWITCHING =====
function switchMode(mode) {
    app.currentMode = mode;

    // Update active button
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Update active mode display
    document.querySelectorAll('.detector-mode').forEach(section => {
        section.classList.remove('active');
    });

    const modeMap = {
        'emf': 'emfMode',
        'motion': 'motionMode',
        'evp': 'evpMode',
        'spirit': 'spiritMode',
        'overview': 'overviewMode'
    };

    document.getElementById(modeMap[mode]).classList.add('active');
}

// ===== EMF DETECTOR =====
function updateEMFDisplay(value) {
    // NO artificial randomness - use the actual filtered value
    const displayValue = Math.max(0, value);

    // Update display
    document.getElementById('emfValue').textContent = displayValue.toFixed(1);

    // Update meter (scale relative to anomaly threshold for better visualization)
    const maxMeter = Math.max(100, calibration.emf.anomalyThreshold * 1.5);
    const percentage = Math.min(100, (displayValue / maxMeter) * 100);
    document.getElementById('emfMeterFill').style.width = percentage + '%';

    // Update status using CALIBRATED thresholds
    const statusEl = document.getElementById('emfStatus');

    // Use calibrated thresholds if available, otherwise use defaults
    const normalThreshold = calibration.isCalibrated ? calibration.emf.normalThreshold : 25;
    const elevatedThreshold = calibration.isCalibrated ? calibration.emf.elevatedThreshold : 50;
    const anomalyThreshold = calibration.isCalibrated ? calibration.emf.anomalyThreshold : 75;

    if (displayValue < normalThreshold) {
        statusEl.textContent = 'Normalne';
        statusEl.style.background = 'rgba(16, 185, 129, 0.2)';
        statusEl.style.color = '#10b981';
        statusEl.style.borderColor = '#10b981';
    } else if (displayValue < elevatedThreshold) {
        statusEl.textContent = 'Podwyższone';
        statusEl.style.background = 'rgba(251, 191, 36, 0.2)';
        statusEl.style.color = '#fbbf24';
        statusEl.style.borderColor = '#fbbf24';
    } else if (displayValue < anomalyThreshold) {
        statusEl.textContent = '⚡ Wysokie';
        statusEl.style.background = 'rgba(249, 115, 22, 0.2)';
        statusEl.style.color = '#f97316';
        statusEl.style.borderColor = '#f97316';
    } else {
        statusEl.textContent = '⚠️ ANOMALIA!';
        statusEl.style.background = 'rgba(239, 68, 68, 0.2)';
        statusEl.style.color = '#ef4444';
        statusEl.style.borderColor = '#ef4444';

        // Add anomaly - only for truly significant readings
        addAnomaly('EMF', displayValue.toFixed(1) + ' μT');

        // Create particles for visual effect
        createEMFParticles(percentage);
    }

    // Add to history
    emfHistory.push(displayValue);
    if (emfHistory.length > maxHistoryPoints) {
        emfHistory.shift();
    }

    // Update overview
    document.getElementById('overviewEMF').textContent = displayValue.toFixed(1) + ' μT';

    // Draw history graph
    drawEMFHistory();
}

function createEMFParticles(intensity) {
    const count = Math.floor(intensity / 10);
    for (let i = 0; i < count; i++) {
        emfParticles.push({
            x: Math.random() * 100,
            y: Math.random() * 100,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            life: 1,
            size: Math.random() * 3 + 1
        });
    }
}

function drawEMFHistory() {
    const canvas = document.getElementById('emfHistory');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    if (emfHistory.length < 2) return;

    ctx.strokeStyle = '#22ff88';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const step = width / maxHistoryPoints;
    emfHistory.forEach((value, index) => {
        const x = index * step;
        const y = height - (value / 100 * height);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}

// ===== MOTION DETECTOR =====
function updateMotionDisplay() {
    // Update axis displays
    const maxMotion = 20; // m/s²

    const xPercent = Math.min(50, Math.abs(motionData.x) / maxMotion * 50);
    const yPercent = Math.min(50, Math.abs(motionData.y) / maxMotion * 50);
    const zPercent = Math.min(50, Math.abs(motionData.z) / maxMotion * 50);

    document.getElementById('motionX').style.width = xPercent + '%';
    document.getElementById('motionY').style.width = yPercent + '%';
    document.getElementById('motionZ').style.width = zPercent + '%';

    document.getElementById('motionXValue').textContent = motionData.x.toFixed(2);
    document.getElementById('motionYValue').textContent = motionData.y.toFixed(2);
    document.getElementById('motionZValue').textContent = motionData.z.toFixed(2);

    // Calculate magnitude
    const magnitude = Math.sqrt(motionData.x ** 2 + motionData.y ** 2 + motionData.z ** 2);
    document.getElementById('motionMagnitude').textContent = magnitude.toFixed(2);

    // Update overview
    document.getElementById('overviewMotion').textContent = magnitude.toFixed(2);

    // Check for anomalies using CALIBRATED threshold
    // Anomaly = magnitude significantly different from expected gravity
    const expectedGravity = calibration.motion.gravityMagnitude || 9.8;
    const motionDeviation = Math.abs(magnitude - expectedGravity);
    const motionThreshold = calibration.motion.threshold || 5;

    if (motionDeviation > motionThreshold) {
        addAnomaly('Ruch', 'Intensywność: ' + magnitude.toFixed(2) + ' (odchylenie: ' + motionDeviation.toFixed(2) + ')');
    }

    // Add to trail
    motionTrailPoints.push({ x: motionData.x, y: motionData.y, z: motionData.z });
    if (motionTrailPoints.length > 100) {
        motionTrailPoints.shift();
    }

    drawMotionTrail();
}

function drawMotionTrail() {
    const canvas = document.getElementById('motionTrail');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // Draw center point
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Draw trail
    if (motionTrailPoints.length < 2) return;

    motionTrailPoints.forEach((point, index) => {
        const alpha = index / motionTrailPoints.length;
        const x = centerX + point.x * 10;
        const y = centerY + point.y * 10;

        ctx.fillStyle = `rgba(34, 255, 136, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ===== EVP RECORDER =====
async function startEVPRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        app.audio.context = new (window.AudioContext || window.webkitAudioContext)();
        app.audio.analyser = app.audio.context.createAnalyser();
        app.audio.microphone = app.audio.context.createMediaStreamSource(stream);
        app.audio.microphone.connect(app.audio.analyser);

        app.audio.analyser.fftSize = 2048;

        // Start recording
        app.audio.mediaRecorder = new MediaRecorder(stream);
        app.audio.recordedChunks = [];

        app.audio.mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                app.audio.recordedChunks.push(e.data);
            }
        };

        app.audio.mediaRecorder.start();

        document.getElementById('evpRecord').disabled = true;
        document.getElementById('evpStop').disabled = false;
        document.getElementById('evpStatus').textContent = '🔴 Nagrywanie...';

        // Start visualization
        visualizeEVP();

    } catch (err) {
        console.error('EVP recording error:', err);
        alert('Nie udało się uruchomić nagrywania. Sprawdź uprawnienia mikrofonu.');
    }
}

function stopEVPRecording() {
    if (app.audio.mediaRecorder) {
        app.audio.mediaRecorder.stop();
        app.audio.microphone.disconnect();

        document.getElementById('evpRecord').disabled = false;
        document.getElementById('evpStop').disabled = true;
        document.getElementById('evpPlay').disabled = false;
        document.getElementById('evpStatus').textContent = 'Nagranie gotowe do odtworzenia';
    }
}

function playEVPRecording() {
    if (app.audio.recordedChunks.length === 0) return;

    const blob = new Blob(app.audio.recordedChunks, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();

    document.getElementById('evpStatus').textContent = '▶️ Odtwarzanie...';
    audio.onended = () => {
        document.getElementById('evpStatus').textContent = 'Nagranie zakończone';
    };
}

function visualizeEVP() {
    if (!app.audio.analyser) return;

    const waveformCanvas = document.getElementById('evpWaveform');
    const spectrumCanvas = document.getElementById('evpSpectrum');

    if (!waveformCanvas || !spectrumCanvas) return;

    const waveformCtx = waveformCanvas.getContext('2d');
    const spectrumCtx = spectrumCanvas.getContext('2d');

    const bufferLength = app.audio.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        if (!app.audio.analyser || document.getElementById('evpStop').disabled) return;

        requestAnimationFrame(draw);

        app.audio.analyser.getByteTimeDomainData(dataArray);

        // Waveform
        waveformCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        waveformCtx.fillRect(0, 0, waveformCanvas.width, waveformCanvas.height);
        waveformCtx.strokeStyle = '#22ff88';
        waveformCtx.lineWidth = 2;
        waveformCtx.beginPath();

        const sliceWidth = waveformCanvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * waveformCanvas.height / 2;

            if (i === 0) {
                waveformCtx.moveTo(x, y);
            } else {
                waveformCtx.lineTo(x, y);
            }

            x += sliceWidth;
        }

        waveformCtx.stroke();

        // Spectrum
        app.audio.analyser.getByteFrequencyData(dataArray);

        spectrumCtx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        spectrumCtx.fillRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);

        const barWidth = (spectrumCanvas.width / bufferLength) * 2.5;
        let barHeight;
        x = 0;

        for (let i = 0; i < bufferLength; i++) {
            barHeight = dataArray[i] / 255 * spectrumCanvas.height;

            const hue = i / bufferLength * 120 + 120;
            spectrumCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            spectrumCtx.fillRect(x, spectrumCanvas.height - barHeight, barWidth, barHeight);

            x += barWidth + 1;
        }
    }

    draw();
}

// ===== SPIRIT BOX =====
function startSpiritBox() {
    app.spiritBox.active = true;
    document.getElementById('spiritStart').disabled = true;
    document.getElementById('spiritStop').disabled = false;

    app.spiritBox.interval = setInterval(() => {
        const word = app.spiritBox.words[Math.floor(Math.random() * app.spiritBox.words.length)];
        const wordEl = document.getElementById('spiritWord');

        wordEl.style.opacity = 0;
        setTimeout(() => {
            wordEl.textContent = word;
            wordEl.style.opacity = 1;

            // Add to log
            addSpiritLog(word);
        }, 100);

    }, 1500 + Math.random() * 1000);
}

function stopSpiritBox() {
    app.spiritBox.active = false;
    clearInterval(app.spiritBox.interval);
    document.getElementById('spiritStart').disabled = false;
    document.getElementById('spiritStop').disabled = true;
    document.getElementById('spiritWord').textContent = '---';
}

function addSpiritLog(word) {
    const logEl = document.getElementById('spiritLog');
    const entry = document.createElement('div');
    entry.className = 'log-entry';

    const time = new Date().toLocaleTimeString('pl-PL');
    entry.textContent = `[${time}] ${word}`;

    logEl.appendChild(entry);
    logEl.scrollTop = logEl.scrollHeight;
}

// ===== OVERVIEW & ANOMALIES =====
function addAnomaly(type, details) {
    app.anomalyCount++;
    document.getElementById('overviewAnomalies').textContent = app.anomalyCount;

    const alertList = document.getElementById('alertList');
    const noAlerts = alertList.querySelector('.no-alerts');
    if (noAlerts) noAlerts.remove();

    const alert = document.createElement('div');
    alert.className = 'alert-item danger';

    const time = new Date().toLocaleTimeString('pl-PL');
    alert.innerHTML = `<strong>[${time}] ${type}</strong><br>${details}`;

    alertList.insertBefore(alert, alertList.firstChild);

    // Limit to 10 alerts
    while (alertList.children.length > 10) {
        alertList.lastChild.remove();
    }
}

// ===== DETECTION LOOP =====
function startDetection() {
    app.isActive = true;
    app.sessionStartTime = Date.now();

    // Start session timer
    setInterval(updateSessionTimer, 1000);

    // Start animation loops
    animateEMFParticles();
}

function updateSessionTimer() {
    if (!app.sessionStartTime) return;

    const elapsed = Math.floor((Date.now() - app.sessionStartTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    document.getElementById('sessionTimer').textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function animateEMFParticles() {
    const canvas = document.getElementById('emfParticles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function animate() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        emfParticles = emfParticles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;

            if (p.life > 0) {
                ctx.fillStyle = `rgba(34, 255, 136, ${p.life})`;
                ctx.beginPath();
                ctx.arc(p.x * canvas.width / 100, p.y * canvas.height / 100, p.size, 0, Math.PI * 2);
                ctx.fill();
                return true;
            }
            return false;
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// ===== STATUS UPDATES =====
function updateStatus(text, type) {
    const indicator = document.getElementById('statusIndicator');
    const statusText = indicator.querySelector('.status-text');
    const statusDot = indicator.querySelector('.status-dot');

    statusText.textContent = text;

    const colors = {
        success: '#10b981',
        warning: '#fbbf24',
        danger: '#ef4444'
    };

    const color = colors[type] || colors.success;
    indicator.style.borderColor = color;
    indicator.style.background = `rgba(${type === 'success' ? '16, 185, 129' : type === 'warning' ? '251, 191, 36' : '239, 68, 68'}, 0.1)`;
    statusDot.style.background = color;
    statusDot.style.boxShadow = `0 0 10px ${color}`;
    statusText.style.color = color;
}
