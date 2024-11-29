/**
 * Enhanced Stable Diffusion Interface with Advanced Features
 * @author Cascade
 * @version 3.0.0
 */

const CONFIG = {
    VERSION: '3.0.0',
    RATE_LIMIT: {
        MAX_REQUESTS: 9,
        COOLDOWN_MS: 10000, // 1 minute
        ERROR_MESSAGE: 'Rate limit reached. Please wait one minute before generating more images.'
    },
    EMOTES: {
        magic: '✨',
        saved: '💾',
        waiting: '⌛',
        error: '❌',
        success: '✅'
    },
    MODELS: {
        'stabilityai/stable-diffusion-3.5-large-turbo': {
            name: 'SD 3.5 Turbo',
            description: 'Latest fast turbo model with excellent quality and complete NSFW datasets',
            maxResolution: 1024,
            inferenceAPI: true,
            datasets: [
                'stabilityai/sd-turbo',
                'x1101/nsfw-full',
                'amaye15/NSFW'
            ],
            safetyCheckers: false,
            contentWarning: false,
            datasetInfo: 'Enhanced with turbo capabilities and multiple NSFW datasets'
        },
        'friedrichor/stable-diffusion-2-1-realistic': {
            name: 'SD 2.1 Realistic',
            description: 'Enhanced realism and photographic quality with PhotoChat_120_square_HQ dataset',
            maxResolution: 768,
            inferenceAPI: true,
            datasets: [
                'friedrichor/PhotoChat_120_square_HQ'
            ],
            datasetInfo: 'Trained on high-quality photorealistic images from PhotoChat_120_square_HQ'
        },
        'stabilityai/stable-diffusion-xl-base-1.0': {
            name: 'SD XL 1.0',
            description: 'Latest flagship model with superior quality and complete NSFW datasets',
            maxResolution: 1024,
            inferenceAPI: true,
            datasets: [
                'stabilityai/sd-xl',
                'x1101/nsfw-full',
                'amaye15/NSFW'
            ],
            safetyCheckers: false,
            contentWarning: false,
            datasetInfo: 'Enhanced with high-quality base model and multiple NSFW datasets'
        },
        'runwayml/stable-diffusion-v1-5': {
            name: 'Stable Diffusion 1.5',
            description: 'Classic SD 1.5 model enhanced with complete NSFW datasets',
            maxResolution: 512,
            inferenceAPI: true,
            datasets: [
                'runwayml/sd-1-5',
                'x1101/nsfw-full',
                'amaye15/NSFW'
            ],
            safetyCheckers: false,
            contentWarning: false,
            datasetInfo: 'Classic model enhanced with multiple NSFW capabilities'
        }
    },
    STYLES: {
        none: {
            name: 'None',
            prompt: ''
        },
        realistic: {
            name: 'Realistic',
            prompt: 'highly detailed, realistic, 8k uhd, high quality'
        },
        artistic: {
            name: 'Artistic',
            prompt: 'artistic style, creative, expressive, vibrant colors'
        },
        cinematic: {
            name: 'Cinematic',
            prompt: 'cinematic lighting, dramatic atmosphere, movie scene'
        },
        anime: {
            name: 'Anime',
            prompt: 'anime style, manga, detailed, vibrant'
        },
        minimalist: {
            name: 'Minimalist',
            prompt: 'minimalist style, simple, clean, elegant design'
        },
        comic: {
            name: 'Comic',
            prompt: 'comic book style, bold lines, vibrant colors, action scene'
        }
    },
    DEFAULT_OPTIONS: {
        negative_prompt: 'ugly, deformed, noisy, blurry, distorted, grainy, duplicate, watermark, signature, text',
        num_inference_steps: 30,
        guidance_scale: 7.5,
        width: 768,
        height: 768,
        num_images_per_prompt: 1,
        safety_checker: false,
        seed: -1
    },
    ERROR_MESSAGES: {
        NO_TOKEN: 'API token not available. Please enter your Hugging Face token.',
        INVALID_TOKEN: 'Invalid API token. Please check your Hugging Face token.',
        NO_PROMPT: 'Please enter a prompt to generate an image.',
        GENERATION_FAILED: 'Image generation failed. Please try again.',
        NETWORK_ERROR: 'Network error. Please check your connection.',
        SERVER_ERROR: 'Server error. Please try again later.',
        INVALID_RESPONSE: 'Invalid response from server.',
        MODEL_ERROR: 'Error with selected model. Please try another model.'
    }
};

