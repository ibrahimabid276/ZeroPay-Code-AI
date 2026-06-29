/**
 * Demo project content for first-time users
 * Provides a welcoming sandbox experience with example files
 */

export const DEMO_PROJECT_ID = "welcome-to-zeropay";
export const DEMO_PROJECT_NAME = "Welcome to ZeroPay";
export const DEMO_BANNER_KEY = "zeropay-demo-banner-dismissed";
export const DEMO_PROJECT_KEY = "zeropay-demo-project-loaded";

/**
 * Check if this is a first-time user (no demo project loaded yet)
 */
export function isFirstTimeUser(): boolean {
  try {
    const demoLoaded = localStorage.getItem(DEMO_PROJECT_KEY);
    return !demoLoaded;
  } catch {
    return true;
  }
}

/**
 * Mark demo project as loaded
 */
export function markDemoProjectLoaded(): void {
  try {
    localStorage.setItem(DEMO_PROJECT_KEY, "true");
  } catch {}
}

/**
 * Check if demo banner has been dismissed
 */
export function isDemoBannerDismissed(): boolean {
  try {
    const dismissed = localStorage.getItem(DEMO_BANNER_KEY);
    return dismissed === "true";
  } catch {
    return false;
  }
}

/**
 * Dismiss demo banner
 */
export function dismissDemoBanner(): void {
  try {
    localStorage.setItem(DEMO_BANNER_KEY, "true");
  } catch {}
}

/**
 * Demo project files content
 */
export const DEMO_PROJECT_FILES = {
  "README.md": `# 🎉 Welcome to ZeroPay Code AI!

Your powerful AI-powered development environment is ready to use!

## ✨ What Can You Do?

### 🤖 AI-Powered Coding
- **Chat with AI** - Ask questions, get code suggestions, debug errors
- **Smart Completions** - AI helps you write code faster
- **Error Analysis** - Get detailed explanations and fixes for errors

### 💻 Full IDE Features
- **Code Editor** - Monaco editor with syntax highlighting for 50+ languages
- **File Explorer** - Manage your project files with drag & drop
- **Terminal** - Run commands, execute code, manage dependencies
- **Live Preview** - See your web apps in real-time
- **Git Integration** - Version control built-in

### 🚀 Run Your Code
- **Execute Code** - Run JavaScript, Python, Java, C++, and 15+ languages
- **Live Preview** - Instant preview for web projects
- **Package Management** - npm, pnpm, yarn support
- **Hot Reload** - Changes appear instantly

## 📚 Try It Out!

### 1. Open the Files
Click on the files in the explorer to see examples:
- **index.html** - A simple webpage
- **style.css** - Beautiful styling
- **script.js** - Interactive JavaScript

### 2. Run the Code
- Click the **Run** button (▶) in the top bar
- Or press **Ctrl+Enter**
- Watch the output in the terminal!

### 3. Try the AI Chat
- Click the **AI Chat** icon in the sidebar
- Ask questions like:
  - "Add a dark mode toggle"
  - "Explain how the counter works"
  - "Make the button animated"

## 🎯 Create Your First Project

When you're ready to start building:

1. Click the **Project** dropdown in the top bar
2. Select **"New Project"**
3. Give it a name
4. Start coding!

## 💡 Pro Tips

- **Keyboard Shortcuts**:
  - Ctrl+B - Toggle file explorer
  - Ctrl+L - Toggle AI chat
  - Ctrl+J - Toggle terminal
  - Ctrl+Enter - Run code
  - Ctrl+S - Save file

- **Right-click** files in the explorer for more options
- **Drag and drop** files between folders
- **Use the AI** to help you learn and code faster!

## 🌟 Ready to Build?

Delete this demo project and create your own to get started.

Happy coding! 🚀

---

**Built with ❤️ by ZeroPay Code AI**
`,

  "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to ZeroPay Code AI</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🎉 Hello, World!</h1>
            <p>Welcome to ZeroPay Code AI</p>
        </header>

        <main>
            <div class="card">
                <h2>Interactive Counter</h2>
                <p>Click the button to see JavaScript in action!</p>
                
                <div class="counter-display">
                    <span id="counter">0</span>
                </div>

                <button id="increment-btn" class="btn-primary">
                    Click Me! 🚀
                </button>

                <p class="hint">Current count: <span id="hint-text">0</span></p>
            </div>

            <div class="features">
                <div class="feature">
                    <span class="emoji">💻</span>
                    <h3>Code Editor</h3>
                    <p>Powerful Monaco editor with IntelliSense</p>
                </div>
                <div class="feature">
                    <span class="emoji">🤖</span>
                    <h3>AI Assistant</h3>
                    <p>Get help from AI while you code</p>
                </div>
                <div class="feature">
                    <span class="emoji">▶️</span>
                    <h3>Run Anywhere</h3>
                    <p>Execute code in 15+ languages</p>
                </div>
            </div>
        </main>

        <footer>
            <p>Built with ❤️ using ZeroPay Code AI</p>
        </footer>
    </div>

    <script src="script.js"></script>
</body>
</html>
`,

  "style.css": `/* ZeroPay Code AI Demo Styles */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    color: #333;
}

