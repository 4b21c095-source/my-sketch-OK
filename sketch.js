// ==========================================
// 🕹️ 遊戲狀態與全域變數設定
// ==========================================
let classifier;
const modelURL = 'https://teachablemachine.withgoogle.com/models/TlzldmfV7/model.json';
let video;

let currentState = 'HOME'; // 狀態：HOME, SCANNING, GAME_PLAY, HISTORY, SETTINGS
let isModelLoaded = false;
let modelLoadError = false; 

// ✨ 掃描專用變數
let scanMessage = "請將題目卡對準中央視訊畫面";
let isDetecting = false; 

let currentLevel = 0; 
let placementState = []; 

// 🎯 拖曳相關全域變數
let isDragging = false;
let draggedComponent = null;

// 🎯 測試狀態與自動跳轉全域變數
let hasTested = false;      
let isLevelCorrect = false;  
let successTimer = 0;        // ⏳ 成功過關時的計時器

// 📜 歷史紀錄全域變數
let gameHistory = [];        // 存放歷史紀錄的陣列

// ==========================================
// 🎯 關卡資料庫 (保留所有電路繪製)
// ==========================================
let levels = [
  {
    title: "關卡 1：單一電池串聯迴路",
    slots: [{ x: 500, y: 475, expected: 'battery_r', label: "下方插槽" }],
    drawBackground: function() {
      stroke(0); strokeWeight(4); noFill();
      line(140, 175, 860, 175); line(860, 175, 860, 475); line(140, 475, 860, 475);
      line(140, 175, 140, 280); line(140, 320, 140, 475);
      drawArrow(320, 175, 'R'); drawArrow(680, 175, 'R'); drawArrow(860, 325, 'D'); 
      drawArrow(680, 475, 'L'); drawArrow(320, 475, 'L'); 
      let shouldGlow = hasTested && isLevelCorrect;
      drawSwitchNode(140, 300, 140, 280, 140, 320, shouldGlow);
      drawBulbComponent(500, 175, shouldGlow);
    }
  },
  {
    title: "關卡 2：雙方格串聯挑戰",
    slots: [{ x: 500, y: 175, label: "上方插槽" }, { x: 500, y: 475, label: "下方插槽" }],
    drawBackground: function() {
      stroke(0); strokeWeight(4); noFill(); 
      line(140, 175, 860, 175); line(140, 475, 860, 475); line(140, 175, 140, 475);
      line(860, 175, 860, 280); line(860, 320, 860, 475);
      drawArrow(300, 175, 'L'); drawArrow(700, 175, 'L'); drawArrow(140, 325, 'D'); 
      drawArrow(300, 475, 'R'); drawArrow(700, 475, 'R'); drawArrow(860, 410, 'U'); 
      let shouldGlow = hasTested && isLevelCorrect;
      drawSwitchNode(860, 300, 860, 280, 860, 320, shouldGlow);
    }
  },
  {
    title: "關卡 3：三方格開關串聯挑戰",
    slots: [{ x: 140, y: 325, label: "左側插槽" }, { x: 500, y: 475, label: "底部插槽" }, { x: 860, y: 325, label: "右側插槽" }],
    drawBackground: function() {
      stroke(0); strokeWeight(4); noFill(); 
      line(140, 175, 860, 175); line(860, 175, 860, 475); line(860, 475, 140, 475); line(140, 475, 140, 175);
      drawArrow(320, 175, 'R'); drawArrow(620, 175, 'R'); drawArrow(780, 240, 'D'); drawArrow(650, 475, 'L'); drawArrow(220, 410, 'U'); 
    }
  },
  {
    title: "關卡 4：三方格左開關串聯",
    slots: [{ x: 350, y: 175, expected: 'battery_l', label: "上左插槽" }, { x: 650, y: 175, expected: 'battery_l', label: "上右插槽" }, { x: 500, y: 475, expected: 'bulb', label: "下方插槽" }],
    drawBackground: function() {
      stroke(0); strokeWeight(4); noFill(); 
      line(140, 175, 860, 175); line(860, 175, 860, 475); line(140, 475, 860, 475);
      line(140, 175, 140, 280); line(140, 320, 140, 475);
      drawArrow(350, 230, 'R'); drawArrow(650, 230, 'R'); drawArrow(790, 325, 'D'); drawArrow(680, 415, 'L'); drawArrow(220, 380, 'U'); 
      let shouldGlow = hasTested && isLevelCorrect;
      drawSwitchNode(140, 300, 140, 280, 140, 320, shouldGlow);
    }
  },
  {
    title: "關卡 5：雙分支分流並聯",
    slots: [{ x: 230, y: 350, expected: 'battery_u', label: "左軌插槽" }, { x: 450, y: 350, expected: 'battery_u', label: "右軌插槽" }],
    drawBackground: function() {
      stroke(0); strokeWeight(4); noFill();
      line(230, 240, 450, 240); line(230, 460, 450, 460); line(230, 240, 230, 460); line(450, 240, 450, 460); 
      line(340, 240, 340, 150); line(340, 150, 480, 150); line(550, 150, 800, 150); line(800, 150, 800, 520); line(800, 520, 340, 520); line(340, 520, 340, 460); 
      drawArrow(620, 150, 'L'); drawArrow(800, 260, 'U'); drawArrow(800, 440, 'U'); drawArrow(550, 520, 'R'); 
      drawArrow(230, 290, 'D'); drawArrow(230, 410, 'D'); drawArrow(450, 290, 'D'); drawArrow(450, 410, 'D'); 
      let shouldGlow = hasTested && isLevelCorrect;
      drawSwitchNode(515, 150, 480, 150, 550, 150, shouldGlow); 
      drawBulbComponent(800, 350, shouldGlow);           
    }
  },
  {
    title: "關卡 6：雙固定電池並聯",
    slots: [{ x: 500, y: 490, expected: 'bulb', label: "下方插槽" }],
    drawBackground: function() {
      stroke(0); strokeWeight(4); noFill();
      line(270, 245, 270, 375); line(720, 245, 720, 375); line(270, 245, 720, 245); line(270, 375, 720, 375); 
      beginShape(); vertex(270, 310); vertex(140, 310); vertex(140, 330); endShape(); 
      beginShape(); vertex(140, 370); vertex(140, 490); vertex(860, 490); vertex(860, 310); vertex(720, 310); endShape();
      drawArrow(340, 205, 'R'); drawArrow(650, 205, 'R'); drawArrow(340, 415, 'R'); drawArrow(650, 415, 'R');
      drawArrow(860, 400, 'D'); drawArrow(680, 490, 'L'); drawArrow(320, 490, 'L'); drawArrow(140, 400, 'U');
      let shouldGlow = hasTested && isLevelCorrect;
      drawSwitchNode(140, 350, 140, 330, 140, 370, shouldGlow);
      drawCustomGreenBattery(500, 245); drawCustomGreenBattery(500, 375);
    }
  },
  {
    title: "關卡 7：左側主迴路右側雙軌並聯",
    slots: [{ x: 180, y: 350, expected: 'bulb', label: "左側燈泡插槽" }, { x: 520, y: 350, expected: 'battery_d', label: "中軌插槽" }, { x: 740, y: 350, expected: 'battery_d', label: "右軌插槽" }],
    drawBackground: function() {
      stroke(0); strokeWeight(4); noFill();
      line(520, 240, 740, 240); line(520, 460, 740, 460); line(520, 240, 520, 460); line(740, 240, 740, 460); 
      line(630, 240, 630, 150); line(630, 150, 180, 150); line(180, 150, 180, 520); line(180, 520, 450, 520); line(520, 520, 630, 520); line(630, 520, 630, 460); 
      drawArrow(380, 150, 'L'); drawArrow(180, 250, 'D'); drawArrow(180, 450, 'D'); drawArrow(380, 520, 'R'); 
      drawArrow(520, 290, 'U'); drawArrow(520, 410, 'U'); drawArrow(740, 290, 'U'); drawArrow(740, 410, 'U'); 
      let shouldGlow = hasTested && isLevelCorrect;
      drawSwitchNode(485, 520, 450, 520, 520, 520, shouldGlow); 
    }
  },
  {
    title: "關卡 8：精準卡牌-08電路挑戰",
    slots: [{ x: 140, y: 350, expected: 'red_switch_v', label: "左側主幹插槽" }, { x: 500, y: 170, expected: 'battery_l', label: "內並聯上軌插槽" }, { x: 500, y: 350, expected: 'battery_l', label: "內並聯下軌插槽" }, { x: 500, y: 530, expected: 'bulb', label: "底部插槽" }],
    drawBackground: function() {
      stroke(0); strokeWeight(4); noFill();
      line(140, 235, 270, 235); line(730, 235, 860, 235); line(860, 235, 860, 530); 
      line(860, 530, 540, 530); line(460, 530, 140, 530); line(140, 530, 140, 235); 
      line(270, 170, 730, 170); line(270, 350, 730, 350); line(270, 170, 270, 350); line(730, 170, 730, 350); 
      drawArrow(350, 170, 'R'); drawArrow(650, 170, 'R'); drawArrow(350, 350, 'R'); drawArrow(650, 350, 'R'); 
      drawArrow(860, 410, 'D'); drawArrow(680, 530, 'L'); drawArrow(320, 530, 'L'); drawArrow(140, 450, 'U'); 
    }
  }
];

