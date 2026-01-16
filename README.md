# 🌿 PlantAR Demo

PlantAR 是一个基于 WebAR 的植物识别展示 Demo，通过识别植物特征图片，以 **View-Locked（视图锁定）** 方式展示 3D 模型并显示植物知识信息。

## 🚀 特性

| 特性 | 说明 |
|------|------|
| 🎯 **图像识别** | 基于 AR.js NFT 技术识别植物图片 |
| 🌱 **View-Locked 展示** | 3D 模型固定在屏幕中央，不随相机移动 |
| 📚 **知识面板** | 展示植物科属、产地、特性和趣闻 |
| 🔄 **交互控制** | 支持模型旋转、缩放切换 |
| 📱 **跨平台** | 浏览器直接运行，无需安装 App |

## 🛠️ 技术栈

| 技术 | 用途 |
|------|------|
| **A-Frame** | 3D/VR 场景渲染 |
| **AR.js (NFT)** | 自然特征点图像追踪 |
| **HTML/CSS/JS** | 前端界面和逻辑 |
| **GLTF** | 3D 模型格式 |

## 📁 项目结构

```
PlantAR-Demo/
├── index.html          # 主页面
├── script.js           # 核心逻辑
├── styles.css          # 样式表
├── README.md           # 项目说明
│
├── images/             # 植物识别图片（待添加）
│   ├── ginkgo.jpg      # 银杏
│   ├── sunflower.jpg   # 向日葵
│   ├── rose.jpg        # 玫瑰
│   └── bamboo.jpg      # 竹子
│
├── markers/            # NFT 标记数据（待生成）
│   ├── ginkgo/         # 每个植物对应 .fset, .fset3, .iset
│   ├── sunflower/
│   ├── rose/
│   └── bamboo/
│
├── models/             # 3D 模型文件（待添加）
│   ├── ginkgo/
│   ├── sunflower/
│   ├── rose/
│   └── bamboo/
│
└── favicon/            # 网站图标（可选）
```

## 📦 安装 & 运行

### 1️⃣ 使用本地服务器运行

```bash
# 方式一：使用 VS Code Live Server 插件
# 右键 index.html → Open with Live Server

# 方式二：使用 Python
python -m http.server 8080

# 方式三：使用 Node.js
npx serve .
```

### 2️⃣ 访问页面
打开浏览器访问 `http://localhost:8080`

## 🎯 添加新植物

### Step 1: 准备识别图片
- 将植物特征图片放入 `images/` 文件夹
- 图片要求：清晰、特征明显、最好 300x300 以上

### Step 2: 生成 NFT 标记
使用 [AR.js NFT Marker Creator](https://carnaux.github.io/NFT-Marker-Creator/) 生成标记文件：
1. 上传识别图片
2. 下载生成的 `.fset`、`.fset3`、`.iset` 文件
3. 放入 `markers/植物名/` 文件夹

### Step 3: 添加 3D 模型
- 将 GLTF/GLB 格式的 3D 模型放入 `models/植物名/` 文件夹
- 推荐来源：[Sketchfab](https://sketchfab.com/)、[Free3D](https://free3d.com/)

### Step 4: 更新代码
在 `script.js` 的 `plantDatabase` 中添加新植物数据：

```javascript
newPlantMarker: {
  id: "newplant",
  title: "植物名称",
  englishName: "English Name",
  category: "分类",
  description: "植物描述...",
  specs: {
    family: "科属",
    origin: "产地",
    feature: "特性",
  },
  funFact: "💡 有趣的知识...",
  image: "./images/newplant.jpg",
  model: "./models/newplant/scene.gltf",
  modelScale: "1 1 1",
  modelPosition: "0 -0.5 -2",
  modelRotation: "0 0 0",
}
```

在 `index.html` 中添加对应的 NFT 标记：

```html
<a-nft
  type="nft"
  id="newPlantMarker"
  url="./markers/newplant/newplant"
  smooth="true"
  smoothCount="10"
  smoothTolerance=".01"
  smoothThreshold="5"
>
</a-nft>
```

## 🧪 调试工具

在浏览器控制台可使用以下命令测试：

```javascript
// 测试显示特定植物
testPlant('ginkgoMarker')

// 隐藏所有 UI
hideAll()
```

## 📝 预置植物

| 植物 | 标记 ID | 说明 |
|------|---------|------|
| 🍂 银杏 | `ginkgoMarker` | 活化石，秋叶金黄 |
| 🌻 向日葵 | `sunflowerMarker` | 向阳生长的油料作物 |
| 🌹 玫瑰 | `roseMarker` | 爱情的象征 |
| 🎋 竹子 | `bambooMarker` | 生长最快的植物 |

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 License

MIT License
