/**
 * PlantAR - 植物识别 AR Demo
 * 核心逻辑文件 - 支持触摸拖动旋转 3D 模型
 */

// ==================== 植物数据库 ====================
const plantDatabase = {
    elephantEarMarker: {
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
        modelScale: "0.015 0.015 0.015",
        modelPosition: "0 -0.8 0",
        modelRotation: "0 0 0",
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

const modelOverlay = document.getElementById("modelOverlay");
const plantModel = document.getElementById("plantModel");
const plantModelPivot = document.getElementById("plantModelPivot");
const touchHint = document.getElementById("touchHint");

// ==================== 状态管理 ====================
let currentPlant = null;
let currentScale = 1;

// 触摸/拖动旋转状态
let isDragging = false;
let previousMouseX = 0;
let previousMouseY = 0;
let currentRotationX = 0;
let currentRotationY = 0;

// 初始化隐藏面板
infoPanel.style.display = "none";
modelOverlay.style.display = "none";

// ==================== 触摸/鼠标拖动旋转 ====================

/**
 * 开始拖动
 */
function onDragStart(x, y) {
    isDragging = true;
    previousMouseX = x;
    previousMouseY = y;
    modelOverlay.style.cursor = "grabbing";
    
    // 隐藏提示
    if (touchHint) {
        touchHint.style.opacity = "0";
    }
}

/**
 * 拖动中
 */
function onDragMove(x, y) {
    if (!isDragging) return;

    const deltaX = x - previousMouseX;
    const deltaY = y - previousMouseY;

    // 更新旋转角度
    currentRotationY += deltaX * 0.5;
    currentRotationX -= deltaY * 0.3;

    // 限制 X 轴旋转范围
    currentRotationX = Math.max(-60, Math.min(60, currentRotationX));

    // 应用旋转到模型
    if (plantModel) {
        plantModel.setAttribute("rotation", {
            x: currentRotationX,
            y: currentRotationY,
            z: 0,
        });
    }

    previousMouseX = x;
    previousMouseY = y;
}

/**
 * 结束拖动
 */
function onDragEnd() {
    isDragging = false;
    modelOverlay.style.cursor = "grab";
}

// 鼠标事件
modelOverlay.addEventListener("mousedown", (e) => {
    onDragStart(e.clientX, e.clientY);
});

document.addEventListener("mousemove", (e) => {
    onDragMove(e.clientX, e.clientY);
});

document.addEventListener("mouseup", () => {
    onDragEnd();
});

// 触摸事件
modelOverlay.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        onDragStart(touch.clientX, touch.clientY);
    }
}, { passive: true });

document.addEventListener("touchmove", (e) => {
    if (e.touches.length === 1) {
        const touch = e.touches[0];
        onDragMove(touch.clientX, touch.clientY);
    }
}, { passive: true });

document.addEventListener("touchend", () => {
    onDragEnd();
});

// ==================== 事件监听器 ====================

// 信息按钮 - 显示/隐藏信息面板
infoButton.addEventListener("click", () => {
    if (currentPlant) {
        infoPanel.classList.toggle("visible");
    }
});

// 重置旋转按钮
rotateButton.addEventListener("click", () => {
    currentRotationX = 0;
    currentRotationY = 0;
    if (plantModel) {
        plantModel.setAttribute("rotation", "0 0 0");
    }
    
    // 添加反馈动画
    rotateButton.classList.add("pulse");
    setTimeout(() => rotateButton.classList.remove("pulse"), 300);
});

// 缩放按钮 - 切换模型大小
scaleButton.addEventListener("click", () => {
    currentScale = currentScale === 1 ? 1.5 : currentScale === 1.5 ? 0.7 : 1;
    updateModelScale();

    // 更新图标
    const icon = scaleButton.querySelector("i");
    if (currentScale > 1) {
        icon.className = "fa-solid fa-compress";
    } else {
        icon.className = "fa-solid fa-expand";
    }
});

// 关闭按钮 - 隐藏信息面板
closeButton.addEventListener("click", () => {
    hideInfoPanel();
});

// ==================== 核心功能函数 ====================

/**
 * 更新信息面板内容
 * @param {string} plantId - 植物标记 ID
 */
function updateInfoPanel(plantId) {
    const plantData = plantDatabase[plantId];

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

        // 显示面板
        infoPanel.style.display = "block";
        // 延迟添加 visible 类以触发动画
        setTimeout(() => {
            infoPanel.classList.add("visible");
        }, 50);
    }
}

/**
 * 隐藏信息面板
 */
function hideInfoPanel() {
    infoPanel.classList.remove("visible");
}

/**
 * 清除当前植物信息
 */
