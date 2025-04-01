const targetTextElement = document.getElementById('target-text');
const userInputElement = document.getElementById('user-input');
const timeElement = document.getElementById('time');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const errorsElement = document.getElementById('errors');
const errorRateElement = document.getElementById('error-rate');
const startButton = document.getElementById('start-button');
const resetButton = document.getElementById('reset-button');
const testDurationSelect = document.getElementById('test-duration');
const fontSizeSelect = document.getElementById('font-size');
const wordWrapSelect = document.getElementById('word-wrap');
const enableSoundsCheckbox = document.getElementById('enable-sounds');
const speedChartCanvas = document.getElementById('speed-chart');
const typingProgressElement = document.getElementById('typing-progress');
const lightThemeButton = document.getElementById('light-theme');
const darkThemeButton = document.getElementById('dark-theme');

let targetText = "";
let startTime;
let timerInterval;
let charIndex = 0;
let correctChars = 0;
let incorrectChars = 0;
let testRunning = false;
let testDuration = 60;
let wpmHistory = [];
let chart;

const correctSound = new Audio('correct.mp3'); // Replace with your sound file path
const incorrectSound = new Audio('incorrect.mp3'); // Replace with your sound file path

const sampleTexts = [
    "The quick brown fox jumps over the lazy dog.",
    "Programming is a skill best acquired by practice and example rather than from books.",
    "Web development combines HTML, CSS, and JavaScript to create interactive websites.",
    "Practice makes perfect, especially when it comes to improving your typing speed.",
    "Always remember to save your work frequently to avoid losing progress.",
    "Effective communication is key to success in any field.",
    "The journey of a thousand miles begins with a single step.",
    "Innovation distinguishes between a leader and a follower.",
    "Strive not to be a success, but rather to be of value.",
    "The only way to do great work is to love what you do.",
    "Artificial intelligence is rapidly transforming various industries.",
    "Cloud computing provides scalable and on-demand access to resources.",
    "Data science involves extracting knowledge and insights from data.",
    "Cybersecurity is crucial for protecting systems and networks from threats.",
    "The Internet of Things connects everyday objects to the internet."
];

function getRandomText() {
    return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
}

function formatTargetText() {
    return targetText.split('').map((char, index) => `<span id="char-${index}">${char}</span>`).join('');
}

function startGame() {
    targetText = getRandomText();
    targetTextElement.innerHTML = formatTargetText();
    userInputElement.value = "";
    timeElement.textContent = "0";
    wpmElement.textContent = "0";
    accuracyElement.textContent = "0%";
    errorsElement.textContent = "0";
    errorRateElement.textContent = "0.00";
    startTime = new Date().getTime();
    charIndex = 0;
    correctChars = 0;
    incorrectChars = 0;
    testRunning = true;
    testDuration = parseInt(testDurationSelect.value);
    wpmHistory = [];
    userInputElement.disabled = false;
    startButton.disabled = true;
    resetButton.disabled = false;
    userInputElement.focus();
    userInputElement.classList.remove('incorrect-input');
    typingProgressElement.style.width = '0%';

    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    updateTargetTextHighlight();
    updateChart();
}

function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTime = (currentTime - startTime) / 1000;
    timeElement.textContent = Math.floor(elapsedTime);

    if (elapsedTime >= testDuration) {
        endGame();
    } else {
        calculateAndDisplayResults();
    }
}

function calculateAndDisplayResults() {
    console.log("calculateAndDisplayResults called");
    const elapsedTime = parseInt(timeElement.textContent);
    const inputText = userInputElement.value;
    const targetTextLength = targetText.length;
    const typedLength = inputText.length;

    let currentCorrectChars = 0;
    let currentIncorrectChars = 0;

    for (let i = 0; i < typedLength; i++) {
        if (inputText[i] === targetText[i]) {
            currentCorrectChars++;
        } else {
            currentIncorrectChars++;
        }
    }

    correctChars = currentCorrectChars;
    incorrectChars = currentIncorrectChars;

    const wordsTyped = inputText.split(' ').filter(word => word !== '').length;
    const wpm = elapsedTime === 0 ? 0 : Math.round((wordsTyped / elapsedTime) * 60);
    const accuracy = targetTextLength === 0 ? 0 : Math.round((correctChars / typedLength) * 100);
    const errorRate = typedLength === 0 ? 0 : (incorrectChars / typedLength).toFixed(2);

    wpmElement.textContent = wpm;
    accuracyElement.textContent = accuracy + "%";
    errorsElement.textContent = incorrectChars;
    errorRateElement.textContent = errorRate;

    updateTargetTextHighlight(inputText);
    updateUserInputHighlight(inputText);
    wpmHistory.push(wpm);
    updateChart();

    // Update progress bar
    const progress = targetTextLength === 0 ? 0 : (typedLength / targetTextLength) * 100;
    typingProgressElement.style.width = `${progress}%`;

    // Check if typing is done and trigger endGame
    if (typedLength === targetTextLength) {
        console.log("Typing finished condition met - triggering endGame from calculateAndDisplayResults");
        endGame();
    }

    // Play sounds
    if (enableSoundsCheckbox.checked && typedLength > 0) {
        const lastCharCorrect = inputText[typedLength - 1] === targetText[typedLength - 1];
        if (lastCharCorrect) {
            correctSound.play().catch(error => console.log("Error playing correct sound:", error));
        } else {
            incorrectSound.play().catch(error => console.log("Error playing incorrect sound:", error));
        }
    }
}