.container {
    max-width: 800px;
    width: 100%;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
}

header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 40px;
    text-align: center;
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    animation: fadeIn 0.8s ease-in;
}

header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

main {
    padding: 40px;
}

.card {
    background: #f8f9fa;
    border-radius: 15px;
    padding: 30px;
    margin-bottom: 30px;
    text-align: center;
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
}

.card h2 {
    color: #667eea;
    margin-bottom: 10px;
}

.card p {
    color: #666;
    margin-bottom: 20px;
}

.counter-display {
    background: white;
    border: 3px solid #667eea;
    border-radius: 15px;
    padding: 20px;
    margin: 20px 0;
    font-size: 4rem;
    font-weight: bold;
    color: #667eea;
    transition: all 0.3s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 15px 40px;
    font-size: 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.btn-primary:active {
    transform: translateY(0);
}

.hint {
    margin-top: 15px;
    font-size: 0.9rem;
    color: #999;
}

.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 30px;
}

.feature {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 15px;
    padding: 25px;
    text-align: center;
    transition: all 0.3s ease;
}

.feature:hover {
    border-color: #667eea;
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(102, 126, 234, 0.2);
}

.emoji {
    font-size: 3rem;
    display: block;
    margin-bottom: 10px;
}

.feature h3 {
    color: #667eea;
    margin-bottom: 10px;
}

.feature p {
    color: #666;
    font-size: 0.9rem;
}

footer {
    background: #f8f9fa;
    padding: 20px;
    text-align: center;
    color: #666;
    border-top: 1px solid #e0e0e0;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.05);
    }
}

.pulse {
    animation: pulse 0.3s ease;
}

/* Responsive */
@media (max-width: 600px) {
    header h1 {
        font-size: 2rem;
    }

    .counter-display {
        font-size: 3rem;
    }

    .features {
        grid-template-columns: 1fr;
    }
}
`,

  "script.js": `// ZeroPay Code AI Demo - Interactive Counter

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
        alert('🚀 Wow! 50 clicks! You\\'re on fire!');
    } else if (count === 100) {
        alert('🏆 100 clicks! You\\'re a champion!');
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
`,
};

/**
 * Create demo project with all files
 */
export async function createDemoProject(): Promise<{ id: string; name: string } | null> {
  try {
    // Create the demo project
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: DEMO_PROJECT_NAME }),
    });

    if (!res.ok) {
      console.error("Failed to create demo project");
      return null;
    }

    const data = await res.json();
    const project = data.project;

    if (!project) {
      return null;
    }

    // Create all demo files
    for (const [fileName, content] of Object.entries(DEMO_PROJECT_FILES)) {
      await fetch("/api/files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          path: fileName,
          content,
        }),
      });
    }

    // Mark demo as loaded
    markDemoProjectLoaded();

    return { id: project.id, name: project.name };
  } catch (error) {
    console.error("Error creating demo project:", error);
    return null;
  }
}