// ==========================================
// 🎯 核心檢查與初始化函式
// ==========================================
function checkLevelCleared() {
  if (currentLevel < levels.length) {
    if (currentLevel === 0) return (placementState[0] === 'battery_r');
    if (currentLevel === 1) { 
      let s1 = placementState[0], s2 = placementState[1]; 
      return (s1 === 'battery_r' && s2 === 'bulb') || (s1 === 'bulb' && s2 === 'battery_l');
    }
    if (currentLevel === 2) {
      let l = placementState[0], b = placementState[1], r = placementState[2];  
      return (l === 'bulb' && b === 'battery_r' && r === 'red_switch_v') || (l === 'red_switch_v' && b === 'bulb' && r === 'battery_u') || (l === 'battery_d' && b === 'red_switch' && r === 'bulb') || (l === 'battery_d' && b === 'bulb' && r === 'red_switch_v');
    }
    if (currentLevel === 6) return (placementState[0] === 'bulb' && placementState[1] === 'battery_d' && placementState[2] === 'battery_d');
    if (currentLevel === 7) return (placementState[0] === 'red_switch_v' && placementState[1] === 'battery_l' && placementState[2] === 'battery_l' && placementState[3] === 'bulb');
    
    let lvl = levels[currentLevel];
    for (let i = 0; i < lvl.slots.length; i++) {
      if (placementState[i] !== lvl.slots[i].expected) return false;
    }
    return true;
  }
  return false;
}

