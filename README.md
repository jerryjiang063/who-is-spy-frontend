# 谁是卧底 & Fig Lang Game

这是一个基于 Socket.IO 和 React 的多人在线游戏，包含两个版本：
1. 谁是卧底在线版 - 经典的谁是卧底游戏
2. Fig Lang Game - 修辞手法学习游戏，基于谁是卧底玩法，增加了惩罚环节

## 功能特点

- 多人实时对战
- 自定义词库
- 房主控制游戏流程
- 投票淘汰机制
- Fig Lang Game 版本增加了惩罚环节，失败方需要回答修辞手法相关的题目

## 技术栈

- 前端：React, Socket.IO Client, TailwindCSS, Vite
- 后端：Node.js, Express, Socket.IO

## 本地开发

### 后端

```bash
cd who-is-spy-backend
npm install
npm start
```

### 前端

```bash
cd who-is-spy-frontend
npm install
npm run dev
```

## 部署

### 构建前端

```bash
cd who-is-spy-frontend
npm run build
```

### 使用 PM2 启动后端

```bash
cd who-is-spy-backend
npm install -g pm2
pm2 start ecosystem.config.js
```

### Nginx 配置

将后端目录中的 `nginx.conf` 文件复制到 Nginx 配置目录，并重启 Nginx：

```bash
cd who-is-spy-backend
sudo cp nginx.conf /etc/nginx/sites-available/spy-game
sudo ln -s /etc/nginx/sites-available/spy-game /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 域名配置

- 谁是卧底: spyccb.top
- Fig Lang Game: figurativelanguage.spyccb.top

## 游戏规则

### 谁是卧底

1. 玩家分为平民和卧底
2. 每位玩家获得一个词语，平民词和卧底词相似但不同
3. 玩家轮流描述自己的词语，不能直接说出词语本身
4. 通过投票淘汰可疑的玩家
5. 如果卧底被淘汰，平民胜利；如果场上只剩下卧底，卧底胜利

### Fig Lang Game

基于谁是卧底规则，增加了惩罚环节：
- 如果卧底胜利，所有平民进入惩罚环节
- 如果卧底失败，卧底进入惩罚环节
- 惩罚环节中，玩家需要回答修辞手法相关的题目
- 答对可以返回大厅，答错需要继续答题直到答对
