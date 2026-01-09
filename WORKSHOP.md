# 🎮 Simon Game Workshop

Welcome to the Simon Game workshop! Follow these steps to get the multiplayer Simon Says game running locally and deployed to the cloud.

---

## 📋 Prerequisites

Before starting, make sure you have:

- ✅ **Cursor IDE** installed → [Download here](https://cursor.com)
- ✅ **Node.js 18+** installed → [Download here](https://nodejs.org)
- ✅ **Git** installed → [Download here](https://git-scm.com)
- ✅ **GitHub account** → [Sign up](https://github.com)
- ✅ **Render.com account** (free tier) → [Sign up](https://render.com)

---

## Step 1: Clone and Open in Cursor

### 1.1 Open Terminal

- **Mac:** Press `Cmd + Space`, type "Terminal", press Enter
- **Windows:** Press `Win + R`, type "cmd", press Enter

### 1.2 Clone the Code

Copy and paste this command:

```bash
git clone https://github.com/itayshmool/simon-game-app-cday.git
```

### 1.3 Open in Cursor

1. Open **Cursor IDE**
2. Click **File** → **Open Folder**
3. Navigate to the `simon-game-app-cday` folder
4. Click **Open**

---

## Step 2: Setup and Run

In Cursor, open the terminal: Press **Ctrl + `** (backtick key)

### Run this command:

```bash
npm run go
```

This will install everything and start the app. You should see:
```
🎮 SIMON GAME SERVER
   🌐 HTTP:      http://localhost:3000
```

### Open in Browser

Go to: **http://localhost:5173**

🎉 **The game is running!**

---

## Step 3: Test the Game Locally

1. Click **"Create Game"**
2. Enter your name, pick an avatar
3. Click **"Create Game"**
4. Copy the **game code** (e.g., `ABC123`)
5. Open a **new browser tab**
6. Go to **http://localhost:5173**
7. Click **"Join Game"**
8. Paste the game code, enter a different name
9. Go back to first tab → Click **"Start Game"**
10. Play! 🎮

---

## Step 4: Deploy to Render

Now let's put your game online so anyone can play!

### 4.1 Create Your Own GitHub Repository

You need your own copy of the code on GitHub.

**In Cursor, open the chat (Cmd+L or Ctrl+L) and ask:**

> "Create a new public GitHub repository called simon-game-app under my account and push this code to it"

Cursor will handle everything. When done, verify at: `https://github.com/YOUR_USERNAME/simon-game-app`

---

### 4.2 Deploy on Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect your GitHub account (if prompted)
4. Select your `simon-game-app` repository
5. Click **Apply**

⏳ **Wait 5-10 minutes** for deployment.

---

### 4.3 Get Your URLs

Once deployed (green checkmarks), find your URLs:

| Service | Where to find URL |
|---------|-------------------|
| **Backend** | Click `simon-game-backend` → URL at top |
| **Frontend** | Click `simon-game-frontend` → URL at top |

📝 **Copy both URLs!**

---

### 4.4 Configure Environment Variables

#### Backend Service:
1. Click **simon-game-backend** → **Environment** (left sidebar)
2. Set `FRONTEND_URL` = your frontend URL
3. Click **Save Changes**

#### Frontend Service:
1. Click **simon-game-frontend** → **Environment** (left sidebar)
2. Set `VITE_API_URL` = your backend URL
3. Set `VITE_SOCKET_URL` = your backend URL
4. Click **Save Changes**

⏳ Wait for redeploy (green checkmark).

---

### 4.5 Test Online

1. Open your **frontend URL** in browser
2. Create a game
3. Share the link with a friend
4. Play together! 🎉

---

## 🎉 Congratulations!

You've successfully:
- ✅ Set up a full-stack TypeScript project
- ✅ Run a React + WebSocket app locally
- ✅ Deployed to the cloud

**Your game is live!** Share the link with friends and family.

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm run go` fails | Make sure Node.js is installed: `node --version` should show v18+ |
| App won't start | Close other terminals, try again |
| Can't connect on Render | Check environment variables are set correctly |
| WebSocket issues | Make sure URLs use `https://` not `http://` |

---

## ❓ Need Help?

Ask Cursor! Open chat (Cmd+L) and describe your problem:

> "I'm getting this error: [paste error message]"

---

**Happy coding! 🚀**
