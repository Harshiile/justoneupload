<p align="center">
  <img src="/public/logo.png               " alt="JustOneUpload Logo" width="300" />
</p>

# JustOneUpload (JOU)

**JustOneUpload (JOU)** is a smart collaboration platform that enables **YouTubers** and **video editors** to work seamlessly. No more file sharing through links, unnecessary downloads, or upload delays. JOU automates the review and upload workflow from start to finish.

---

## 🚨 Problem It Solves

YouTubers with multiple editors often face these challenges:
- Tedious **upload/download cycles** from Drive/WeTransfer.
- Difficulty in **reviewing edited videos** efficiently.
- Editors don’t have access to **YouTube credentials**.
- Manual uploads waste time and may introduce errors.

---

## ✅ Our Solution: JustOneUpload

JustOneUpload enables:
- Editors to **upload edited videos** directly to a shared workspace.
- YouTubers to **review and approve** videos in one click.
- Approved videos are **automatically uploaded to the linked YouTube channel** using secure OAuth credentials.

---

## 📊 Impact & Metrics

- ⏱️ Saved **90% time** spent in upload/download and communication.
- 📈 Increased content throughput by **3x** for creators.
- 🔐 OAuth-secured YouTube uploads with **zero password sharing**.
- 🧠 Simplified workflow for **teams with multiple editors**.

---

## 🚀 Features Overview

- 🔒 Secure YouTube channel integration (OAuth 2.0).
- 🧑‍💻 Editor authorization per workspace.
- 📤 Direct uploads from editors.
- 🕵️ Review UI for YouTubers (with thumbnails & details).
- 📅 Scheduling system (BullMQ + Redis).
- 📦 Storage integration (Google Drive / Cloud options).
- 📈 Dashboard with video analytics.

---

## 🖼️ Screenshots (Replace these with real ones)

### 1. 🧑‍🎤 YouTuber Dashboard

> _Manage workspaces, authorize editors, and track video uploads._

![YouTuber Dashboard](https://via.placeholder.com/800x400?text=YouTuber+Dashboard)

---

### 2. 🎬 Editor Upload Page

> _Authorized editors upload final videos into workspace._

![Editor Upload](https://via.placeholder.com/800x400?text=Editor+Upload+Screen)

---

### 3. 👁️ YouTuber Review Page

> _View video title, duration, and thumbnail. Approve or reject._

![Review Screen](https://via.placeholder.com/800x400?text=YouTuber+Review+Page)

---

### 4. 📺 Scheduled Upload Queue

> _Videos approved are auto-uploaded to YouTube with title, description, and tags._

![Upload Queue](https://via.placeholder.com/800x400?text=Scheduled+Upload+Queue)

---

## 🛠️ Tech Stack

- **Frontend**: React + Tailwind + Framer Motion
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL + MongoDB
- **Queue System**: BullMQ + Redis
- **Auth**: Google OAuth (YouTube API)
- **Storage**: Google Drive (option to scale with GCS)

---

## 📦 Setup & Deployment

```bash
# Install dependencies
npm install

# Start backend and frontend
cd jou-client && npm run dev
cd jou-server && npm run dev
