#!/usr/bin/env node

/**
 * 部署前檢查腳本
 * 檢查項目是否準備好部署到 GitHub Pages
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 檢查部署準備狀況...\n");

// 檢查必要文件
const requiredFiles = ["index.html", "script.js", "styles.css", "README.md"];

let allFilesExist = true;

console.log("📁 檢查必要文件:");
requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件不存在`);
    allFilesExist = false;
  }
});

// 檢查 frames 資料夾
console.log("\n🖼️  檢查 frames 資料夾:");
if (fs.existsSync("frames")) {
  const frames = fs
    .readdirSync("frames")
    .filter((file) => file.endsWith(".jpg") || file.endsWith(".png"))
    .sort();

  if (frames.length > 0) {
    console.log(`✅ 找到 ${frames.length} 張圖片`);
    console.log(`📷 第一張: ${frames[0]}`);
    console.log(`📷 最後一張: ${frames[frames.length - 1]}`);

    // 檢查命名格式
    const invalidNames = frames.filter(
      (file) => !file.match(/^frame_\d{4}\.(jpg|png)$/)
    );

    if (invalidNames.length > 0) {
      console.log(`⚠️  發現 ${invalidNames.length} 個檔名格式錯誤:`);
      invalidNames.slice(0, 5).forEach((name) => console.log(`   - ${name}`));
      if (invalidNames.length > 5) {
        console.log(`   ... 還有 ${invalidNames.length - 5} 個`);
      }
    }
  } else {
    console.log("❌ frames 資料夾是空的");
    allFilesExist = false;
  }
} else {
  console.log("❌ frames 資料夾不存在");
  allFilesExist = false;
}

// 檢查文件大小
console.log("\n📊 檢查文件大小:");
const checkFileSize = (filePath, maxSizeMB = 5) => {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeMB = stats.size / (1024 * 1024);

    if (sizeMB > maxSizeMB) {
      console.log(
        `⚠️  ${filePath}: ${sizeMB.toFixed(2)}MB (超過 ${maxSizeMB}MB)`
      );
      return false;
    } else {
      console.log(`✅ ${filePath}: ${sizeMB.toFixed(2)}MB`);
      return true;
    }
  }
  return true;
};

requiredFiles.forEach((file) => checkFileSize(file));

// 檢查 GitHub Actions 配置
console.log("\n⚙️  檢查 GitHub Actions:");
if (fs.existsSync(".github/workflows/deploy.yml")) {
  console.log("✅ GitHub Actions 部署配置已就緒");
} else {
  console.log("❌ 缺少 GitHub Actions 配置文件");
  allFilesExist = false;
}

// 總結
console.log("\n" + "=".repeat(50));
if (allFilesExist) {
  console.log("🎉 項目準備就緒，可以部署到 GitHub Pages！");
  console.log("\n下一步:");
  console.log("1. git add .");
  console.log('2. git commit -m "Ready for deployment"');
  console.log("3. git push origin main");
  console.log("4. 到 GitHub 倉庫啟用 Pages");
} else {
  console.log("❌ 請修正上述問題後再部署");
  process.exit(1);
}
