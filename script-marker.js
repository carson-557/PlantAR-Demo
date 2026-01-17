/**
 * PlantAR - Hiro Marker 版逻辑脚本
 * 使用预定义的 Hiro 标记进行 AR 识别
 */

// ==================== 植物数据 ====================
const plantData = {
    title: "滴水观音",
    englishName: "Alocasia macrorrhizos",
    category: "多年生草本",
    description: "滴水观音又称海芋、象耳芋，是天南星科海芋属植物。因其叶片巨大如象耳，且在湿度大时叶尖会滴水而得名。是常见的室内观叶植物，但全株有毒，需小心养护。",
    specs: {
        family: "天南星科",
        origin: "亚洲热带",
        feature: "叶大如伞"
    },
    funFact: "滴水观音在空气湿度高时，叶尖会凝结水珠滴落，这是植物的\"吐水现象\"！"
};

// ==================== DOM 元素 ====================
const plantMarker = document.getElementById("plantMarker");
const plantModel = document.getElementById("plantModel");
const infoPanel = document.getElementById("infoPanel");
const floatingInfo = document.getElementById("floatingInfo");
const scanHint = document.getElementById("scanHint");
const infoButton = document.querySelector(".info-icon");
const scaleButton = document.querySelector(".scale-icon");
const closeButton = document.querySelector(".close-wrapper");

let currentScale = 0.3;
let isMarkerVisible = false;

// ==================== 初始化 ====================
console.log("🌿 PlantAR Hiro Marker 版本启动");

// 隐藏面板初始状态
if (infoPanel) infoPanel.style.display = "none";

// ==================== Marker 事件 ====================
if (plantMarker) {
    plantMarker.addEventListener("markerFound", () => {
        console.log("✅ 识别到植物标记！显示植物模型");
        isMarkerVisible = true;

        // 隐藏扫描提示
        if (scanHint) scanHint.style.display = "none";

        // 显示浮动 UI
        if (floatingInfo) floatingInfo.style.display = "flex";

        // 重置动画，确保从头播放
        if (plantModel) {
            // 获取动画混合器组件
            const mixer = plantModel.components['animation-mixer'];
            if (mixer && mixer.mixer) {
                // 重置所有动画到开始位置并播放
                mixer.mixer.stopAllAction();
                const clips = mixer.mixer._actions;
                if (clips && clips.length > 0) {
                    clips.forEach(action => {
                        action.reset();
                        action.play();
                    });
                }
            }
        }
    });

    plantMarker.addEventListener("markerLost", () => {
        console.log("❌ 植物标记丢失");
        isMarkerVisible = false;

        // 显示扫描提示
        if (scanHint) scanHint.style.display = "block";

        // 隐藏浮动 UI
        if (floatingInfo) floatingInfo.style.display = "none";

        // 隐藏详细面板
        if (infoPanel) {
            infoPanel.classList.remove("visible");
            infoPanel.style.display = "none";
        }
    });
}

// ==================== 按钮事件 ====================
if (infoButton) {
    infoButton.addEventListener("click", () => {
        if (!isMarkerVisible) {
            console.log("⚠️ 请先扫描 Hiro 标记");
            return;
        }

        if (infoPanel.style.display === "none" || !infoPanel.style.display) {
            infoPanel.style.display = "block";
            setTimeout(() => infoPanel.classList.add("visible"), 10);
        } else {
            infoPanel.classList.remove("visible");
            setTimeout(() => infoPanel.style.display = "none", 300);
        }
    });
}

if (closeButton) {
    closeButton.addEventListener("click", () => {
        if (infoPanel) {
            infoPanel.classList.remove("visible");
            setTimeout(() => infoPanel.style.display = "none", 300);
        }
    });
}

if (scaleButton) {
    scaleButton.addEventListener("click", () => {
        if (!plantModel || !isMarkerVisible) return;

        // 循环切换缩放: 0.3 -> 0.5 -> 0.2 -> 0.3
        if (currentScale === 0.3) {
            currentScale = 0.5;
        } else if (currentScale === 0.5) {
            currentScale = 0.2;
        } else {
            currentScale = 0.3;
        }

        plantModel.setAttribute("scale", `${currentScale} ${currentScale} ${currentScale}`);

        // 更新图标
        const icon = scaleButton.querySelector("i");
        if (icon) {
            icon.className = currentScale > 0.05 ? "fa-solid fa-compress" : "fa-solid fa-expand";
        }

        console.log(`📐 模型缩放: ${currentScale}`);
    });
}