function initLevel() {
  placementState = []; hasTested = false; isLevelCorrect = false; successTimer = 0;
  if (currentLevel < levels.length) {
    let currentSlots = levels[currentLevel].slots;
    for (let i = 0; i < currentSlots.length; i++) placementState.push(null); 
  }
}

// ==========================================
// ⚙️ p5.js 核心事件
// ==========================================
async function setup() {
  let canvas = createCanvas(1000, 650);
  canvas.parent(document.body);
  textAlign(CENTER, CENTER);
  initLevel();

  try {
    video = createCapture(VIDEO);
    video.size(320, 240); 
    video.hide();
  } catch(e) {
    console.error("攝影機啟動失敗", e);
  }

  console.log("⏳ 正在連線至 Google 雲端載入 AI 模型...");
  try {
    classifier = await ml5.imageClassifier(modelURL);
    console.log("🎉 AI 模型完全載入成功！系統就緒！");
    isModelLoaded = true;
  } catch (error) {
    console.error("❌ 模型載入發生錯誤:", error);
    modelLoadError = true;
  }
}

function draw() {
  if (currentState === "HOME") drawStartMenu();
  else if (currentState === "SCANNING") drawScanningScreen();
  else if (currentState === "GAME_PLAY") drawGamePlay();
  else if (currentState === "HISTORY") drawHistoryView();
  else if (currentState === "SETTINGS") drawSettingsView();
}

