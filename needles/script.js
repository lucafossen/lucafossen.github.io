// Get DOM elements
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const needleCountInput = document.getElementById('needle-count');
const dropBtn = document.getElementById('drop-btn');
const resetBtn = document.getElementById('reset-btn');
const totalNeedlesOutput = document.getElementById('total-needles');
const crossingNeedlesOutput = document.getElementById('crossing-needles');
const piApproxOutput = document.getElementById('pi-approx');
const infiniteBtn = document.getElementById('infinite-btn');

// Initialize variables
let totalNeedles = 0;
let crossingNeedles = 0;
let isRunning = false;
let animationFrameId = null;

// Global constants for line spacing and needle length
const SPACING = 80;
const LENGTH = SPACING / 2;

// Set canvas dimensions with proper scaling for high DPI displays
function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    ctx.scale(ratio, ratio);
    drawLines();

    console.log(`Canvas Width: ${canvas.width}, Canvas Height: ${canvas.height}`);
    console.log(`Client Width: ${canvas.clientWidth}, Client Height: ${canvas.clientHeight}`);
}

// Draw vertical lines on the canvas
function drawLines() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#adadad';
    ctx.lineWidth = 2;
    for (let x = 0; x <= canvas.width; x += SPACING) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

// Start the timer
function startTimer() {
    const timerElement = document.getElementById('timer');
    let startTime = Date.now();

    const timerInterval = setInterval(() => {
        if (!isRunning) {
            clearInterval(timerInterval);
            return;
        }
        const elapsedTime = Date.now() - startTime;
        const seconds = Math.floor(elapsedTime / 1000);
        timerElement.textContent = `${seconds} s`;
    }, 1000);
}

// Function to generate normally distributed random numbers using Box-Muller transform
// function randn_bm() {
//     let u = 0, v = 0;
//     while (u === 0) u = Math.random();
//     while (v === 0) v = Math.random();
//     return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
// }

// Drop needles continuously until the required number is reached or until stopped
function dropNeedles(numNeedles, isInfinite = false) {
    if (isRunning) return;
    isRunning = true;

    startTimer();

    // Calculate the number of segments (lines) on the canvas
    const numSegments = Math.floor(canvas.width / SPACING);

    let batchSize = isInfinite ? 10000 : Math.max(1, Math.floor((numNeedles - totalNeedles) / 100));
    function dropBatch() {
        if (!isRunning) {
            cancelAnimationFrame(animationFrameId);
            updateResults();
            return;
        }

        if (!isInfinite && batchSize <= 0) {
            isRunning = false;
            updateResults();
            cancelAnimationFrame(animationFrameId);
            return;
        }

        const numSegments = Math.floor(canvas.width / SPACING);

        for (let i = 0; i < batchSize; i++) {
            if (!isRunning) break;
            if (!isInfinite && totalNeedles >= numNeedles) {
                isRunning = false;
                break;
            }

            // Random relative position between two given lines (from 0 to spacing)
            const relativeX = Math.random() * SPACING;

            // Randomly determine which segment (line) the needle is placed in
            const segmentIndex = Math.floor(Math.random() * numSegments);
            const xBase = segmentIndex * SPACING;

            // Compute the actual xCenter position
            const xCenter = xBase + relativeX;
            const yCenter = Math.random() * canvas.height;
            const angle = Math.random() * Math.PI;

            const deltaX = (LENGTH / 2) * Math.cos(angle);
            const deltaY = (LENGTH / 2) * Math.sin(angle);

            const x1 = xCenter - deltaX;
            const y1 = yCenter - deltaY;
            const x2 = xCenter + deltaX;
            const y2 = yCenter + deltaY;

            // Check for crossing
            const lineIndex1 = Math.floor(x1 / SPACING);
            const lineIndex2 = Math.floor(x2 / SPACING);
            const crossesLine = lineIndex1 !== lineIndex2;

            // Draw needle
            drawNeedle(x1, y1, x2, y2, crossesLine);

            totalNeedles++;
            if (crossesLine) crossingNeedles++;
        }

        updateResults();

        // Continue dropping needles
        animationFrameId = requestAnimationFrame(dropBatch);
    }

    animationFrameId = requestAnimationFrame(dropBatch);
}

