# 🎨 Stable Flux.js | 🌟 Next-Gen AI Image Generator

A modern JavaScript interface for Stable Diffusion models with advanced features, enhanced datasets, and a clean UI. ✨

## 🚀 Features

### 🤖 Model Support
- **🔥 SD 3.5 Turbo**: Latest fast model for real-time generation
- **📸 SD 2.1 Realistic**: Enhanced with PhotoChat_120_square_HQ
- **👑 SDXL 1.0**: Flagship model 
- **🎯 SD 1.5**: Classic model

### 📚 Dataset Integrations
- **📊 PhotoChat_120_square_HQ**: High-quality realistic images
- **🔞 NSFW Datasets**: x1101/nsfw-full, amaye15/NSFW
- **🛠️ Custom Dataset Support**: Add your own datasets

### 💫 Interactive UI
- **🎯 Clean & Modern Interface**: Beautiful user experience
- **⚡ Real-time Generation**: Watch your creations come to life
- **🖼️ Image Gallery**: Organize your generations
- **🎨 Style Presets**: One-click styling
- **📏 Custom Resolution**: Perfect size control
- **🛡️ Safety Toggles**: Content control at your fingertips

### ⚙️ Advanced Features
- **🔄 Multiple Concurrent Generations**: Generate in parallel
- **🔧 Error Handling**: Smart retry logic
- **📊 Progress Indicators**: Real-time feedback
- **📱 Responsive Design**: Works on all devices
- **🚦 Rate Limiting**: Protect your API usage
- **🔌 Custom API Integration**: Extend functionality

## 🛠️ Getting Started

### 📋 Prerequisites
1. 🐍 Python 3.8+
2. 📦 Node.js 14+
3. 🔄 Git (optional)

### ⚡ Quick Install
```bash
# 🔍 Clone repository
git clone https://github.com/yourusername/stable-flux.git
cd stable-flux

# 📦 Install dependencies
pip install -r requirements.txt
```

### 🔐 Environment Setup

Create a `.env` file in your project root:

```env
# 🔑 API Keys
HUGGINGFACE_TOKEN=your_huggingface_token
STABILITY_KEY=your_stability_key (optional)

# ⚙️ Server Configuration
PORT=8000
HOST=localhost
DEBUG_MODE=false

# 🤖 Model Settings
DEFAULT_MODEL=stabilityai/stable-diffusion-3.5-large-turbo
MAX_CONCURRENT_REQUESTS=3
REQUEST_TIMEOUT=300

# 🛡️ Security
ENABLE_RATE_LIMITING=true
MAX_REQUESTS_PER_MINUTE=10
ENABLE_CORS=true
ALLOWED_ORIGINS=http://localhost:8000,http://127.0.0.1:8000

# 📝 Logging
LOG_LEVEL=INFO
LOG_FILE=app.log

# 💾 Cache Settings
ENABLE_CACHE=true
CACHE_DURATION=3600
```

### 🔧 Environment Variables Guide

#### 🔑 API Keys
- `HUGGINGFACE_TOKEN`: Your HF token (required) 🔐
- `STABILITY_KEY`: Optional Stability AI key 🗝️

#### ⚙️ Server Settings
- `PORT`: Server port number 🔌
- `HOST`: Host address 🌐
- `DEBUG_MODE`: Enable debugging 🐛

#### 🤖 Model Configuration
- `DEFAULT_MODEL`: Starting model 🎯
- `MAX_CONCURRENT_REQUESTS`: Parallel limit ⚡
- `REQUEST_TIMEOUT`: Max wait time ⏱️

#### 🛡️ Security Options
- `ENABLE_RATE_LIMITING`: Request control 🚦
- `MAX_REQUESTS_PER_MINUTE`: Rate limit 📊
- `ENABLE_CORS`: Cross-origin access 🌐
- `ALLOWED_ORIGINS`: Permitted domains 🔒

#### 📝 Logging Setup
- `LOG_LEVEL`: Detail level 📊
- `LOG_FILE`: Log location 📁

#### 💾 Cache Control
- `ENABLE_CACHE`: Toggle caching 🔄
- `CACHE_DURATION`: Cache lifetime ⏳

### 🚀 Launch Application

```bash
# 🎯 Start server
python launch.py

# 🌐 Open in browser
http://localhost:8000
```

## 🎨 Quick Usage Guide

1. 🎯 Pick your model
2. ✍️ Write your prompt
3. ⚙️ Adjust settings:
   - 📏 Resolution
   - 🎨 Style
   - 🛡️ Safety filters
4. 🚀 Click Generate!

## 🛠️ Advanced Setup

### 🤖 Add Custom Models

In `stable.api.js`:
```javascript
'your-model-id': {
    name: '🎯 Your Model',
    description: '✨ Model description',
    maxResolution: 1024,
    inferenceAPI: true,
    datasets: ['dataset1', 'dataset2'],
    safetyCheckers: true,
    contentWarning: true
}
```

### 📚 Add Custom Datasets

1. 📝 Configure in model settings
2. 🔄 Update descriptions
3. 🔄 Restart server

## 📜 License

This project is under the MIT License ⚖️

## 🤝 Community

- 🐛 Found a bug? Open an issue!
- 💡 Have an idea? Start a discussion!
- 🔧 Want to contribute? Submit a PR!

## 🌟 Star Us!

If you like Stable Flux.js, give us a star! ⭐

---
Made with ❤️ by the Stable Flux Team