// ==========================================
// 📺 各畫面繪製邏輯
// ==========================================
function drawStartMenu() {
  background(174, 198, 223); 
  
  // ⚙️ 左上角設定按鈕 (維持在相對左上角固定位置)
  push(); stroke(40); strokeWeight(4); noFill(); translate(80, 80);
  for(let i=0; i<8; i++) { rotate(QUARTER_PI); rect(-8, -24, 16, 12, 3); }
  ellipse(0, 0, 24, 24); pop();

  // 📜 右上角歷史紀錄按鈕 (修正為相對畫布右側 width - 310 與 width - 115)
  rectMode(CORNER); fill(255); stroke(0); strokeWeight(1); rect(width - 310, 52, 150, 45, 8);
  fill(0); noStroke(); textSize(24); textStyle(BOLD); text("歷史紀錄", width - 235, 73);
  stroke(0); strokeWeight(2); fill(230, 126, 34); ellipse(width - 115, 75, 45, 45);

  // 主標題
  fill(0); noStroke(); textSize(64); textStyle(BOLD); text("電路大冒險", width / 2, height / 2 - 50);

  // AI 狀態提示
  textSize(16); textStyle(NORMAL);
  if (!isModelLoaded && !modelLoadError) {
    fill('#d97706'); text("⏳ AI 辨識模型下載中，請稍候...", width / 2, height / 2 + 30);
  } else if (modelLoadError) {
    fill('#dc2626'); text("⚠️ AI 模型載入失敗，請確認網路連線", width / 2, height / 2 + 30);
  } else {
    fill('#059669'); text("", width / 2, height / 2 + 30);
  }

  // 進入掃描按鈕
  if (isModelLoaded) {
    rectMode(CENTER); fill(46, 204, 113); stroke(0); rect(width / 2, height / 2 + 120, 240, 65, 12);
    fill(255); noStroke(); textSize(22); textStyle(BOLD); text(" 掃描題目卡進入", width / 2, height / 2 + 118);
  }
}

// 🛠️ 乾淨版置中掃描畫面
function drawScanningScreen() {
  background(20);
  
  // 🎥 1. 將 320x240 的原始視訊等比例放大到 640x480 並將中心點置中
  let vx = width / 2 - 320; 
  let vy = height / 2 - 240 - 20; 
  if (video) {
    image(video, vx, vy, 640, 480);
  }

  // 頂部黑色透明半遮罩與文字
  noStroke(); fill(15, 23, 42, 220); rect(0, 0, width, 80);
  fill(isDetecting ? '#f59e0b' : 255); textSize(20); textStyle(BOLD); text(" " + scanMessage, width / 2, 40);

  // 返回按鈕
  rectMode(CORNER); fill('#dc2626'); rect(30, 22, 90, 36, 6);
  fill(255); textSize(16); text("返回", 75, 38);

  // 底部拍照按鈕
  rectMode(CENTER);
  let btnW = 220, btnH = 55, btnX = width / 2, btnY = height - 70;
  fill(isDetecting ? '#475569' : '#2563eb'); stroke(255); strokeWeight(1);
  rect(btnX, btnY, btnW, btnH, 10);
  fill(255); noStroke(); textSize(18); textStyle(BOLD);
  text(isDetecting ? "⏳ AI 分析中..." : "拍照並辨識題目", btnX, btnY);
}

async function takePhotoAndDetect() {
  if (!classifier || !isModelLoaded) return;
  isDetecting = true;
  scanMessage = "喀嚓！AI 正在分析電路題卡...";
  
  try {
    let results = await classifier.classify(video);
    if (results && results.length > 0) {
      let label = results[0].label.trim();
      let conf = results[0].confidence;
      let targetLvl = parseInt(label) - 1; 
      
      if (targetLvl >= 0 && targetLvl < levels.length && conf > 0.45) {
        currentLevel = targetLvl;
        initLevel();
        currentState = 'GAME_PLAY'; 
        scanMessage = "請將題目卡對準中央視訊畫面"; 
      } else {
        scanMessage = `❌ 辨識失敗(信心度低)！請重新對準後再試一次。`;
      }
    }
  } catch (e) {
    console.error("AI 預測發生錯誤:", e);
    scanMessage = "❌ 掃描發生異常，請重新嘗試。";
  }
  isDetecting = false;
}

