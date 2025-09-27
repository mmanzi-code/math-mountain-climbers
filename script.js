// --- Game Configuration ---
const LEVELS = [
    { name: "Base Camp", min: 1, max: 5, reward: "🥾 New Hiking Boots", img: 'images/base-camp.jpg' },
    { name: "First Ascent", min: 1, max: 7, reward: "🧥 Warm Fleece Jacket", img: 'images/first-ascent.jpg' },
    { name: "The Ridge", min: 2, max: 8, reward: "🎒 Heavy Duty Backpack", img: 'images/the-ridge.jpg' },
    { name: "High Plateau", min: 3, max: 9, reward: "🧭 Digital Compass", img: 'images/high-plateau.jpg' },
    { name: "Windy Pass", min: 4, max: 10, reward: "🦯 Sturdy Hiking Poles", img: 'images/windy-pass.jpg' },
    { name: "The Snow Line", min: 5, max: 11, reward: "🧤 Thermal Gloves", img: 'images/the-snow-line.jpg' },
    { name: "The Boulder Field", min: 6, max: 12, reward: "🪖 Climbing Helmet", img: 'images/the-boulder-field.jpg' },
    { name: "Thin Air", min: 7, max: 12, reward: "⛰️ Oxygen Tank", img: 'images/thin-air.jpg' },
    { name: "Final Push", min: 8, max: 12, reward: "🧊 Ice Axe", img: 'images/final-push.jpg' },
    { name: "The Summit", min: 10, max: 12, reward: "🏆 Golden Trophy", img: 'images/the-summit.jpg' }
];
const QUESTIONS_PER_LEVEL = 10;
const PASSING_SCORE_PERCENTAGE = 0.6; // 60% for passing a level (6 out of 10)

// --- Game State Variables ---
let currentLevelIndex = 0;
let levelQuestionsAnswered = 0;
let correctAnswersInLevel = 0;
let totalScore = 0;
let correctAnswer = 0;

// --- DOM Elements ---
const bodyEl = document.body;
const problemEl = document.getElementById('problem');
const answerInputEl = document.getElementById('answer-input');
const checkButtonEl = document.getElementById('check-button');
const nextButtonEl = document.getElementById('next-button');
const feedbackEl = document.getElementById('feedback');
const scoreEl = document.getElementById('score');
const levelNameEl = document.getElementById('level-name');
const levelNumEl = document.getElementById('level-num');
const questionTrackerEl = document.getElementById('question-tracker');

// Start Game Modal Elements
const startGameModalEl = document.getElementById('start-game-modal');
const startButtonEl = document.getElementById('start-button');

// Level Introduction Modal Elements
const levelIntroModalEl = document.getElementById('level-intro-modal');
const introLevelTitleEl = document.getElementById('intro-level-title');
const introLevelNameEl = document.getElementById('intro-level-name');
const startLevelButtonEl = document.getElementById('start-level-button');

// Level Up/Restart Modal Elements
const levelUpModalEl = document.getElementById('level-up-modal');
const modalTitleEl = document.getElementById('modal-title');
const modalMessageEl = document.getElementById('modal-message');
const rewardMessageTextEl = document.getElementById('reward-message-text');
const rewardGearEl = document.getElementById('reward-gear');
const modalActionButtonEl = document.getElementById('modal-action-button');

// NEW: Music Element
const gameMusicEl = document.getElementById('game-music'); 

// --- Functions ---

/**
 * Updates the header with the current level name and question count.
 */
function updateHeader() {
    const currentLevel = LEVELS[currentLevelIndex];
    levelNameEl.textContent = currentLevel.name;
    levelNumEl.textContent = currentLevelIndex + 1;
    questionTrackerEl.textContent = `${levelQuestionsAnswered}/${QUESTIONS_PER_LEVEL}`;
    scoreEl.textContent = totalScore;
}

/**
 * Updates the background image based on the current level.
 */
function updateBackgroundImage() {
    const currentLevel = LEVELS[currentLevelIndex];
    bodyEl.style.backgroundImage = `url(${currentLevel.img})`;
}

/**
 * Shows the introduction screen for the current level.
 */