// ==================== 场景加载事件 ====================
const scene = document.querySelector("a-scene");
if (scene) {
    scene.addEventListener("loaded", () => {
        console.log("✅ A-Frame 场景加载完成");

        // 隐藏 loading
        const loader = document.querySelector(".arjs-loader");
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = "0";
                setTimeout(() => {
                    loader.style.display = "none";
                }, 500);
            }, 1000);
        }
    });
}

console.log("📱 提示: 请扫描植物标记以显示植物模型");
console.log("👆 单指滑动旋转模型，双指捏合缩放模型");

// ==================== 手势控制 ====================
// 旋转相关变量
let currentRotationY = 0;
let currentRotationX = -90; // 初始 X 旋转（模型默认朝向）
let touchStartX = 0;
let touchStartY = 0;
let isTouching = false;

// 缩放相关变量
let initialPinchDistance = 0;
let isPinching = false;
let baseScale = 0.3;

/**
 * 计算两点之间的距离（用于双指缩放）
 */
function getPinchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 应用旋转到模型
 */
function applyRotation() {
    if (plantModel && isMarkerVisible) {
        plantModel.setAttribute("rotation", `${currentRotationX} ${currentRotationY} 0`);
    }
}

/**
 * 应用缩放到模型
 */
function applyScale(scale) {
    if (plantModel && isMarkerVisible) {
        currentScale = Math.max(0.1, Math.min(1.0, scale)); // 限制缩放范围
        plantModel.setAttribute("scale", `${currentScale} ${currentScale} ${currentScale}`);
    }
}

// ==================== 触摸事件监听 ====================

document.addEventListener("touchstart", (e) => {
    if (!isMarkerVisible) return;

    if (e.touches.length === 1) {
        // 单指 - 准备旋转
        isTouching = true;
        isPinching = false;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        // 双指 - 准备缩放
        isPinching = true;
        isTouching = false;
        initialPinchDistance = getPinchDistance(e.touches);
        baseScale = currentScale;
    }
}, { passive: true });

document.addEventListener("touchmove", (e) => {
    if (!isMarkerVisible) return;

    if (isTouching && e.touches.length === 1) {
        // 单指滑动 - 旋转模型
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;

        // 水平滑动控制 Y 轴旋转
        currentRotationY += deltaX * 0.5;

        // 垂直滑动控制 X 轴旋转（限制范围避免翻转）
        currentRotationX = Math.max(-150, Math.min(-30, currentRotationX + deltaY * 0.3));

        applyRotation();

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    } else if (isPinching && e.touches.length === 2) {
        // 双指捏合 - 缩放模型
        const currentPinchDistance = getPinchDistance(e.touches);
        const scaleFactor = currentPinchDistance / initialPinchDistance;
        const newScale = baseScale * scaleFactor;

        applyScale(newScale);
    }
}, { passive: true });

document.addEventListener("touchend", (e) => {
    if (e.touches.length === 0) {
        isTouching = false;
        isPinching = false;
    } else if (e.touches.length === 1) {
        // 从双指变为单指
        isPinching = false;
        isTouching = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
}, { passive: true });

// ==================== 鼠标控制（电脑端） ====================
let isMouseDown = false;
let mouseStartX = 0;
let mouseStartY = 0;

document.addEventListener("mousedown", (e) => {
    if (!isMarkerVisible) return;
    isMouseDown = true;
    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
});

document.addEventListener("mousemove", (e) => {
    if (!isMarkerVisible || !isMouseDown) return;

    const deltaX = e.clientX - mouseStartX;
    const deltaY = e.clientY - mouseStartY;

    currentRotationY += deltaX * 0.5;
    currentRotationX = Math.max(-150, Math.min(-30, currentRotationX + deltaY * 0.3));

    applyRotation();

    mouseStartX = e.clientX;
    mouseStartY = e.clientY;
});

document.addEventListener("mouseup", () => {
    isMouseDown = false;
});

// 鼠标滚轮缩放
document.addEventListener("wheel", (e) => {
    if (!isMarkerVisible) return;

    const scaleDelta = e.deltaY > 0 ? -0.05 : 0.05;
    applyScale(currentScale + scaleDelta);
}, { passive: true });

console.log("✅ 手势控制已启用");