function drawGamePlay() {
  background(245, 247, 250); 
  drawInspectorHeader();
  
  if (currentLevel < levels.length) {
    levels[currentLevel].drawBackground();
    drawSlots(); 

    // 電路測試按鈕
    rectMode(CENTER);
    if (mouseX > 910 && mouseX < 980 && mouseY > 300 && mouseY < 360) fill(230, 126, 34);
    else fill(241, 196, 15);
    stroke(0); strokeWeight(2); rect(945, 330, 70, 60, 8);
    fill(0); noStroke(); textSize(14); textStyle(BOLD); text("電路\n測試", 945, 330);

    if (hasTested) {
      if (isLevelCorrect) {
        // ✨ 成功畫面
        push(); rectMode(CENTER); fill(46, 204, 113, 230); noStroke(); rect(width / 2, 120, 360, 40, 20);
        fill(255); textSize(15); text("電路修復成功！", width / 2, 118); pop();
        
        if (millis() - successTimer > 2500) {
          currentState = 'SCANNING'; 
          initLevel();               
        }
      } else {
        // 💥 失敗畫面
        push(); rectMode(CENTER); fill(231, 76, 60, 230); noStroke(); rect(width / 2, 120, 320, 40, 20);
        fill(255); textSize(16); 
        if (frameCount % 20 < 10) text("💥 警告：電路短路！產生爆炸 💥", width / 2, 118);
        pop();
        
        let lvl = levels[currentLevel];
        for (let i = 0; i < lvl.slots.length; i++) {
          if (placementState[i] !== lvl.slots[i].expected) drawExplosion(lvl.slots[i].x, lvl.slots[i].y);
        }
      }
    }
  }
  drawToolbox();
  if (isDragging && draggedComponent) {
    push(); translate(mouseX, mouseY); scale(0.8); drawingContext.globalAlpha = 0.7; drawComponent(0, 0, draggedComponent); pop();
  }
  rectMode(CORNER); fill(52, 73, 94); noStroke(); rect(20, height - 50, 100, 35, 5);
  fill(255); textSize(14); textStyle(BOLD); text("⬅ 返回首頁", 70, height - 34);
}

// ==========================================
// 🛠️ UI 輔助組件與電路物件繪製
// ==========================================
function drawInspectorHeader() { 
  fill(52, 73, 94); noStroke(); rectMode(CORNER); rect(0, 0, width, 100); 
  if (currentLevel < levels.length) { 
    fill(255); textSize(20); textStyle(BOLD); textAlign(LEFT, CENTER); 
    text(`🔍 關卡圖形檢視器`, 30, 35); 
    textSize(14); textStyle(NORMAL); fill(241, 196, 15); 
    text(`目前由 AI 載入：${levels[currentLevel].title}`, 30, 65); 
  } 
  textAlign(CENTER, CENTER); textStyle(BOLD);
}

