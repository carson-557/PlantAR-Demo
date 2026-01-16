/**
 * PlantAR - AR.js NFT 版逻辑脚本
 * 简化版本，模仿 Gunify 项目结构
 */

// ==================== 植物数据 ====================
const plantDatabase = {
    elephantEarMarker: {
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
    }
};

// ==================== DOM 元素 ====================
const infoPanel = document.getElementById("infoPanel");
const floatingInfo = document.getElementById("floatingInfo");
const scanHint = document.getElementById("scanHint");
const infoButton = document.querySelector(".info-icon");
const rotateButton = document.querySelector(".rotate-icon");
const scaleButton = document.querySelector(".scale-icon");
const closeButton = document.querySelector(".close-wrapper");

// 隐藏面板初始状态
infoPanel.style.display = "none";

// ==================== 按钮事件 ====================
infoButton.addEventListener("click", () => {
    infoPanel.style.display = "block";
    infoPanel.classList.add("visible");
});

closeButton.addEventListener("click", () => {
    hideInfoPanel();
});

scaleButton.addEventListener("click", () => {
    const model = document.getElementById("plantModel");
    if (!model) return;

    const currentScale = model.getAttribute("scale");
    const s = currentScale.x;
    const newScale = s === 80 ? 120 : (s === 120 ? 50 : 80);
    model.setAttribute("scale", `${newScale} ${newScale} ${newScale}`);

    // 图标反馈
    const icon = scaleButton.querySelector("i");
    icon.className = newScale > 80 ? "fa-solid fa-compress" : "fa-solid fa-expand";
});

rotateButton.addEventListener("click", () => {
    const model = document.getElementById("plantModel");
    if (!model) return;

    // 360度旋转动画
    model.setAttribute("animation", {
        property: "rotation",
        to: "0 360 0",
        dur: 2000,
        easing: "easeInOutQuad"
    });

    setTimeout(() => {
        model.removeAttribute("animation");
        model.setAttribute("rotation", "0 0 0");
    }, 2000);
});

// ==================== 信息面板函数 ====================
function updateInfoPanel(plantId) {
    const data = plantDatabase[plantId];

    if (data) {
        // 更新详情面板
        document.getElementById("plantTitle").textContent = data.title;
        document.getElementById("plantEnglish").textContent = data.englishName;
        document.getElementById("plantCategory").textContent = data.category;
        document.getElementById("plantDescription").textContent = data.description;

        // 更新浮动 UI
        document.getElementById("floatTitle").textContent = data.title;
        document.getElementById("floatEnglish").textContent = data.englishName;
        document.getElementById("floatFamilyValue").textContent = data.specs.family;
        document.getElementById("floatOriginValue").textContent = data.specs.origin;
        document.getElementById("floatCategoryValue").textContent = data.category;
        document.getElementById("floatFeatureValue").textContent = data.specs.feature;
        document.getElementById("floatFunFactText").textContent = data.funFact;
    }
}

function hideInfoPanel() {
    infoPanel.classList.remove("visible");
    setTimeout(() => {
        infoPanel.style.display = "none";
    }, 300);
}

function clearInfo() {
    infoPanel.style.display = "none";
    floatingInfo.style.display = "none";
}

// ==================== NFT Marker 事件绑定 ====================
// 遍历所有植物，绑定 marker 事件
Object.keys(plantDatabase).forEach((plantId) => {
    const marker = document.getElementById(plantId);

    if (marker) {
        marker.addEventListener("markerFound", () => {
            console.log("✅ 识别到植物:", plantDatabase[plantId].title);

            // 隐藏扫描提示
            scanHint.style.display = "none";

            // 显示浮动 UI
            floatingInfo.style.display = "flex";

            // 更新信息
            updateInfoPanel(plantId);
        });

        marker.addEventListener("markerLost", () => {
            console.log("❌ 丢失目标");

            // 显示扫描提示
            scanHint.style.display = "block";

            // 隐藏 UI
            hideInfoPanel();
            floatingInfo.style.display = "none";
        });
    } else {
        console.warn("⚠️ 未找到 marker 元素:", plantId);
    }
});

console.log("🌿 PlantAR 已初始化");
console.log("📦 已注册", Object.keys(plantDatabase).length, "种植物");
