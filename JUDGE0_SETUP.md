# Judge0 Code Execution Integration - Setup Guide

## ✅ What's Been Implemented

Your ZeroPay Code AI IDE now has full code execution capabilities powered by Judge0 API! Here's what's been added:

### 1. **API Route** (`/api/execute`)
- Receives code, language, and file path
- Detects language ID from file extension or language name
- Sends code to Judge0 API for execution
- Returns output, errors, execution time, and memory usage

### 2. **Server Store Updates** (`serverStore.ts`)
- `executeCode(code, language, filePath)` - Executes code via Judge0
- `stopExecution()` - Cancels running execution
- `isExecuting` state - Tracks if code is currently running
- Automatic terminal output display
- Execution statistics (time, memory, exit code)

### 3. **Run Controls Updates** (`RunControls.tsx`)
- Smart detection: Executes current file OR starts project server
- Shows "Running..." status during execution
- Stop button cancels execution in progress
- Auto-opens terminal when executing code
- Displays language in tooltip (e.g., "Run Python (Ctrl+Enter)")

### 4. **Supported Languages**
- JavaScript/TypeScript (Node.js)
- Python 3
- Java
- C/C++
- C#
- Go
- Rust
- PHP
- Ruby
- Swift
- Kotlin
- SQL (SQLite)
- Bash/Shell

## 🔧 Setup Instructions

### Step 1: Get Judge0 API Key

1. Go to [RapidAPI - Judge0 CE](https://rapidapi.com/judge0-official/api/judge0-ce)
2. Sign up for a RapidAPI account (free tier available)
3. Subscribe to the Judge0 CE API
4. Copy your API key from the dashboard

### Step 2: Configure Environment Variables

Open `.env` file and replace the placeholder:

```env
# Judge0 Code Execution API (RapidAPI)
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-rapidapi-key-here  # ← Replace this!
JUDGE0_API_HOST=judge0-ce.p.rapidapi.com
```

### Step 3: Restart Your App

```bash
npm run dev
```

## 🎯 How to Use

### Execute Code:
1. Open any code file in the editor (`.js`, `.py`, `.java`, `.cpp`, etc.)
2. Click the **Run** button (▶) in the top bar
3. Or press **Ctrl+Enter**
4. Terminal opens automatically and shows:
   - Execution output (white text)
   - Errors (red text)
   - Execution time
   - Memory usage
   - Exit code

### Stop Execution:
1. Click the **Stop** button (■) while code is running
2. Execution is cancelled immediately
3. Terminal shows "Execution cancelled" message

### Status Indicators:
- **Stopped** (Gray) - No execution running
- **Running...** (Yellow, pulsing) - Code is executing
- **Error** (Red) - Execution failed
- **Running** (Green) - Project server is running

## 📊 Example Outputs

### Successful Execution:
```
▶ Running JavaScript code...

Hello, World!

⏱ Execution time: 0.001s
💾 Memory used: 2048 KB
✓ Process finished with exit code 0
```

### Error Execution:
```
▶ Running Python code...

  File "main.py", line 2
    print("Hello"
                ^
SyntaxError: unexpected EOF while parsing

✓ Process finished with exit code 6
```

## 🔍 Technical Details

### Language Detection:
The system automatically detects the programming language from:
1. **File extension** (`.js` → JavaScript, `.py` → Python, etc.)
2. **Monaco Editor language** (set in status bar)
3. **Defaults to JavaScript** if cannot detect

### Judge0 Status Codes:
- `3` - Accepted (Success)
- `6` - Compilation Error
- `7-14` - Runtime Errors (various types)
- `15` - Internal Error
- `16` - Exec Format Error

### API Response Structure:
```typescript
{
  success: boolean,
  output: string | null,
  error: string | null,
  status: string,
  statusCode: number,
  executionTime: number,
  memoryUsage: number,
  languageId: number
}
```

## 🚨 Troubleshooting

### "Failed to execute code" error:
- Check that `JUDGE0_API_KEY` is set correctly in `.env`
- Verify your RapidAPI subscription is active
- Check rate limits on your RapidAPI plan

### Code not running:
- Make sure you have a file open in the editor
- Ensure the file has content
- Check browser console for errors

### Wrong language detected:
- Verify file extension is correct
- Check the language shown in the status bar
- Language detection prioritizes: language name → file extension → JavaScript (default)

## 💡 Features

✅ **Auto Terminal Open** - Terminal opens automatically when executing code  
✅ **Real-time Status** - "Running..." status shown in top bar  
✅ **Cancel Execution** - Stop button aborts running code  
✅ **Error Highlighting** - Errors displayed in red in terminal  
✅ **Execution Stats** - Shows time and memory usage  
✅ **Multi-language** - Supports 15+ programming languages  
✅ **Smart Detection** - Automatically detects language from file  
✅ **Dual Mode** - Executes code files OR starts project servers  

## 🎨 UI Updates

### Run Button:
- Shows **Play icon** (▶) when ready to execute
- Shows **Spinner** when executing
- Tooltip shows current language (e.g., "Run Python")
- Disabled while execution is in progress

### Stop Button:
- Shows **Square icon** (■)
- Red highlight when execution is running
- Tooltip changes: "Stop Execution" vs "Stop Project"
- Enabled only during execution or when server is running

### Status Bar:
- **Gray dot** - Stopped
- **Yellow pulsing dot** - Starting/Building/Running code
- **Green dot** - Server running
- **Red dot** - Error

## 📝 Notes

- Judge0 free tier has rate limits (check RapidAPI for details)
- Execution is sandboxed and secure
- Standard input (stdin) is currently empty
- Standard error (stderr) is redirected to stdout
- Execution time and memory limits are set by Judge0 defaults

## 🚀 Next Steps (Optional Enhancements)

- [ ] Add stdin input support
- [ ] Add custom execution time limits
- [ ] Add file upload for multi-file projects
- [ ] Add execution history
- [ ] Add code performance profiling
- [ ] Add support for package dependencies
- [ ] Add real-time output streaming

---

**Need Help?** Check the RapidAPI Judge0 documentation: https://rapidapi.com/judge0-official/api/judge0-ce
