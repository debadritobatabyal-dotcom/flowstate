# FLOWSTATE — Free Cloud Deployment Guide

This guide explains how to deploy FLOWSTATE permanently for **$0/month** using Vercel (Frontend) and Render (Backend).

---

## 1. Deploy the Backend (Render — 100% Free)

1. Open [dashboard.render.com](https://dashboard.render.com/) and log in with GitHub.
2. Click **New +** &rarr; **Blueprint**.
3. Select your repository: `debadritobatabyal-dotcom/flowstate`.
4. Render will automatically detect [`render.yaml`](../render.yaml) and configure the Docker Web Service.
5. Click **Apply**.
6. When the build finishes (takes ~3 minutes), copy your backend service URL:
   `https://flowstate-backend-xxxx.onrender.com`

---

## 2. Deploy the Frontend (Vercel — 100% Free)

1. Open [vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **Add New...** &rarr; **Project**.
3. Import your repository: `flowstate`.
4. In the configuration screen:
   - **Root Directory:** Click `Edit` and select `frontend`.
   - **Framework Preset:** Next.js (auto-detected).
   - **Environment Variables:**
     - Key: `NEXT_PUBLIC_API_URL`
     - Value: `https://<YOUR-RENDER-BACKEND-URL>/api/v1`
5. Click **Deploy**.
6. In ~60 seconds, your frontend will be live on a permanent `.vercel.app` domain!

---

## Continuous Deployment
Whenever you push new changes to the `main` branch on GitHub:
- Vercel automatically redeploys the frontend.
- Render automatically redeploys the backend.
