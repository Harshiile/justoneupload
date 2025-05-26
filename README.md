<div style="display: grid; place-items: center; text-align: center;">
  <img src="https://res.cloudinary.com/doeuywzyb/image/upload/v1748236493/nvqe46sfwmfat0ios7ds.png" alt="JOU" width="100" />
  <p style="font-size: 1.6rem; font-weight: bold;">JustOneUpload</p>
</div>

## The Problem It Solves

### Traditional Workflow (Without JOU)

- YouTuber records a raw (uncut) video, usually large in size
- The raw footage is shared with the editor (X GB)
- Editor edits the footage and sends it back to the YouTuber (X GB)
- YouTuber reviews the video, once finalized the YouTuber uploads the edited video to YouTube (X GB)

---

### Total Redundant Data Transfer : 3X GB per video

---

### Optimized Workflow With JustOneUpload

- The editor **uploads** the final edited video directly to the YouTuber's workspace
- The YouTuber **reviews** and **approves or rejects** the video directly on the platform
- Once approved, the video is **automatically uploaded to YouTube** by JOU's system
- No back-and-forth file transfers
- No need for the YouTuber to download & upload at all

---

### Bandwidth Optimization

Using JOU :
- **Only X GB is uploaded once** (by the editor)
- Total transfer : **X GB instead of 3X GB**.
- **Saves up to 2X GB** per video

---
## Tech Stacks

| Category        | Technology                                                                                            | Description                             |
| --------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------- |
| Frontend        | ![Vite](https://img.shields.io/badge/Vite-000000.svg?style=for-the-badge&logo=vite)                   | UI, Client-side Interactivity           |
| Backend         | ![Express.js](https://img.shields.io/badge/Express.js-000000.svg?style=for-the-badge&logo=express)    | API Server                              |
| Database        | ![Postgresql](https://img.shields.io/badge/Postgresql-000000.svg?style=for-the-badge&logo=postgresql) | Information Storage                     |
| Styling         | ![Tailwind](https://img.shields.io/badge/tailwind-000000.svg?style=for-the-badge&logo=tailwindcss)    | Utility-first CSS framework             |
| Realtime Commu. | ![WebSocket](https://img.shields.io/badge/WebSockets-000000.svg?style=for-the-badge&logo=socket.io)   | Live communication (e.g. Upload Status) |
| Scheduling      | ![Redis](https://img.shields.io/badge/Redis-000000.svg?style=for-the-badge&logo=redis)                | Job queues for video upload scheduling  |
| Mails           | ![NodeMailer](https://img.shields.io/badge/NodeMailer-000000?style=for-the-badge&logo=gmail)          | Notify the Users                        |
| OAuth           | ![Google Oauth](https://img.shields.io/badge/OAuth-000000.svg?style=for-the-badge&logo=google)        | Secure YouTuber authentication          |
| Cloud Storage   | ![Drive](https://img.shields.io/badge/Drive-000000.svg?style=for-the-badge&logo=googledrive)          | Storage of Videos                       |

