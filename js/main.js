document.addEventListener('DOMContentLoaded', () => {
    const key = document.getElementById('key-icon');
    const lockedHeart = document.getElementById('locked-heart');
    const introScreen = document.getElementById('intro-screen');
    const mainScreen = document.getElementById('main-screen');
    const universeScreen = document.getElementById('universe-screen');
    const messageScreen = document.getElementById('message-screen');
    const finalScreen = document.getElementById('final-screen');
    const okButton = document.getElementById('ok-button');
    const universeContainer = document.getElementById('universe-container');
    const spaceElements = document.getElementById('space-elements');

    let isDragging = false;
    let offsetX, offsetY;

    const moveKey = (e) => {
        if (!isDragging) return;
        const x = e.clientX || e.touches[0].clientX;
        const y = e.clientY || e.touches[0].clientY;
        key.style.left = `${x - offsetX}px`;
        key.style.top = `${y - offsetY}px`;
        checkCollision();
    };

    const startDrag = (e) => {
        isDragging = true;
        key.style.position = 'absolute';
        key.style.zIndex = '1000';
        key.style.cursor = 'grabbing';
        const rect = key.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;
        document.addEventListener('mousemove', moveKey);
        document.addEventListener('touchmove', moveKey, { passive: false });
    };

    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        key.style.cursor = 'grab';
        document.removeEventListener('mousemove', moveKey);
        document.removeEventListener('touchmove', moveKey);
    };

    const checkCollision = () => {
        const keyRect = key.getBoundingClientRect();
        const heartRect = lockedHeart.getBoundingClientRect();
        const isColliding = !(keyRect.right < heartRect.left || keyRect.left > heartRect.right || keyRect.bottom < heartRect.top || keyRect.top > heartRect.bottom);
        if (isColliding) {
            unlockHeart();
        }
    };

    const unlockHeart = () => {
        if (lockedHeart.classList.contains('unlocked')) return;
        isDragging = false;
        lockedHeart.classList.add('unlocked');
        key.style.transition = 'opacity 0.5s, transform 0.5s';
        key.style.opacity = '0';
        key.style.transform = 'scale(0)';
        setTimeout(() => {
            introScreen.classList.remove('active');
            mainScreen.classList.add('active');
        }, 1200);
    };

    key.addEventListener('mousedown', startDrag);
    key.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);

    okButton.addEventListener('click', () => {
        mainScreen.classList.remove('active');
        universeScreen.classList.add('active');
        initUniverse();
    });

    const initUniverse = () => {
        let scale = 1;
        let panX = 0;
        let panY = 0;
        let isPanning = false;
        let lastPanX, lastPanY;
        let lastTouchDistance = 0;
        let heartRevealed = false;

        const createSpaceElement = () => {
            const element = document.createElement('div');
            element.className = 'space-element star';
            const size = Math.random() * 3 + 1;
            element.style.width = `${size}px`;
            element.style.height = `${size}px`;
            element.style.left = `${Math.random() * 200 - 50}%`;
            element.style.top = `${Math.random() * 200 - 50}%`;
            spaceElements.appendChild(element);
        };

        for (let i = 0; i < 200; i++) {
            createSpaceElement();
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
            document.getElementById('heart-universe').classList.add('visible');
            setTimeout(() => {
                universeScreen.classList.remove('active');
                messageScreen.classList.add('active');
                setTimeout(() => {
                    const messageText = document.getElementById('message-text');
                    messageText.textContent = "Seni seviyorum Rüya";
                    messageScreen.classList.remove('active');
                    finalScreen.classList.add('active');
                }, 4000);
            }, 3000);
        };

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
