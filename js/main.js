document.addEventListener('DOMContentLoaded', () => {
    // Screen elements
    const introScreen = document.getElementById('intro-screen');
    const mainScreen = document.getElementById('main-screen');
    const universeScreen = document.getElementById('universe-screen');
    const messageScreen = document.getElementById('message-screen');
    const finalScreen = document.getElementById('final-screen');

    // Intro screen elements
    const keyIcon = document.getElementById('key-icon');
    const lockedHeart = document.getElementById('locked-heart');

    // Button elements
    const okButton = document.getElementById('ok-button');

    // Universe elements
    const universeContainer = document.getElementById('universe-container');
    const spaceElements = document.getElementById('space-elements');
    const heartUniverse = document.getElementById('heart-universe');
    
    let isDragging = false;
    let offsetX, offsetY;
    let isUnlocked = false;

    // --- Drag and Drop Logic ---

    const startDrag = (e) => {
        if (isUnlocked) return;
        isDragging = true;

        keyIcon.style.position = 'absolute';
        keyIcon.style.cursor = 'grabbing';
        
        // Use pageX/pageY for consistency across browsers and devices
        const clientX = e.clientX || e.touches[0].pageX;
        const clientY = e.clientY || e.touches[0].pageY;

        const rect = keyIcon.getBoundingClientRect();
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        // Add listeners to the whole document to allow dragging outside the initial element
        document.addEventListener('mousemove', dragKey);
        document.addEventListener('touchmove', dragKey, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    };

    const dragKey = (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent scrolling on touch devices

        const clientX = e.clientX || e.touches[0].pageX;
        const clientY = e.clientY || e.touches[0].pageY;

        keyIcon.style.left = `${clientX - offsetX}px`;
        keyIcon.style.top = `${clientY - offsetY}px`;

        checkCollision();
    };

    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        keyIcon.style.cursor = 'grab';

        // Reset position if not unlocked
        if (!isUnlocked) {
            keyIcon.style.position = 'relative';
            keyIcon.style.left = 'auto';
            keyIcon.style.top = 'auto';
        }
        
        document.removeEventListener('mousemove', dragKey);
        document.removeEventListener('touchmove', dragKey);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
    };

    const checkCollision = () => {
        const keyRect = keyIcon.getBoundingClientRect();
        const heartRect = lockedHeart.getBoundingClientRect();

        const isColliding = !(
            keyRect.right < heartRect.left ||
            keyRect.left > heartRect.right ||
            keyRect.bottom < heartRect.top ||
            keyRect.top > heartRect.bottom
        );

        if (isColliding) {
            unlockHeart();
        }
    };

    const unlockHeart = () => {
        if (isUnlocked) return;
        isUnlocked = true;
        isDragging = false; // Stop dragging logic

        lockedHeart.classList.add('unlocked');
        
        keyIcon.style.transition = 'opacity 0.5s, transform 0.5s';
        keyIcon.style.opacity = '0';
        keyIcon.style.transform = 'scale(0)';

        // Transition to next screen after animation
        setTimeout(() => {
            introScreen.classList.remove('active');
            mainScreen.classList.add('active');
        }, 1500); // Wait for heart unlock animation
    };

    keyIcon.addEventListener('mousedown', startDrag);
    keyIcon.addEventListener('touchstart', startDrag, { passive: false });


    // --- Screen Navigation ---
    
    okButton.addEventListener('click', () => {
        mainScreen.classList.remove('active');
        universeScreen.classList.add('active');
        initUniverse();
    });
    
    // --- Universe Logic ---

    const initUniverse = () => {
        let scale = 1;
        let panX = 0;
        let panY = 0;
        let isPanning = false;
        let lastPanX, lastPanY;
        let lastTouchDistance = 0;
        let heartRevealed = false;

        // Clear previous elements if any
        spaceElements.innerHTML = '';
        
        // Create stars
        for (let i = 0; i < 200; i++) {
            const element = document.createElement('div');
            element.className = 'space-element star';
            const size = Math.random() * 3 + 1;
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.left = `${Math.random() * 200 - 50}%`;
            element.style.top = `${Math.random() * 200 - 50}%`;
            spaceElements.appendChild(element);
        }

        const updateTransform = () => {
            spaceElements.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        };

        const startPan = (e) => {
            isPanning = true;
            universeContainer.style.cursor = 'grabbing';
            lastPanX = e.clientX || e.touches[0].clientX;
            lastPanY = e.clientY || e.touches[0].clientY;
        };

        const movePan = (e) => {
            if (!isPanning) return;
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            panX += clientX - lastPanX;
            panY += clientY - lastPanY;
            lastPanX = clientX;
            lastPanY = clientY;
            updateTransform();
        };

        const stopPan = () => {
            isPanning = false;
            universeContainer.style.cursor = 'grab';
        };

        const handleZoom = (e) => {
            e.preventDefault();
            scale += e.deltaY * -0.001;
            scale = Math.min(Math.max(0.1, scale), 3);
            updateTransform();
            if (scale < 0.25 && !heartRevealed) {
                revealHeart();
            }
        };

        const getTouchDistance = (touches) => {
            const dx = touches[0].clientX - touches[1].clientX;
            const dy = touches[0].clientY - touches[1].clientY;
            return Math.sqrt(dx * dx + dy * dy);
        };

        const touchStart = (e) => {
            if (e.touches.length === 1) {
                startPan(e);
            } else if (e.touches.length === 2) {
                isPanning = false;
                lastTouchDistance = getTouchDistance(e.touches);
            }
        };

        const touchMove = (e) => {
            e.preventDefault();
            if (e.touches.length === 1 && isPanning) {
                movePan(e);
            } else if (e.touches.length === 2) {
                const currentDistance = getTouchDistance(e.touches);
                const scaleChange = currentDistance / lastTouchDistance;
                scale *= scaleChange;
                scale = Math.min(Math.max(0.1, scale), 3);
                updateTransform();
                lastTouchDistance = currentDistance;
                if (scale < 0.25 && !heartRevealed) {
                    revealHeart();
                }
            }
        };

        const revealHeart = () => {
            heartRevealed = true;
            heartUniverse.classList.add('visible');
            
            setTimeout(() => {
                universeScreen.classList.remove('active');
                messageScreen.classList.add('active');
                
                setTimeout(() => {
                    messageScreen.classList.remove('active');
                    finalScreen.classList.add('active');
                    document.getElementById('message-text').textContent = "Seni seviyorum Rüya";
                }, 4000);

            }, 3000);
        };

        // Add universe event listeners
        universeContainer.addEventListener('mousedown', startPan);
        universeContainer.addEventListener('mousemove', movePan);
        universeContainer.addEventListener('mouseup', stopPan);
        universeContainer.addEventListener('mouseleave', stopPan);
        universeContainer.addEventListener('wheel', handleZoom);
        universeContainer.addEventListener('touchstart', touchStart, { passive: false });
        universeContainer.addEventListener('touchmove', touchMove, { passive: false });
        universeContainer.addEventListener('touchend', stopPan);
    };
});
