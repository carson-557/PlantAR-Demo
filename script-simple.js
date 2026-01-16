/**
 * PlantAR - 植物识别 AR Demo (简化版)
 * 核心逻辑文件 - 直接显示3D模型 + 摄像头背景，支持手势交互
 */

// ==================== 植物数据库 ====================
const plantDatabase = {
    elephantEar: {
        id: "elephant_ear",
        title: "滴水观音",
        englishName: "Alocasia macrorrhizos",
        category: "多年生草本",
        description:
            "滴水观音又称海芋、象耳芋，是天南星科海芋属植物。因其叶片巨大如象耳，且在湿度大时叶尖会滴水而得名。是常见的室内观叶植物，但全株有毒，需小心养护。",
        specs: {
            family: "天南星科",
            origin: "亚洲热带",
            feature: "叶大如伞",
        },
        funFact: "💡 滴水观音在空气湿度高时，叶尖会凝结水珠滴落，这是植物的\"吐水现象\"！",
        model: "./models/elephant_ear/scene.gltf",
        modelScale: 0.15,
        modelPosition: { x: 0, y: -0.4, z: 0 },
        modelRotation: { x: 0, y: 0, z: 0 },
    },
};

// ==================== DOM 元素引用 ====================
const infoPanel = document.getElementById("infoPanel");
const plantTitle = document.getElementById("plantTitle");
const plantEnglish = document.getElementById("plantEnglish");
const plantCategory = document.getElementById("plantCategory");
const plantDescription = document.getElementById("plantDescription");
const specFamily = document.getElementById("specFamily");
const specOrigin = document.getElementById("specOrigin");
const specFeature = document.getElementById("specFeature");
const funFactText = document.getElementById("funFactText");

const infoButton = document.querySelector(".info-icon");
const rotateButton = document.querySelector(".rotate-icon");
const scaleButton = document.querySelector(".scale-icon");
const closeButton = document.querySelector(".close-wrapper");

const plantModel = document.getElementById("plantModel");
const plantModelPivot = document.getElementById("plantModelPivot");
const touchHint = document.getElementById("touchHint");
const cameraVideo = document.getElementById("cameraVideo");
const arScene = document.getElementById("arScene");

// 浮动信息卡片 DOM 引用
const floatingInfo = document.getElementById("floatingInfo");
const floatTitle = document.getElementById("floatTitle");
const floatEnglish = document.getElementById("floatEnglish");
const floatFamilyValue = document.getElementById("floatFamilyValue");
const floatOriginValue = document.getElementById("floatOriginValue");
const floatCategoryValue = document.getElementById("floatCategoryValue");
const floatFeatureValue = document.getElementById("floatFeatureValue");
const floatFunFactText = document.getElementById("floatFunFactText");

// ==================== 状态管理 ====================
let currentPlant = null;
let currentScale = 1;
let baseScale = 0.15;

// 触摸/拖动旋转状态
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let currentRotationX = 0;
let currentRotationY = 0;

// 双指缩放状态
let initialPinchDistance = 0;
let isPinching = false;

// 自动旋转
let autoRotate = true;
let autoRotateSpeed = 0.3;

// 初始化隐藏面板
infoPanel.style.display = "none";

// ==================== 摄像头初始化 ====================

/**
 * 初始化摄像头背景
 */
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment", // 优先使用后置摄像头
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        cameraVideo.srcObject = stream;

        // 设置场景背景为摄像头视频
        cameraVideo.addEventListener('loadedmetadata', () => {
            // 创建视频纹理作为天空背景
            const sky = document.createElement('a-videosphere');
            sky.setAttribute('src', '#cameraVideo');
            sky.setAttribute('rotation', '0 -90 0');
            arScene.appendChild(sky);
        });

        console.log("✅ 摄像头已启动");
        return true;
    } catch (error) {
        console.warn("❌ 摄像头无法访问:", error);
        // 使用纯色背景作为后备
        const sky = document.createElement('a-sky');
        sky.setAttribute('color', '#1a1a2e');
        arScene.appendChild(sky);
        return false;
    }
}

// ==================== 触摸/鼠标拖动旋转 ====================

/**
 * 开始拖动
 */
function onDragStart(x, y) {
    isDragging = true;
    autoRotate = false; // 停止自动旋转
    previousMouseX = x;
    previousMouseY = y;
    document.body.style.cursor = "grabbing";

    // 隐藏提示
    if (touchHint) {
        touchHint.style.opacity = "0";
    }
}

/**
 * 拖动中
 */
