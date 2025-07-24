document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const introScreen = document.getElementById('intro-screen');
    const mainScreen = document.getElementById('main-screen');
    const universeScreen = document.getElementById('universe-screen');
    const messageScreen = document.getElementById('message-screen');
    const finalScreen = document.getElementById('final-screen');

    const keyIcon = document.getElementById('key-icon');
    const lockedHeart = document.getElementById('locked-heart');
    const instructionText = document.querySelector('.instruction');
    const okButton = document.getElementById('ok-button');

    const universeContainer = document.getElementById('universe-container');
    const spaceElements = document.getElementById('space-elements');
    const heartUniverse = document.getElementById('heart-universe');
    const messageTextEl = document.getElementById('message-text');
    const finalMessage = document.querySelector('.final-message');

    // --- State ---
    let isKeySelected = false;
    let isUnlocked = false;

    // --- Screen Transition ---
    const transitionScreen = (from, to) => {
        from.classList.remove('active');
        to.classList.add('active');
    };

    // --- Intro Logic ---
    const selectKey = () => {
        if (isUnlocked) return;
        isKeySelected = true;
        keyIcon.classList.add('selected');
        instructionText.textContent = 'Kalbe dokunarak kilidi aç';
    };

    const unlockHeart = () => {
        if (isUnlocked || !isKeySelected) return;
        isUnlocked = true;

        lockedHeart.classList.add('unlocked');
        keyIcon.style.opacity = '0'; // Hide the key
        instructionText.style.opacity = '0'; // Hide the instruction

        setTimeout(() => {
            transitionScreen(introScreen, mainScreen);
        }, 1500); // Wait for unlock animation
    };
    
    // --- Universe Logic ---
    const initUniverse = () => {
        let scale = 1, panX = 0, panY = 0;
        let isPanning = false, lastPanX, lastPanY;
        let lastTouchDistance = 0;
        let heartRevealed = false;
        
        spaceElements.innerHTML = ''; // Clear previous stars
        for (let i = 0; i < 200; i++) {
            const star = document.createElement('div');
            star.className = 'space-element star';
            const size = Math.random() * 3 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 150 - 25}%`;
            star.style.top = `${Math.random() * 150 - 25}%`;
            spaceElements.appendChild(star);
        }

        const updateTransform = () => {
            spaceElements.style.transform = `translate(${panX}px, ${panY}px) scale(${scale})`;
        };

        const startPan = (e) => {
            isPanning = true;
            universeContainer.style.cursor = 'grabbing';
            lastPanX = e.touches ? e.touches[0].clientX : e.clientX;
            lastPanY = e.touches ? e.touches[0].clientY : e.clientY;
        };

        const movePan = (e) => {
            if (!isPanning) return;
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            panX += clientX - lastPanX;
            panY += clientY - lastPanY;
            lastPanX = clientX;
            lastPanY = clientY;
            updateTransform();
        };

        const stopPan = () => { isPanning = false; universeContainer.style.cursor = 'grab'; };

        const handleZoom = (e) => {
            scale += e.deltaY * -0.001;
            scale = Math.min(Math.max(0.1, scale), 2);
            updateTransform();
            if (scale < 0.25 && !heartRevealed) revealHeart();
        };

        const touchStart = (e) => {
            if (e.touches.length === 1) startPan(e);
            else if (e.touches.length === 2) {
                isPanning = false;
                lastTouchDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
            }
        };

        const touchMove = (e) => {
            if (e.touches.length === 1 && isPanning) movePan(e);
            else if (e.touches.length === 2) {
                const currentDistance = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                scale *= currentDistance / lastTouchDistance;
                scale = Math.min(Math.max(0.1, scale), 2);
                updateTransform();
                lastTouchDistance = currentDistance;
                if (scale < 0.25 && !heartRevealed) revealHeart();
            }
        };

        const revealHeart = () => {
            heartRevealed = true;
            heartUniverse.classList.add('visible');
            setTimeout(() => {
                transitionScreen(universeScreen, messageScreen);
                setTimeout(() => {
                    const explosion = document.createElement('div');
                    explosion.className = 'explosion';
                    messageScreen.appendChild(explosion);
                    setTimeout(() => {
                        finalMessage.textContent = 'Seni seviyorum Rüya';
                        transitionScreen(messageScreen, finalScreen);
                        explosion.remove();
                    }, 1000);
                }, 2500);
            }, 2000);
        };

        // Add universe event listeners
        universeContainer.addEventListener('mousedown', startPan);
        universeContainer.addEventListener('mousemove', movePan);
        universeContainer.addEventListener('mouseup', stopPan);
        universeContainer.addEventListener('mouseleave', stopPan);
        universeContainer.addEventListener('wheel', handleZoom, { passive: false });
        universeContainer.addEventListener('touchstart', touchStart, { passive: false });
        universeContainer.addEventListener('touchmove', touchMove, { passive: false });
        universeContainer.addEventListener('touchend', stopPan);
    };

    // --- Initial Event Listeners ---
    keyIcon.addEventListener('click', selectKey);
    lockedHeart.addEventListener('click', unlockHeart);
    okButton.addEventListener('click', () => {
        transitionScreen(mainScreen, universeScreen);
        initUniverse();
    });
});
