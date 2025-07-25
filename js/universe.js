// Universe state
const state = {
    scale: 1,
    targetScale: 1,
    panX: window.innerWidth / 2,
    panY: window.innerHeight / 2,
    targetPanX: window.innerWidth / 2,
    targetPanY: window.innerHeight / 2,
    isPanning: false,
    stars: [],
    heartPieces: [],
    collectedPieces: 0
};

// Canvas setup
let backgroundCanvas, starCanvas, particleCanvas;
let bgCtx, starCtx, particleCtx;

export function initUniverse(container) {
    setupCanvases(container);
    createStars();
    setupEventListeners();
    startAnimation();
}

function setupCanvases(container) {
    // Create canvases
    backgroundCanvas = document.createElement('canvas');
    starCanvas = document.createElement('canvas');
    particleCanvas = document.createElement('canvas');

    // Set classes
    backgroundCanvas.className = 'background-canvas';
    starCanvas.className = 'star-canvas';
    particleCanvas.className = 'particle-canvas';

    // Add to container
    container.insertBefore(backgroundCanvas, container.firstChild);
    container.insertBefore(starCanvas, null);
    container.insertBefore(particleCanvas, null);

    // Get contexts
    bgCtx = backgroundCanvas.getContext('2d');
    starCtx = starCanvas.getContext('2d');
    particleCtx = particleCanvas.getContext('2d');

    // Initial resize
    resizeCanvases();
    window.addEventListener('resize', resizeCanvases);
}

function resizeCanvases() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Resize all canvases
    [backgroundCanvas, starCanvas, particleCanvas].forEach(canvas => {
        canvas.width = width;
        canvas.height = height;
    });

    // Create background gradient
    const gradient = bgCtx.createRadialGradient(
        width/2, height/2, 0,
        width/2, height/2, Math.max(width, height)
    );
    gradient.addColorStop(0, 'rgba(30, 0, 60, 1)');
    gradient.addColorStop(0.5, 'rgba(15, 0, 30, 1)');
    gradient.addColorStop(1, 'rgba(0, 0, 10, 1)');

    bgCtx.fillStyle = gradient;
    bgCtx.fillRect(0, 0, width, height);

    createStars(); // Recreate stars for new size
}

function createStars() {
    state.stars = [];
    const starCount = 1000;
    const centerX = starCanvas.width / 2;
    const centerY = starCanvas.height / 2;

    for(let i = 0; i < starCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * Math.min(starCanvas.width, starCanvas.height) * 0.8;

        state.stars.push({
            x: centerX + Math.cos(angle) * distance,
            y: centerY + Math.sin(angle) * distance,
            size: Math.random() * 2 + 0.5,
            brightness: Math.random() * 0.5 + 0.5,
            blinkSpeed: 0.001 + Math.random() * 0.003,
            blinkOffset: Math.random() * Math.PI * 2,
            color: `hsla(${220 + Math.random() * 40}, 100%, ${70 + Math.random() * 30}%, `
        });
    }
}

function renderStars() {
    starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);

    state.stars.forEach(star => {
        const time = Date.now() * star.blinkSpeed + star.blinkOffset;
        const brightness = star.brightness * (0.7 + Math.sin(time) * 0.3);

        const screenX = (star.x - state.panX) * state.scale + state.panX;
        const screenY = (star.y - state.panY) * state.scale + state.panY;
        const screenSize = star.size * state.scale;

        // Draw star
        starCtx.beginPath();
        starCtx.fillStyle = star.color + brightness + ')';
        starCtx.arc(screenX, screenY, screenSize, 0, Math.PI * 2);
        starCtx.fill();

        // Draw glow
        const gradient = starCtx.createRadialGradient(
            screenX, screenY, 0,
            screenX, screenY, screenSize * 4
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, ' + brightness * 0.2 + ')');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        starCtx.fillStyle = gradient;
        starCtx.beginPath();
        starCtx.arc(screenX, screenY, screenSize * 4, 0, Math.PI * 2);
        starCtx.fill();
    });
}

function setupEventListeners() {
    const container = starCanvas.parentElement;

    const startPan = (e) => {
        state.isPanning = true;
        container.style.cursor = 'grabbing';
        state.startX = e.touches ? e.touches[0].clientX : e.clientX;
        state.startY = e.touches ? e.touches[0].clientY : e.clientY;
        state.lastX = state.panX;
        state.lastY = state.panY;
    };

    const movePan = (e) => {
        if (!state.isPanning) return;
        const currentX = e.touches ? e.touches[0].clientX : e.clientX;
        const currentY = e.touches ? e.touches[0].clientY : e.clientY;

        state.targetPanX = state.lastX + (currentX - state.startX);
        state.targetPanY = state.lastY + (currentY - state.startY);
    };

    const stopPan = () => {
        state.isPanning = false;
        container.style.cursor = 'grab';
    };

    const handleZoom = (e) => {
        e.preventDefault();
        const delta = e.deltaY;
        const oldScale = state.scale;
        state.targetScale *= delta > 0 ? 0.95 : 1.05;
        state.targetScale = Math.min(Math.max(0.3, state.targetScale), 3);

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomPoint = {
            x: (mouseX - state.panX) / oldScale,
            y: (mouseY - state.panY) / oldScale
        };

        state.targetPanX = mouseX - zoomPoint.x * state.targetScale;
        state.targetPanY = mouseY - zoomPoint.y * state.targetScale;
    };

    container.addEventListener('mousedown', startPan);
    container.addEventListener('mousemove', movePan);
    container.addEventListener('mouseup', stopPan);
    container.addEventListener('mouseleave', stopPan);
    container.addEventListener('wheel', handleZoom, { passive: false });
    container.addEventListener('touchstart', startPan, { passive: false });
    container.addEventListener('touchmove', movePan, { passive: false });
    container.addEventListener('touchend', stopPan);
}

function startAnimation() {
    function animate() {
        // Update transforms
        state.scale += (state.targetScale - state.scale) * 0.1;
        state.panX += (state.targetPanX - state.panX) * 0.1;
        state.panY += (state.targetPanY - state.panY) * 0.1;

        // Render stars
        renderStars();

        requestAnimationFrame(animate);
    }

    animate();
}