function drawSlots() { if (currentLevel < levels.length) { let lvl = levels[currentLevel]; for (let i = 0; i < lvl.slots.length; i++) { let slot = lvl.slots[i]; let placed = placementState[i]; rectMode(CENTER); stroke(0); strokeWeight(4); fill(255); rect(slot.x, slot.y, 65, 60); if (placed !== null) drawComponent(slot.x, slot.y, placed); } } }
function drawToolbox() { let tools = ['battery_r', 'battery_l', 'battery_u', 'battery_d', 'bulb', 'red_switch', 'red_switch_v']; let startX = width / 2 - 195; let y = height - 40; fill(0, 30); noStroke(); rectMode(CENTER); rect(width/2, y, 485, 60, 10); for (let i = 0; i < tools.length; i++) { let tx = startX + i * 65; fill(255, 200); stroke(200); strokeWeight(1); rect(tx, y, 55, 50, 5); push(); translate(tx, y); scale(0.6); drawComponent(0, 0, tools[i]); pop(); } }
function drawComponent(x, y, type) { if (type.startsWith('battery')) drawBatteryComponent(x, y, type); else if (type === 'bulb') drawBulbComponent(x, y, hasTested && isLevelCorrect); else if (type === 'red_switch') drawRedSwitchComponent(x, y, hasTested && isLevelCorrect, false); else if (type === 'red_switch_v') drawRedSwitchComponent(x, y, hasTested && isLevelCorrect, true); }
function drawBatteryComponent(x, y, type) { push(); translate(x, y); if (type === 'battery_l') rotate(PI); if (type === 'battery_u') rotate(-HALF_PI); if (type === 'battery_d') rotate(HALF_PI); rectMode(CENTER); stroke(0); strokeWeight(2); fill(231, 76, 60); rect(-5, 0, 30, 20, 2); fill(52, 73, 94); rect(12, 0, 6, 20, 2); fill(241, 196, 15); rect(-22, 0, 4, 10, 1); fill(255); noStroke(); textSize(12); textStyle(BOLD); text("+", -10, -2); text("-", 8, -2); pop(); }
function drawRedSwitchComponent(x, y, isCleared, isVertical) { push(); translate(x, y); if (isVertical) rotate(HALF_PI); stroke(0); strokeWeight(4); fill(0); circle(-20, 0, 6); circle(20, 0, 6); if (isCleared) line(-20, 0, 20, 0); else { push(); translate(-20, 0); rotate(-QUARTER_PI); line(0, 0, 32, 0); pop(); } pop(); }
function drawCustomGreenBattery(x, y) { push(); translate(x, y); rectMode(CENTER); stroke(0); strokeWeight(3); fill(167, 240, 114); rect(5, 0, 75, 36, 6); fill(241, 196, 15); rect(-36, 0, 7, 18, 2); fill(80); rect(40, 0, 6, 36, 2); fill(0); noStroke(); textSize(18); textStyle(BOLD); text("+", -18, -2); text("-", 24, -2); pop(); }
function drawBulbComponent(x, y, isGlowing) { push(); translate(x, y); rectMode(CENTER); fill(130); stroke(0); strokeWeight(2.5); rect(0, 12, 14, 8, 2); fill(70); rect(0, 16, 8, 3); if (isGlowing) { fill(255, 235, 59); noStroke(); fill(255, 235, 59, 50); circle(0, -4, 40); fill(255, 235, 59); } else fill(215); stroke(0); strokeWeight(2.5); circle(0, -4, 26); noFill(); stroke(80); strokeWeight(1.5); beginShape(); vertex(-5, 2); vertex(-3, -5); vertex(3, -5); vertex(5, 2); endShape(); pop(); }
function drawSwitchNode(boxX, boxY, x1, y1, x2, y2, closed) { push(); stroke(0); strokeWeight(4); fill(0); circle(x1, y1, 6); circle(x2, y2, 6); if (closed) line(x1, y1, x2, y2); else { let angle = atan2(y2 - y1, x2 - x1) - QUARTER_PI - 0.2; line(x1, y1, x1 + cos(angle) * dist(x1, y1, x2, y2), y1 + sin(angle) * dist(x1, y1, x2, y2)); } pop(); }
function drawArrow(x, y, dir) { push(); translate(x, y); stroke(0); strokeWeight(3); fill(0); if (dir === 'R') { line(-15, 0, 15, 0); line(15, 0, 6, -6); line(15, 0, 6, 6); } else if (dir === 'L') { line(15, 0, -15, 0); line(-15, 0, -6, -6); line(-15, 0, -6, 6); } else if (dir === 'U') { line(0, 15, 0, -15); line(0, -15, -6, -6); line(0, -15, 6, -6); } else if (dir === 'D') { line(0, -15, 0, 15); line(0, 15, -6, 6); line(0, 15, 6, 6); } pop(); }
function drawExplosion(x, y) { push(); stroke(241, 196, 15); strokeWeight(3); fill(231, 76, 60, 200); let numPoints = 12; let innerRad = 20 + sin(frameCount * 0.5) * 5; let outerRad = 45 + cos(frameCount * 0.5) * 8; angleMode(RADIANS); beginShape(); for (let i = 0; i < numPoints * 2; i++) { let angle = (TWO_PI / (numPoints * 2)) * i; let rad = i % 2 === 0 ? outerRad : innerRad; vertex(x + cos(angle) * rad, y + sin(angle) * rad); } endShape(CLOSE); fill(255, 242, 0); noStroke(); circle(x, y, innerRad * 1.2); pop(); }

