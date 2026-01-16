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

console.log("📱 提示: 请扫描 Hiro 标记以显示植物模型");
console.log("🔗 Hiro 标记图片: https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/hiro.png");