// Draw a single needle on the canvas
function drawNeedle(x1, y1, x2, y2, crossesLine) {
    ctx.strokeStyle = crossesLine ? '#ff4c60' : '#00d97e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

// Update the displayed results
function updateResults() {
    totalNeedlesOutput.textContent = totalNeedles;
    crossingNeedlesOutput.textContent = crossingNeedles;

    // Calculate π approximation
    const piApprox = crossingNeedles ? (totalNeedles / crossingNeedles).toFixed(6) : '0';
    piApproxOutput.textContent = piApprox;
}

// Stop the simulation without resetting counts
function stopSimulation() {
    isRunning = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    updateResults();

    // Stop the timer
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = timerElement.textContent; // Keep the current timer value
    }

    // Update Infinite Button state
    infiniteBtn.textContent = 'Drop Infinitely';
    dropBtn.disabled = false;
    needleCountInput.disabled = false;
}

// Reset the simulation
function resetSimulation() {
    isRunning = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    totalNeedles = 0;
    crossingNeedles = 0;
    updateResults();
    drawLines();

    // Reset timer display
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.textContent = '0 s';
    }

    // Reset infinite button state
    infiniteBtn.textContent = 'Drop Infinitely';
    dropBtn.disabled = false;
    needleCountInput.disabled = false;
}

// Event listeners
dropBtn.addEventListener('click', () => {
    const num = parseInt(needleCountInput.value, 10);
    if (isNaN(num) || num <= 0) {
        alert('Please enter a valid number of needles.');
        return;
    }
    dropNeedles(totalNeedles+num);
});

resetBtn.addEventListener('click', resetSimulation);

infiniteBtn.addEventListener('click', function() {
    if (!isRunning) {
        dropNeedles(-1, true);
        this.textContent = 'Stop';
        dropBtn.disabled = true;
        needleCountInput.disabled = true;
    } else {
        stopSimulation();
    }
});

// Change the up and down buttons of the input field to increase or decrease the value by a power of ten
needleCountInput.addEventListener('input', function(event) {
    let value = parseInt(this.value, 10);
    if (isNaN(value)) {
        return;
    }
    if (event.inputType !== 'insertReplacementText') {
        this.oldValue = parseInt(this.value, 10);
        return;
    }

    // Check if the value is a power of 10
    const isPowerOfTen = (num) => num > 0 && Math.log10(num) % 1 === 0;

    if (!isPowerOfTen(value)) {
        // If not a power of ten, adjust to the nearest power of ten
        const direction = value > (this.oldValue || 1) ? 1 : -1;
        const magnitude = Math.pow(10, Math.floor(Math.log10(this.oldValue || 1)));
        this.value = direction > 0 ? magnitude * 10 : Math.max(1, magnitude / 10);
    }

    this.oldValue = parseInt(this.value, 10); // Store the current value for future reference
});

// Debounce function to limit the rate at which a function can fire
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Add debounce to the resize event listener
window.addEventListener('resize', debounce(resizeCanvas, 200));
// window.addEventListener('resize', resizeCanvas);

document.addEventListener('DOMContentLoaded', () => {
    let timerElement = document.getElementById('timer');
    if (!timerElement) {
        timerElement = document.createElement('div');
        timerElement.id = 'timer';
        timerElement.style.marginTop = '10px';
        timerElement.style.fontSize = '1.2em';
        timerElement.textContent = '0 s';
        const header = document.querySelector('header');
        if (header) {
            header.appendChild(timerElement);
        } else {
            document.body.insertBefore(timerElement, document.body.firstChild);
        }
    }

    // Initialize canvas
    resizeCanvas();
});