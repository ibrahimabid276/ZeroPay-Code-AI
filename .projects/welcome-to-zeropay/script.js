// ZeroPay Code AI Demo - Interactive Counter

let count = 0;
const counterElement = document.getElementById('counter');
const hintText = document.getElementById('hint-text');
const button = document.getElementById('increment-btn');

// Increment counter on button click
button.addEventListener('click', () => {
    count++;
    updateDisplay();
    
    // Add pulse animation
    counterElement.classList.add('pulse');
    setTimeout(() => {
        counterElement.classList.remove('pulse');
    }, 300);
    
    // Fun messages at certain counts
    if (count === 10) {
        alert('🎉 Great job! You clicked 10 times!');
    } else if (count === 50) {
        alert('🚀 Wow! 50 clicks! You\'re on fire!');
    } else if (count === 100) {
        alert('🏆 100 clicks! You\'re a champion!');
    }
});

// Update the display
function updateDisplay() {
    counterElement.textContent = count;
    hintText.textContent = count;
    
    // Change color based on count
    if (count < 10) {
        counterElement.style.color = '#667eea';
    } else if (count < 50) {
        counterElement.style.color = '#764ba2';
    } else {
        counterElement.style.color = '#f093fb';
    }
}

// Log welcome message
console.log('🎉 Welcome to ZeroPay Code AI!');
console.log('💡 Try modifying this code and clicking Run!');
console.log('🤖 Ask the AI to help you add features!');

// Keyboard shortcut - press 'R' to reset
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        count = 0;
        updateDisplay();
        console.log('🔄 Counter reset!');
    }
});