function updateTargetTextHighlight(inputText) {
    targetText.split('').forEach((char, index) => {
        const span = document.getElementById(`char-${index}`);
        span.classList.remove('correct', 'incorrect', 'current');
        if (index < inputText.length) {
            if (inputText[index] === char) {
                span.classList.add('correct');
            } else {
                span.classList.add('incorrect');
            }
        }
        if (index === inputText.length) {
            span.classList.add('current');
        }
    });
}

function updateUserInputHighlight(inputText) {
    let hasError = false;
    for (let i = 0; i < inputText.length; i++) {
        if (inputText[i] !== targetText[i]) {
            hasError = true;
            break;
        }
    }
    if (hasError) {
        userInputElement.classList.add('incorrect-input');
    } else {
        userInputElement.classList.remove('incorrect-input');
    }
}

function endGame() {
    console.log("endGame called");
    clearInterval(timerInterval);
    testRunning = false;
    userInputElement.disabled = true;
    startButton.disabled = false; // Re-enable start button
    resetButton.disabled = false;

    // Calculate final results directly in endGame
    const elapsedTime = parseInt(timeElement.textContent);
    const inputText = userInputElement.value;
    const targetTextLength = targetText.length;
    const typedLength = inputText.length;

    let finalCorrectChars = 0;
    let finalIncorrectChars = 0;

    for (let i = 0; i < typedLength; i++) {
        if (inputText[i] === targetText[i]) {
            finalCorrectChars++;
        } else {
            finalIncorrectChars++;
        }
    }

    const finalWordsTyped = inputText.split(' ').filter(word => word !== '').length;
    const finalWpm = elapsedTime === 0 ? 0 : Math.round((finalWordsTyped / elapsedTime) * 60);
    const finalAccuracy = targetTextLength === 0 ? 0 : Math.round((finalCorrectChars / typedLength) * 100);
    const finalErrorRate = typedLength === 0 ? 0 : (finalIncorrectChars / typedLength).toFixed(2);

    wpmElement.textContent = finalWpm;
    accuracyElement.textContent = finalAccuracy + "%";
    errorsElement.textContent = finalIncorrectChars;
    errorRateElement.textContent = finalErrorRate;

    console.log("Final WPM:", finalWpm);
    console.log("Final Accuracy:", finalAccuracy);
    console.log("Final Errors:", finalIncorrectChars);
    console.log("Final Error Rate:", finalErrorRate);
}

function resetGame() {
    startGame();
}

function toggleFocusMode() {
    document.body.classList.toggle('focus-mode');
}

function updateChart() {
    if (chart) {
        chart.destroy();
    }
    const labels = Array.from({ length: wpmHistory.length }, (_, i) => i + 1);
    const data = {
        labels: labels,
        datasets: [{
            label: 'WPM Over Time',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            data: wpmHistory,
            tension: 0.4
        }]
    };
    const config = {
        type: 'line',
        data: data,
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    };
    chart = new Chart(speedChartCanvas, config);
}

// Event Listeners
startButton.addEventListener('click', startGame);
userInputElement.addEventListener('input', calculateAndDisplayResults);
resetButton.addEventListener('click', resetGame);
// focusModeToggle.addEventListener('click', toggleFocusMode); // Assuming you have this element
fontSizeSelect.addEventListener('change', (e) => {
    const size = e.target.value;
    targetTextElement.style.fontSize = `${size}em`;
    userInputElement.style.fontSize = `${size}em`;
});
wordWrapSelect.addEventListener('change', (e) => {
    const wrap = e.target.value;
    targetTextElement.classList.toggle('no-wrap', wrap === 'off');
});
enableSoundsCheckbox.addEventListener('change', () => {
    // Sound logic is in the calculateAndDisplayResults function
});
lightThemeButton.addEventListener('click', () => {
    document.body.classList.remove('dark-theme');
});
darkThemeButton.addEventListener('click', () => {
    document.body.classList.add('dark-theme');
});

// Initialize Chart (empty initially)
updateChart();
