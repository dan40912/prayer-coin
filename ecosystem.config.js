module.exports = {
  apps: [
    {
      name: "prayer-coin", // 你的應用名稱
      cwd: "/home/startpraynow/prayer-coin", // Next.js 專案根目錄
      script: "npm", // 用 npm 啟動
      args: "start -- --port 3000", // 執行 npm start，指定 port（可改）
      interpreter: "none", // 不要用 node 直接執行 npm
      env: {
        NODE_ENV: "production"
      },
      watch: false, // 正式環境不要 watch
      instances: 1, // 若要 cluster，可改成 "max"
      exec_mode: "fork", // "cluster" 也可，但要共用 uploads 資料夾
      max_memory_restart: "500M", // 超過記憶體上限自動重啟
      out_file: "./logs/out.log", // 一般日誌
      error_file: "./logs/error.log", // 錯誤日誌
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss"
    }
  ]
};