let activeGenerations = 0;
let apiToken = null;
let requestCount = 0;
let lastRequestTime = 0;

// Core API functions
async function fetchApiToken() {
    try {
        const response = await fetch('/api/token');
        if (!response.ok) throw new Error(CONFIG.ERROR_MESSAGES.NETWORK_ERROR);
        
        const data = await response.json();
        if (data.error) {
            console.error('Token error:', data.error);
            throw new Error(data.error);
        }
        
        if (!data.token || data.status !== 'valid') {
            throw new Error(CONFIG.ERROR_MESSAGES.INVALID_TOKEN);
        }
        
        apiToken = data.token;
        return apiToken;
    } catch (error) {
        console.error('Error fetching token:', error);
        throw new Error(CONFIG.ERROR_MESSAGES.NO_TOKEN);
    }
}

// Queue system for API requests
class RequestQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.lastRequestTime = 0;
        this.minDelay = 20000; // 20 seconds between requests
    }

    async add(requestFn) {
        return new Promise((resolve, reject) => {
            this.queue.push({ requestFn, resolve, reject });
            this.process();
        });
    }

    async process() {
        if (this.processing || this.queue.length === 0) return;
        this.processing = true;

        const { requestFn, resolve, reject } = this.queue.shift();
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        // If less than minDelay has passed, wait for the remaining time
        if (timeSinceLastRequest < this.minDelay) {
            const waitTime = this.minDelay - timeSinceLastRequest;
            console.log(`Waiting ${waitTime/1000} seconds before next request...`);
            await new Promise(r => setTimeout(r, waitTime));
        }

        try {
            const result = await requestFn();
            this.lastRequestTime = Date.now();
            resolve(result);
        } catch (error) {
            reject(error);
        } finally {
            this.processing = false;
            // Process next request if any
            setTimeout(() => this.process(), 0);
        }
    }
}

const requestQueue = new RequestQueue();