function clearPlantInfo() {
    currentPlant = null;
    plantTitle.textContent = "";
    plantEnglish.textContent = "";
    plantCategory.textContent = "";
    plantDescription.textContent = "";
    specFamily.textContent = "--";
    specOrigin.textContent = "--";
    specFeature.textContent = "--";
    funFactText.textContent = "";
    infoPanel.style.display = "none";
}

/**
 * 加载并显示 3D 模型（全屏覆盖在摄像头上）
 * @param {string} plantId - 植物标记 ID
 */
function showPlantModel(plantId) {
    const plantData = plantDatabase[plantId];

    if (plantData && plantData.model) {
        // 重置旋转
        currentRotationX = 0;
        currentRotationY = 0;
        currentScale = 1;

        // 设置模型属性
        plantModel.setAttribute("gltf-model", plantData.model);
        plantModel.setAttribute("scale", plantData.modelScale);
        plantModel.setAttribute("position", plantData.modelPosition);
        plantModel.setAttribute("rotation", plantData.modelRotation);

        // 显示模型覆盖层
        modelOverlay.style.display = "block";
        modelOverlay.classList.add("visible");
        modelOverlay.style.cursor = "grab";

        // 显示触摸提示
        if (touchHint) {
            touchHint.style.display = "flex";
            touchHint.style.opacity = "1";
            // 3秒后自动隐藏提示
            setTimeout(() => {
                touchHint.style.opacity = "0";
            }, 3000);
        }

        console.log(`已加载植物模型: ${plantData.title}`);
    }
}

/**
 * 隐藏 3D 模型
 */
function hidePlantModel() {
    modelOverlay.classList.remove("visible");

    // 延迟隐藏以完成动画
    setTimeout(() => {
        if (!modelOverlay.classList.contains("visible")) {
            modelOverlay.style.display = "none";
            plantModel.removeAttribute("gltf-model");
        }
    }, 300);

    // 隐藏触摸提示
    if (touchHint) {
        touchHint.style.display = "none";
    }
}

/**
 * 更新模型缩放
 */
function updateModelScale() {
    if (currentPlant) {
        const baseScale = currentPlant.modelScale.split(" ").map(Number);
        const newScale = baseScale.map((s) => s * currentScale).join(" ");
        plantModel.setAttribute("scale", newScale);
    }
}

// ==================== NFT Marker 事件绑定 ====================

/**
 * 为所有植物标记绑定检测事件
 */
function bindMarkerEvents() {
    Object.keys(plantDatabase).forEach((plantId) => {
        const marker = document.getElementById(plantId);

        if (marker) {
            // 标记检测到
            marker.addEventListener("markerFound", () => {
                console.log(`检测到植物: ${plantDatabase[plantId].title}`);

                // 显示 3D 模型（覆盖在摄像头上）
                showPlantModel(plantId);

                // 更新信息面板（但先不显示，用户点击按钮后显示）
                updateInfoPanel(plantId);
            });

            // 标记丢失
            marker.addEventListener("markerLost", () => {
                console.log(`植物标记丢失: ${plantDatabase[plantId].title}`);

                // 隐藏面板和模型
                hideInfoPanel();
                hidePlantModel();
                clearPlantInfo();
            });
        } else {
            console.warn(`未找到标记元素: ${plantId}`);
        }
    });
}

// ==================== 初始化 ====================

// 页面加载完成后初始化
window.addEventListener("load", () => {
    // 隐藏加载动画
    const loader = document.querySelector(".arjs-loader");
    setTimeout(() => {
        loader.style.opacity = "0";
        setTimeout(() => {
            loader.style.display = "none";
        }, 500);
    }, 1000);

    // 绑定标记事件
    bindMarkerEvents();

    console.log("PlantAR Demo 已初始化");
    console.log(`已注册 ${Object.keys(plantDatabase).length} 种植物`);
    console.log("提示: 拖动屏幕可以旋转 3D 模型");
});

// ==================== 调试工具 ====================

/**
 * 手动测试函数 - 用于开发调试
 * 在控制台调用: testPlant('elephantEarMarker')
 */
window.testPlant = function (plantId) {
    if (plantDatabase[plantId]) {
        showPlantModel(plantId);
        updateInfoPanel(plantId);
        console.log(`测试模式: 显示 ${plantDatabase[plantId].title}`);
        console.log("提示: 拖动屏幕可以旋转 3D 模型");
    } else {
        console.error(`未知植物 ID: ${plantId}`);
        console.log("可用的植物 ID:", Object.keys(plantDatabase));
    }
};

/**
 * 隐藏所有 UI - 调试用
 */
window.hideAll = function () {
    hideInfoPanel();
    hidePlantModel();
    clearPlantInfo();
    console.log("已隐藏所有 UI");
};