function onDragMove(x, y) {
    if (!isDragging || isPinching) return;

    const deltaX = x - previousMouseX;
    const deltaY = y - previousMouseY;

    // 更新旋转角度
    currentRotationY += deltaX * 0.5;
    currentRotationX -= deltaY * 0.3;

    // 限制 X 轴旋转范围
    currentRotationX = Math.max(-60, Math.min(60, currentRotationX));

    // 应用旋转到模型
    applyRotation();

    previousMouseX = x;
    previousMouseY = y;
}

/**
 * 结束拖动
 */
function onDragEnd() {
    isDragging = false;
    document.body.style.cursor = "grab";
}

/**
 * 应用旋转到模型
 */
function applyRotation() {
    if (plantModel) {
        plantModel.setAttribute("rotation", {
            x: currentRotationX,
            y: currentRotationY,
            z: 0,
        });
    }
}

// ==================== 双指缩放 ====================

/**
 * 计算两点之间的距离
 */
function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 双指缩放开始
 */
function onPinchStart(touch1, touch2) {
    isPinching = true;
    initialPinchDistance = getDistance(touch1, touch2);
}

/**
 * 双指缩放中
 */
function onPinchMove(touch1, touch2) {
    if (!isPinching) return;

    const currentDistance = getDistance(touch1, touch2);
    const scaleFactor = currentDistance / initialPinchDistance;

    // 限制缩放范围
    const newScale = Math.max(0.5, Math.min(3, currentScale * scaleFactor));

    // 应用缩放
    updateModelScale(newScale);

    initialPinchDistance = currentDistance;
    currentScale = newScale;
}

/**
 * 双指缩放结束
 */
function onPinchEnd() {
    isPinching = false;
}

// ==================== 事件绑定 ====================

// 鼠标事件
document.addEventListener("mousedown", (e) => {
    onDragStart(e.clientX, e.clientY);
});

document.addEventListener("mousemove", (e) => {
    onDragMove(e.clientX, e.clientY);
});

document.addEventListener("mouseup", () => {
    onDragEnd();
});

// 鼠标滚轮缩放
document.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    currentScale = Math.max(0.5, Math.min(3, currentScale * delta));
    updateModelScale(currentScale);
}, { passive: false });

// 触摸事件
document.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        onDragStart(touch.clientX, touch.clientY);
    } else if (e.touches.length === 2) {
        onPinchStart(e.touches[0], e.touches[1]);
    }
}, { passive: true });

document.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1 && !isPinching) {
        const touch = e.touches[0];
        onDragMove(touch.clientX, touch.clientY);
    } else if (e.touches.length === 2) {
        onPinchMove(e.touches[0], e.touches[1]);
    }
}, { passive: true });

document.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) {
        onPinchEnd();
    }
    if (e.touches.length === 0) {
        onDragEnd();
    }
});

// ==================== UI 按钮事件 ====================

// 信息按钮 - 显示/隐藏信息面板
infoButton.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentPlant) {
        infoPanel.classList.toggle("visible");
        if (infoPanel.classList.contains("visible")) {
            infoPanel.style.display = "block";
        }
    }
});

// 重置旋转按钮
rotateButton.addEventListener("click", (e) => {
    e.stopPropagation();
    currentRotationX = 0;
    currentRotationY = 0;
    autoRotate = true; // 恢复自动旋转
    applyRotation();

    // 添加反馈动画
    rotateButton.classList.add("pulse");
    setTimeout(() => rotateButton.classList.remove("pulse"), 300);
});

// 缩放按钮 - 切换模型大小
scaleButton.addEventListener("click", (e) => {
    e.stopPropagation();
    currentScale = currentScale === 1 ? 1.5 : currentScale === 1.5 ? 0.7 : 1;
    updateModelScale(currentScale);

    // 更新图标
    const icon = scaleButton.querySelector("i");
    if (currentScale > 1) {
        icon.className = "fa-solid fa-compress";
    } else {
        icon.className = "fa-solid fa-expand";
    }
});

// 关闭按钮 - 隐藏信息面板
closeButton.addEventListener("click", (e) => {
    e.stopPropagation();
    hideInfoPanel();
});

// ==================== 核心功能函数 ====================

/**
 * 更新信息面板内容
 * @param {object} plantData - 植物数据
 */
function updateInfoPanel(plantData) {
    if (plantData) {
        currentPlant = plantData;

        // 更新 UI 内容
        plantTitle.textContent = plantData.title;
        plantEnglish.textContent = plantData.englishName;
        plantCategory.textContent = plantData.category;
        plantDescription.textContent = plantData.description;
        specFamily.textContent = plantData.specs.family;
        specOrigin.textContent = plantData.specs.origin;
        specFeature.textContent = plantData.specs.feature;
        funFactText.textContent = plantData.funFact;
    }
}

