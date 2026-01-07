const container = document.getElementById('container');
const dotsContainer = document.getElementById('dots');
const dots = [];

const isMobile = window.innerWidth < 768;
const dotSpacing = isMobile ? 50 : 40;
const cols = Math.ceil(window.innerWidth / dotSpacing);
const rows = Math.ceil(window.innerHeight / dotSpacing);

const offsetX = (window.innerWidth - (cols - 1) * dotSpacing) / 2;
const offsetY = (window.innerHeight - (rows - 1) * dotSpacing) / 2;

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        
        const x = col * dotSpacing + offsetX;
        const y = row * dotSpacing + offsetY;
        
        dot.style.left = x + 'px';
        dot.style.top = y + 'px';
        
        dotsContainer.appendChild(dot);
        dots.push({ element: dot, x, y });
    }
}

let mouseX = 0;
let mouseY = 0;
let currentX = 0;
let currentY = 0;
let currentMouseX = window.innerWidth / 2;
let currentMouseY = window.innerHeight / 2;
const speed = 0.1;

const waves = [];
const waveSpeed = 600;      // 波が広がる速度 [px/s] default 300
const waveDuration = 1500;  // 波の持続時間   [ms]   default 1500
const waveMaxRadius = 400;  // 波の最大半径          default 400

function handleMouseMove(e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
    currentMouseX = e.clientX;
    currentMouseY = e.clientY;

    // [Push Memo]: クリック時に波を生成するように変更したため、mousemoveでは波を生成しない
    // const now = Date.now();
    // if (waves.length === 0 || now - waves[waves.length - 1].startTime > 200) {
    //     createWave(e.clientX, e.clientY);
    // }
}

function handleTouchMove(e) {
    if (e.touches.length > 0) {
        const touch = e.touches[0];
        mouseX = (touch.clientX / window.innerWidth - 0.5) * 20;
        mouseY = (touch.clientY / window.innerHeight - 0.5) * 20;
        currentMouseX = touch.clientX;
        currentMouseY = touch.clientY;
        
        const now = Date.now();
        if (waves.length === 0 || now - waves[waves.length - 1].startTime > 200) {
            createWave(touch.clientX, touch.clientY);
        }
    }
}

function createWave(x, y) {
    waves.push({
        x: x,
        y: y,
        startTime: Date.now(),
        radius: 0
    });
}

function updateDotSizes() {
    const now = Date.now();
    
    while (waves.length > 0 && now - waves[0].startTime > waveDuration) {
        waves.shift();
    }
    
    dots.forEach(dot => {
        let totalScale = 1;
        
        const dx = currentMouseX - dot.x;
        const dy = currentMouseY - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;
        const influence = Math.max(0, 1 - distance / maxDistance);
        const mouseScale = 1 + influence * 1;
        
        let waveScale = 0;
        waves.forEach(wave => {
            const elapsed = now - wave.startTime;
            const progress = elapsed / waveDuration;
            
            const currentRadius = (elapsed / 1000) * waveSpeed;
            
            const wdx = dot.x - wave.x;
            const wdy = dot.y - wave.y;
            const waveDistance = Math.sqrt(wdx * wdx + wdy * wdy);
            
            const waveThickness = 30;
            const distanceFromWave = Math.abs(waveDistance - currentRadius);
            
            if (distanceFromWave < waveThickness) {
                const intensity = 1 - progress;
                const edgeFactor = 1 - (distanceFromWave / waveThickness);
                // [Memo] 波のスケール効果のパラメータ 
                waveScale = Math.max(waveScale, intensity * edgeFactor * 5);
            }
        });
        
        totalScale = mouseScale + waveScale;
        dot.element.style.transform = `scale(${totalScale})`;
    });
}

function animate() {
    currentX += (mouseX - currentX) * speed;
    currentY += (mouseY - currentY) * speed;
    
    container.style.transform = `translate(${currentX}px, ${currentY}px)`;
    
    updateDotSizes();
    
    requestAnimationFrame(animate);
}

document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('touchmove', handleTouchMove, { passive: true });

document.addEventListener('click', (e) => {
    createWave(e.clientX, e.clientY);
});

animate();

// [Memo] 機種変更時にレイアウトを調整
// [Memo] Default: 100ms
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // [Tip] 一時的に動作を停止します
        // location.reload();
    }, 100);

});