// 📜 動態歷史紀錄畫面呈現
function drawHistoryView() { 
  background(240, 244, 248); 
  
  // 頂部標題
  fill(52, 73, 94); noStroke(); rectMode(CORNER); rect(0, 0, width, 90);
  fill(255); textSize(28); textStyle(BOLD); text("📜 冒險測試歷史紀錄", width / 2, 45);
  
  if (gameHistory.length === 0) {
    fill(127, 140, 141); textSize(20); textStyle(NORMAL);
    text("目前尚無任何測試紀錄，趕快去修復電路吧！", width / 2, height / 2);
  } else {
    // 渲染紀錄清單 (最多顯示最新 6 筆，避免超出畫面)
    let startY = 130;
    let maxDisplay = min(gameHistory.length, 6);
    
    // 從最新的紀錄反向撈取顯示
    for (let i = 0; i < maxDisplay; i++) {
      let index = gameHistory.length - 1 - i;
      let record = gameHistory[index];
      let currentY = startY + i * 70;
      
      // 條目背景底框
      rectMode(CENTER); fill(255); stroke(215, 225, 235); strokeWeight(1);
      rect(width / 2, currentY, 750, 56, 8);
      
      // 時間顯示
      textAlign(LEFT, CENTER); fill(120); textSize(14); textStyle(NORMAL);
      text(record.time, width / 2 - 350, currentY);
      
      // 關卡名稱
      fill(44, 62, 80); textSize(16); textStyle(BOLD);
      text(record.levelTitle, width / 2 - 200, currentY);
      
      // 放置配置摘要簡介
      fill(100); textSize(13); textStyle(NORMAL);
      let configStr = "卡牌配置: " + record.components.map(c => c ? c : "空").join(', ');
      text(configStr, width / 2 + 50, currentY);
      
      // 狀態標籤按鈕狀態 (成功綠、失敗紅)
      rectMode(CENTER);
      if (record.success) {
        fill(46, 204, 113); noStroke(); rect(width / 2 + 310, currentY, 70, 30, 6);
        textAlign(CENTER, CENTER); fill(255); textSize(14); textStyle(BOLD); text("成功", width / 2 + 310, currentY);
      } else {
        fill(231, 76, 60); noStroke(); rect(width / 2 + 310, currentY, 70, 30, 6);
        textAlign(CENTER, CENTER); fill(255); textSize(14); textStyle(BOLD); text("失敗", width / 2 + 310, currentY);
      }
    }
    
    if (gameHistory.length > 6) {
      textAlign(CENTER, CENTER); fill(120); textSize(12); textStyle(ITALIC);
      text(`(僅顯示最新 6 筆中之 ${gameHistory.length} 筆紀錄)`, width / 2, height - 100);
    }
  }
  
  drawBackToMenuButton(); 
}

function drawSettingsView() { background(220, 225, 230); fill(44, 62, 80); textSize(32); textStyle(BOLD); text("⚙️ 系統設定環境", width/2, 200); drawBackToMenuButton(); }
function drawBackToMenuButton() { rectMode(CENTER); fill(52, 73, 94); noStroke(); rect(width/2, height - 55, 160, 42, 8); fill(255); textSize(18); textStyle(BOLD); text("返回主選單", width/2, height - 57); }