/**
 * 更新浮动信息卡片内容
 * @param {object} plantData - 植物数据
 */
function updateFloatingInfo(plantData) {
    if (plantData) {
        // 更新浮动卡片内容
        if (floatTitle) floatTitle.textContent = plantData.title;
        if (floatEnglish) floatEnglish.textContent = plantData.englishName;
        if (floatFamilyValue) floatFamilyValue.textContent = plantData.specs.family;
        if (floatOriginValue) floatOriginValue.textContent = plantData.specs.origin;
        if (floatCategoryValue) floatCategoryValue.textContent = plantData.category;
        if (floatFeatureValue) floatFeatureValue.textContent = plantData.specs.feature;
        if (floatFunFactText) floatFunFactText.textContent = plantData.funFact.replace('💡 ', '');

        // 显示浮动信息
        if (floatingInfo) {
            floatingInfo.style.display = 'block';
        }
    }
}

/**
 * 隐藏信息面板
 */
function hideInfoPanel() {
    infoPanel.classList.remove("visible");
    setTimeout(() => {
        if (!infoPanel.classList.contains("visible")) {
            infoPanel.style.display = "none";
        }
    }, 300);
}

/**
 * 加载并显示 3D 模型
 * @param {object} plantData - 植物数据
 */
function showPlantModel(plantData) {
    if (plantData && plantData.model) {
        // 重置状态
        currentRotationX = 0;
        currentRotationY = 0;
        currentScale = 1;
        baseScale = plantData.modelScale;

        // 设置模型属性
        plantModel.setAttribute("gltf-model", plantData.model);
        plantModel.setAttribute("scale", `${baseScale} ${baseScale} ${baseScale}`);
        plantModel.setAttribute("position", plantData.modelPosition);
        plantModel.setAttribute("rotation", plantData.modelRotation);

        // 显示触摸提示
        if (touchHint) {
            touchHint.style.display = "flex";
            touchHint.style.opacity = "1";
            // 5秒后自动隐藏提示
            setTimeout(() => {
                touchHint.style.opacity = "0";
            }, 5000);
        }

        console.log(`✅ 已加载植物模型: ${plantData.title}`);
    }
}

/**
 * 更新模型缩放
 * @param {number} scale - 缩放比例
 */
function updateModelScale(scale) {
    const newScale = baseScale * scale;
    plantModel.setAttribute("scale", `${newScale} ${newScale} ${newScale}`);
}

// ==================== 自动旋转动画 ====================

function animateAutoRotate() {
    if (autoRotate && !isDragging && !isPinching) {
        currentRotationY += autoRotateSpeed;
        applyRotation();
    }
    requestAnimationFrame(animateAutoRotate);
}

// ==================== 初始化 ====================

// 页面加载完成后初始化
window.addEventListener("load", async () => {
    console.log("🌿 PlantAR Demo 启动中...");

    // 初始化摄像头
    await initCamera();

    // 隐藏加载动画
    const loader = document.querySelector(".arjs-loader");
    setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
        }, 500);
    }, 1500);

    // 默认加载滴水观音模型
    const defaultPlant = plantDatabase.elephantEar;
    showPlantModel(defaultPlant);
    updateInfoPanel(defaultPlant);
    updateFloatingInfo(defaultPlant);

    // 启动自动旋转
    animateAutoRotate();

    // 设置光标样式
    document.body.style.cursor = "grab";

    console.log("✅ PlantAR Demo 已初始化");
    console.log("📱 提示: 拖动屏幕旋转模型，双指缩放，点击右侧按钮查看信息");
});

// ==================== 调试工具 ====================

/**
 * 切换植物 - 用于未来扩展
 */
window.switchPlant = function (plantId) {
    if (plantDatabase[plantId]) {
        const plantData = plantDatabase[plantId];
        showPlantModel(plantData);
        updateInfoPanel(plantData);
        console.log(`已切换到: ${plantData.title}`);
    } else {
        console.error(`未知植物 ID: ${plantId}`);
        console.log("可用的植物 ID:", Object.keys(plantDatabase));
    }
};

/**
 * 切换自动旋转
 */
window.toggleAutoRotate = function () {
    autoRotate = !autoRotate;
    console.log(`自动旋转: ${autoRotate ? "开启" : "关闭"}`);
};