async function generateImage(data, apiKey, modelId, style = 'none') {
    if (!apiKey && !apiToken) {
        try {
            await fetchApiToken();
        } catch (error) {
            throw new Error(CONFIG.ERROR_MESSAGES.NO_TOKEN);
        }
    }
    
    const token = apiKey || apiToken;
    if (!token) throw new Error(CONFIG.ERROR_MESSAGES.NO_TOKEN);
    if (!data.inputs) throw new Error(CONFIG.ERROR_MESSAGES.NO_PROMPT);
    
    const model = CONFIG.MODELS[modelId];
    if (!model) throw new Error(CONFIG.ERROR_MESSAGES.MODEL_ERROR);
    
    // Apply style enhancement if selected
    if (style && style !== 'none' && CONFIG.STYLES[style]) {
        data.inputs = `${data.inputs}, ${CONFIG.STYLES[style].prompt}`;
    }
    
    // Ensure dimensions don't exceed model's maximum
    data.width = Math.min(data.width || 768, model.maxResolution);
    data.height = Math.min(data.height || 768, model.maxResolution);
    
    try {
        console.log('Sending request to server for model:', modelId);
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelId,
                inputs: data.inputs,
                parameters: {
                    negative_prompt: data.negative_prompt,
                    num_inference_steps: data.num_inference_steps,
                    guidance_scale: data.guidance_scale,
                    width: data.width,
                    height: data.height,
                    num_images_per_prompt: data.num_images_per_prompt,
                }
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Server Error:', errorData);
            throw new Error(errorData.error || `Server error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        if (blob.size < 1000) {
            console.error('Invalid response size:', blob.size);
            throw new Error(CONFIG.ERROR_MESSAGES.GENERATION_FAILED);
        }
        
        return blob;
    } catch (error) {
        console.error('Generation Error:', error);
        throw new Error(`🚫 ${error.message || CONFIG.ERROR_MESSAGES.GENERATION_FAILED}`);
    }
}

async function handleGenerate() {
    const prompt = document.getElementById('prompt').value.trim();
    const negativePrompt = document.getElementById('negative_prompt').value.trim();
    const model = document.getElementById('model').value;
    const style = document.getElementById('style').value;
    const generateBtn = document.querySelector('.generate-btn');

    if (!prompt) {
        showError("✍️ Please enter a prompt first");
        return;
    }

    try {
        generateBtn.disabled = true;
        generateBtn.textContent = "Please wait... ⌛";
        
        console.log('Starting generation with prompt:', prompt);
        const data = {
            inputs: prompt,
            ...CONFIG.DEFAULT_OPTIONS,
            negative_prompt: negativePrompt || CONFIG.DEFAULT_OPTIONS.negative_prompt
        };
        
        const blob = await generateImage(data, null, model, style);
        console.log('Generation successful, creating image card');
        
        const imageCard = createImageCard(blob, activeGenerations++);
        document.getElementById('image-grid').insertBefore(imageCard, document.getElementById('image-grid').firstChild);
        generateBtn.textContent = "Generate Image ✨";
    } catch (error) {
        console.error('Generation failed:', error);
        showError(error.message);
        generateBtn.textContent = "Generate Image ✨";
    } finally {
        generateBtn.disabled = false;
    }
}

// Rate limiting functions
function checkRateLimit() {
    const now = Date.now();
    if (now - lastRequestTime >= CONFIG.RATE_LIMIT.COOLDOWN_MS) {
        requestCount = 0;
        lastRequestTime = now;
        return true;
    }
    
    if (requestCount >= CONFIG.RATE_LIMIT.MAX_REQUESTS) {
        const waitTime = Math.ceil((CONFIG.RATE_LIMIT.COOLDOWN_MS - (now - lastRequestTime)) / 1000);
        throw new Error(`${CONFIG.RATE_LIMIT.ERROR_MESSAGE} (${waitTime}s remaining)`);
    }
    
    return true;
}

function updateRateLimit() {
    requestCount++;
    if (requestCount === 1) {
        lastRequestTime = Date.now();
    }
}

// UI Components
function createImageCard(blob, index) {
    const card = document.createElement('div');
    card.className = 'image-card';
    
    const img = document.createElement('img');
    img.src = URL.createObjectURL(blob);
    img.alt = `Generated Image ${index + 1}`;
    
    const hint = document.createElement('div');
    hint.className = 'view-hint';
    hint.textContent = '🔍 View';
    
    card.onclick = () => showModal(img.src);
    
    card.append(img, hint);
    return card;
}

// Modal functionality
function showModal(imgSrc) {
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modalImg');
    
    modalImg.src = imgSrc;
    modal.classList.add('active');
    
    document.addEventListener('keydown', closeOnEscape);
}

function hideModal() {
    const modal = document.getElementById('modal');
    const modalImg = document.getElementById('modalImg');
    
    modal.classList.remove('active');
    modalImg.src = '';
    
    document.removeEventListener('keydown', closeOnEscape);
}

function closeOnEscape(e) {
    if (e.key === 'Escape') hideModal();
}

// Initialize modal
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('closeBtn');
    
    modal.onclick = (e) => {
        if (e.target === modal) hideModal();
    };
    
    closeBtn.onclick = hideModal;
});

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    setupUI();
    setupEventListeners();
    
    // Initialize model info for default selection
    const defaultModel = document.getElementById('model');
    if (defaultModel) {
        updateModelInfo(defaultModel.value);
    }
    
    // Initialize modal with proper error handling
    const modal = document.getElementById('modal');
    const closeBtn = document.getElementById('closeBtn');
    
    if (modal && closeBtn) {
        modal.onclick = (e) => {
            if (e.target === modal) hideModal();
        };
        closeBtn.onclick = hideModal;
    }
});

function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const generateBtn = document.querySelector('.generate-btn');
            if (generateBtn && !generateBtn.disabled) {
                generateBtn.click();
            }
        }
    });
}

function setupUI() {
    const root = document.getElementById('root');
    root.innerHTML = `
        <div class="generation-form">
            <div id="error-container" class="error-container"></div>
            
            <div class="form-group">
                <label for="prompt">Prompt</label>
                <input type="text" id="prompt" class="styled-input" placeholder="Enter your prompt here..." />
            </div>
            
            <div class="form-group">
                <label for="negative_prompt">Negative Prompt (Optional)</label>
                <input type="text" id="negative_prompt" class="styled-input" placeholder="What you don't want to see..." />
            </div>
            
            <div class="form-group">
                <label for="model">Model</label>
                <div class="model-select">
                    <select id="model" class="styled-input styled-select" onchange="updateModelInfo(this.value)">
                        <option value="stabilityai/stable-diffusion-3.5-large-turbo">SD 3.5 Turbo (1024×1024)</option>
                        <option value="friedrichor/stable-diffusion-2-1-realistic">SD 2.1 Realistic (768×768)</option>
                        <option value="stabilityai/stable-diffusion-xl-base-1.0">Stable Diffusion XL (1024×1024)</option>
                        <option value="runwayml/stable-diffusion-v1-5">Stable Diffusion 1.5 (512×512)</option>
                    </select>
                </div>
                <div id="modelInfo" class="model-info">
                    <div class="model-description">Latest fast turbo model with excellent quality and complete NSFW datasets</div>
                    <div>
                        <span class="model-api-status">✓ API Available</span>
                        <span style="margin-left: 0.5rem">Max Resolution: 1024x1024</span>
                    </div>
                </div>
            </div>
            
            <div class="form-group">
                <label for="style">Style Enhancement</label>
                <select id="style" class="styled-input styled-select">
                    <option value="none">None</option>
                    <option value="realistic">Photorealistic</option>
                    <option value="artistic">Artistic</option>
                    <option value="cinematic">Cinematic</option>
                    <option value="anime">Anime</option>
                    <option value="minimalist">Minimalist</option>
                    <option value="comic">Comic</option>
                </select>
            </div>
            
            <button id="generateBtn" class="generate-btn" onclick="handleGenerate()">
                ${CONFIG.EMOTES.magic} Generate Image
            </button>
        </div>
        
        <div class="image-grid" id="image-grid"></div>
        
        <div id="modal" class="modal">
            <img id="modalImg" class="modal-image" />
            <button id="closeBtn" class="close-btn">×</button>
        </div>
    `;
}

function showError(message) {
    const errorContainer = document.getElementById('error-container');
    if (!errorContainer) {
        console.error('Error container not found');
        return;
    }
    
    errorContainer.textContent = message;
    errorContainer.style.opacity = '1';
    errorContainer.style.display = 'block';
    
    setTimeout(() => {
        errorContainer.style.opacity = '0';
        setTimeout(() => {
            errorContainer.style.display = 'none';
            errorContainer.textContent = '';
        }, 300);
    }, 3000);
}

// Model info update function
function updateModelInfo(modelId) {
    const model = CONFIG.MODELS[modelId];
    if (!model) return;
    
    const modelInfo = document.getElementById('modelInfo');
    if (!modelInfo) return;
    
    modelInfo.innerHTML = `
        <div class="model-description">${model.description}</div>
        <div>
            <span class="model-api-status">${model.inferenceAPI ? '✓ API Available' : '⚠️ API Limited'}</span>
            <span style="margin-left: 0.5rem">Max Resolution: ${model.maxResolution}x${model.maxResolution}</span>
        </div>
    `;
}
