<p align="center">
  <img src="./public/logo.png" alt="JustOneUpload Logo" width="100" />
</p>

<h1 align="center">JustOneUpload</h1>

<p align="center">
  <strong>One Upload — Zero Hassle — Total Automation</strong><br />
  A smart review-to-upload platform built for YouTubers & Editors who value time
</p>

---

## What is JustOneUpload?

**JustOneUpload** is an intelligent collaboration platform designed to automate the entire post-production flow between **YouTubers and Editors**

No more link sharing, no more huge downloads, no more “did you upload it yet?” — JOU streamlines the entire **video approval and publishing process**

Whether you're a content creator managing multiple editors or an editor tired of re-sending large files, JustOneUpload saves your time, bandwidth, and energy

## The Real-World Problem

### Traditional Flow (Time-wasting and Error-prone) :

- A **YouTuber** records a raw video (around X GB)
- They send it to an **Editor**, who edits and returns the final version - estimated X GB
- The **YouTuber** then :
  - Downloads the final file/video
  - Reviews it locally
  - Manually uploads it to YouTube
- If re-editing is needed, this entire process repeats
- Problems arise :
  - Uploads are slow or fail on weak internet
  - Entire workflow depends on manual steps
  - Hours wasted just transferring files back and forth
  - If re-edits needed, still youtuber have to download video, then suggest the re-edits

The result? Broken workflows, missed deadlines, and fatigue for both creators and editors

## Solution — JustOneUpload

JustOneUpload simplifies the entire chain :

- Editors upload the edited video to a shared workspace(created by youtuber)
- YouTubers review and approve videos — no download needed
- Once approved, the video is automatically schedule for publishing to YouTube via secure OAuth

No more resending files, no more wasted hours — just one click to review, one click to upload

## Impact That Matters

- 90% time saved on file transfers and uploads
- 3x faster video pipeline for creators
- Secure YouTube integration — no password sharing
- Ideal for remote teams and channels with multiple editors
- Works on any connection — even with limited bandwidth

---

## Features

- Secure OAuth 2.0 YouTube Integration
- Role-based Workspaces (YouTuber ↔ Editor)
- One-click Video Reviews and Approvals
- Advanced Scheduling System (similar to YouTube Studio)
- Dashboard with Analytics and Upload History
- User notify at every step via mails

## Getting Started

Clone the repository and get it running in minutes

```bash
# Clone the repository
git clone https://github.com/Harshiile/justoneupload.git

# Navigate into the project directory
cd justoneupload/

# Install dependencies
npm install

# Build the project
npm run build

# Start the Redis worker (for scheduled uploads)
npm run worker

# Start the backend server
npm run start
```