// ==========================================
// 🖱️ 滑鼠點擊與拖曳事件處理
// ==========================================
function mousePressed() { 
  if (currentState === "HOME") { 
    // 📸 進入掃描按鈕範圍判定
    if (isModelLoaded && mouseX > width/2 - 120 && mouseX < width/2 + 120 && mouseY > height/2 + 87 && mouseY < height/2 + 153) {
      currentState = "SCANNING"; 
      scanMessage = "請將題目卡對準中央視訊畫面";
      return; 
    } 
    // 📜 歷史紀錄按鈕範圍判定 (同步修正為動態 width 寬度計算)
    if (mouseX > width - 310 && mouseX < width - 160 && mouseY > 52 && mouseY < 97) { 
      currentState = "HISTORY"; 
      return; 
    } 
    // ⚙️ 設定按鈕範圍判定
    if (dist(mouseX, mouseY, 80, 80) < 30) { 
      currentState = "SETTINGS"; 
      return; 
    } 
    return; 
  } 
  
  if (currentState === "SCANNING") {
    if (mouseX > 30 && mouseX < 120 && mouseY > 22 && mouseY < 58) { currentState = "HOME"; return; }
    let btnX = width / 2, btnY = height - 70;
    if (!isDetecting && mouseX > btnX - 110 && mouseX < btnX + 110 && mouseY > btnY - 27 && mouseY < btnY + 27) {
      takePhotoAndDetect();
    }
    return;
  }

  if (currentState === "HISTORY" || currentState === "SETTINGS") { 
    if (mouseX > width/2 - 80 && mouseX < width/2 + 80 && mouseY > height - 76 && mouseY < height - 34) currentState = "HOME"; 
    return; 
  } 
  
  if (currentState === "GAME_PLAY") { 
    if (hasTested && isLevelCorrect) return;

    if (mouseX > 20 && mouseX < 120 && mouseY > height - 50 && mouseY < height - 15) { currentState = "HOME"; return; } 
    
    // 💥 點擊「電路測試」按鈕
    if (mouseX > 910 && mouseX < 980 && mouseY > 300 && mouseY < 360) { 
      hasTested = true; 
      isLevelCorrect = checkLevelCleared(); 
      
      // ⏱️ 獲取目前格式化的系統時間 (時:分:秒)
      let hr = nf(hour(), 2);
      let mn = nf(minute(), 2);
      let sc = nf(second(), 2);
      let timestamp = `${hr}:${mn}:${sc}`;
      
      // 📝 不論對錯，都將目前的測試狀態包裝成物件塞入歷史陣列中
      gameHistory.push({
        time: timestamp,
        levelTitle: levels[currentLevel].title,
        success: isLevelCorrect,
        components: [...placementState] // 複製目前的卡牌配置快照
      });
      
      if (isLevelCorrect) {
        successTimer = millis(); 
      }
      return; 
    } 
    
    if (currentLevel >= levels.length) return; 
    
    let tools = ['battery_r', 'battery_l', 'battery_u', 'battery_d', 'bulb', 'red_switch', 'red_switch_v']; 
    let startX = width / 2 - 195; 
    let ty = height - 40; 
    for (let i = 0; i < tools.length; i++) { 
      if (dist(mouseX, mouseY, startX + i * 65, ty) < 25) { isDragging = true; draggedComponent = tools[i]; hasTested = false; return; } 
    } 
    let lvl = levels[currentLevel]; 
    for (let i = 0; i < lvl.slots.length; i++) { 
      if (mouseX > lvl.slots[i].x - 35 && mouseX < lvl.slots[i].x + 35 && mouseY > lvl.slots[i].y - 30 && mouseY < lvl.slots[i].y + 30) { 
        if (placementState[i] !== null) { isDragging = true; draggedComponent = placementState[i]; placementState[i] = null; hasTested = false; } 
        return; 
      } 
    } 
  } 
}

function mouseReleased() { 
  if (currentState === "GAME_PLAY" && isDragging) { 
    isDragging = false; 
    if (currentLevel < levels.length) { 
      let lvl = levels[currentLevel]; 
      for (let i = 0; i < lvl.slots.length; i++) { 
        if (mouseX > lvl.slots[i].x - 40 && mouseX < lvl.slots[i].x + 40 && mouseY > lvl.slots[i].y - 40 && mouseY < lvl.slots[i].y + 40) { 
          placementState[i] = draggedComponent; 
          break; 
        } 
      } 
    } 
    draggedComponent = null; 
  } 
}