function showLevelIntro() {
    const currentLevel = LEVELS[currentLevelIndex];

    // 1. Ensure the main game container is cleared of old elements
    problemEl.textContent = "";
    answerInputEl.classList.add('hidden');
    checkButtonEl.classList.add('hidden');
    nextButtonEl.classList.add('hidden');
    feedbackEl.classList.add('hidden');

    // 2. Hide all other modals
    startGameModalEl.classList.add('hidden');
    levelUpModalEl.classList.add('hidden');

    // 3. Update the intro modal content
    introLevelTitleEl.textContent = `Level ${currentLevelIndex + 1}`;
    introLevelNameEl.textContent = currentLevel.name;

    // 4. Show the intro modal
    levelIntroModalEl.classList.remove('hidden');
    startLevelButtonEl.focus();

    // 5. Update header info and background (so they match the upcoming level)
    updateHeader();
    updateBackgroundImage();
}

/**
 * Generates a random multiplication problem based on the current level's difficulty.
 */
function generateProblem() {
    if (currentLevelIndex >= LEVELS.length) {
        return;
    }

    const currentLevel = LEVELS[currentLevelIndex];
    const min = currentLevel.min;
    const max = currentLevel.max;

    const getRandomFactor = (min, max) => {
        if (currentLevelIndex > 5 && Math.random() > 0.5) {
            return Math.floor(Math.random() * (max - Math.max(min, 7) + 1)) + Math.max(min, 7);
        }
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    
    let factor1 = getRandomFactor(min, max);
    let factor2 = getRandomFactor(min, max);

    if (currentLevelIndex > 5 && factor1 < 3) factor1 = getRandomFactor(3, max);
    if (currentLevelIndex > 5 && factor2 < 3) factor2 = getRandomFactor(3, max);
    
    correctAnswer = factor1 * factor2;

    problemEl.textContent = `${factor1} \u00D7 ${factor2} = ?`;

    // Reset UI
    answerInputEl.value = '';
    answerInputEl.disabled = false;
    checkButtonEl.classList.remove('hidden');
    nextButtonEl.classList.add('hidden');
    feedbackEl.textContent = '';
    feedbackEl.classList.remove('correct', 'incorrect');
    feedbackEl.classList.remove('hidden'); 
    answerInputEl.classList.remove('hidden');
    answerInputEl.focus();
    updateHeader();
}

/**
 * Shows the level up/restart modal.
 */
function showLevelUp() {
    const currentLevel = LEVELS[currentLevelIndex];
    const levelScore = correctAnswersInLevel;
    const passThreshold = QUESTIONS_PER_LEVEL * PASSING_SCORE_PERCENTAGE;

    // Remove problem/input from view
    problemEl.textContent = "";
    answerInputEl.classList.add('hidden');
    checkButtonEl.classList.add('hidden');
    nextButtonEl.classList.add('hidden');
    feedbackEl.textContent = ''; 
    feedbackEl.classList.add('hidden');

    rewardGearEl.classList.remove('hidden');
    rewardMessageTextEl.classList.remove('hidden');
    
    // Check if player passed the level
    if (levelScore >= passThreshold) {
        modalTitleEl.textContent = `Level Complete: ${currentLevel.name}!`;
        modalMessageEl.textContent = `You answered ${levelScore} out of ${QUESTIONS_PER_LEVEL} correctly. Excellent job, climber!`;
        rewardGearEl.textContent = currentLevel.reward;
        modalActionButtonEl.textContent = "Continue Climbing!";
        modalActionButtonEl.classList.remove('restart-button');
        modalActionButtonEl.onclick = nextLevel;

        if (currentLevelIndex === LEVELS.length - 1) { // Final summit
            modalTitleEl.textContent = "CONGRATULATIONS, YOU SUMMITED!";
            modalMessageEl.textContent = `You've conquered Math Mountain with a total score of ${totalScore}! You are a true Multiplication Master!`;
            rewardGearEl.textContent = currentLevel.reward;
            rewardMessageTextEl.textContent = "Your ultimate achievement:";
            modalActionButtonEl.textContent = "Play Again!";
            modalActionButtonEl.onclick = resetGame;
        }

    } else { // Level Failed
        modalTitleEl.textContent = `Level Failed: ${currentLevel.name}`;
        modalMessageEl.textContent = `You answered ${levelScore} out of ${QUESTIONS_PER_LEVEL} correctly. You need at least ${passThreshold} to pass this level. Practice makes perfect!`;
        rewardMessageTextEl.classList.add('hidden');
        rewardGearEl.classList.add('hidden');
        modalActionButtonEl.textContent = "Restart Level";
        modalActionButtonEl.classList.add('restart-button');
        modalActionButtonEl.onclick = restartLevel;
    }
    
    levelUpModalEl.classList.remove('hidden');
    modalActionButtonEl.focus();
}

/**
 * Checks the user's answer.
 */
function checkAnswer() {
    const userAnswer = parseInt(answerInputEl.value, 10);
    
    if (isNaN(userAnswer)) {
        feedbackEl.textContent = "Please enter a number!";
        feedbackEl.className = 'feedback incorrect';
        return;
    }

    let isCorrect = (userAnswer === correctAnswer);
    
    if (isCorrect) {
        totalScore++;
        correctAnswersInLevel++;
        feedbackEl.textContent = "⭐️ Correct! Keep climbing!";
        feedbackEl.className = 'feedback correct';
    } else {
        feedbackEl.textContent = `❌ Incorrect. The answer is ${correctAnswer}.`;
        feedbackEl.className = 'feedback incorrect';
    }
    levelQuestionsAnswered++;

    // Update UI and disable input
    answerInputEl.disabled = true;
    checkButtonEl.classList.add('hidden');
    updateHeader();
    
    if (levelQuestionsAnswered >= QUESTIONS_PER_LEVEL) {
        showLevelUp(); 
    } else {
        nextButtonEl.classList.remove('hidden');
        nextButtonEl.focus();
    }
}

/**
 * Starts the next question or shows the level up screen.
 */
function startNextQuestion() {
    generateProblem();
}

/**
 * Initializes the game after the start button is clicked.
 */
function initializeGame() {
    startGameModalEl.classList.add('hidden');
    currentLevelIndex = 0;
    levelQuestionsAnswered = 0;
    correctAnswersInLevel = 0;
    totalScore = 0;
    
    // NEW MUSIC LOGIC: Attempt to start the music
    gameMusicEl.volume = 0.5;
    gameMusicEl.play().catch(error => {
        // This catch handles the browser's autoplay block.
        console.log("Music autoplay blocked. User will need to interact again.");
    });
    
    showLevelIntro(); // Go to the intro screen for Level 1
}

/**
 * Moves the game to the next level.
 */
function nextLevel() {
    levelUpModalEl.classList.add('hidden'); 
    currentLevelIndex++; 
    levelQuestionsAnswered = 0;
    correctAnswersInLevel = 0;
    
    if (currentLevelIndex < LEVELS.length) {
        showLevelIntro();
    } else {
        console.log("Game Finished!");
    }
}

/**
 * Restarts the current level.
 */
function restartLevel() {
    levelUpModalEl.classList.add('hidden');
    levelQuestionsAnswered = 0;
    correctAnswersInLevel = 0;
    showLevelIntro();
}

/**
 * Resets the entire game to the beginning.
 */
function resetGame() {
    levelUpModalEl.classList.add('hidden');
    currentLevelIndex = 0;
    levelQuestionsAnswered = 0;
    correctAnswersInLevel = 0;
    totalScore = 0;
    startGameModalEl.classList.remove('hidden');
    
    // Stop and reset music on full game restart
    gameMusicEl.pause();
    gameMusicEl.currentTime = 0;
    
    updateHeader();
    updateBackgroundImage();
}

// --- Event Listeners ---
checkButtonEl.addEventListener('click', checkAnswer);
nextButtonEl.addEventListener('click', startNextQuestion);

// Button listeners for modals
startButtonEl.addEventListener('click', initializeGame); 
startLevelButtonEl.addEventListener('click', () => { 
    levelIntroModalEl.classList.add('hidden');
    generateProblem(); 
});


// Keypress listeners for Enter key
answerInputEl.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && !answerInputEl.disabled) {
        checkAnswer();
    }
});
nextButtonEl.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        startNextQuestion();
    }
});
modalActionButtonEl.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        modalActionButtonEl.click();
    }
});
startButtonEl.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        initializeGame();
    }
});
startLevelButtonEl.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        levelIntroModalEl.classList.add('hidden');
        generateProblem();
    }
});


// Initial setup when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Ensure all main game elements are hidden until the start button is pressed
    levelUpModalEl.classList.add('hidden'); 
    levelIntroModalEl.classList.add('hidden');
    problemEl.textContent = "";
    answerInputEl.classList.add('hidden');
    checkButtonEl.classList.add('hidden');
    nextButtonEl.classList.add('hidden');
    feedbackEl.classList.add('hidden');
    updateHeader();
    updateBackgroundImage();
});