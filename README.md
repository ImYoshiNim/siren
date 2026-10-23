# Siren

Keep the home page open in a tab. When someone presses the button on `/button`, the home page loops an alarm sound, flashes red and shows:

> ATTENTION ALL WAV, YOUR NEXT MISSION IS TO BRING ME...

The alarm keeps going until it's turned off from `/button`.

- **`/`**: the home page that plays the alarm. Leave it open.
- **`/button`**: one big button that starts and stops the alarm. Works from any device, such as your phone.

Button presses go through [Pusher](https://pusher.com), and the site runs on [Vercel](https://vercel.com).

---

## 1. Create a Pusher app (one-time)

1. Sign up at [pusher.com](https://pusher.com). The free plan is enough.
2. Create a **Channels** app. Pick any name and the cluster closest to you.
3. Open the app's **App Keys** page. It lists `app_id`, `key`, `secret` and `cluster`, which you'll need below.

## 2. Run it on your computer

You need [Node.js](https://nodejs.org) 20.6 or newer.

1. Create a file called `.env` in the project folder. Copy `.env.example` and fill in the values:

   ```
   PUSHER_APP_ID=your app_id
   PUSHER_KEY=your key
   PUSHER_SECRET=your secret
   PUSHER_CLUSTER=your cluster, e.g. ap1
   SIREN_SECRET=
   ```

2. Install and start:

   ```
   npm install
   npm start
   ```

   This runs `dev-server.js`, a small local server that serves the pages and API just like Vercel does. No Vercel account is needed for this.

3. Open http://localhost:3000, and http://localhost:3000/button in another tab.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repo and import it at [vercel.com/new](https://vercel.com/new). Alternatively, run `npx vercel` from this folder.
2. In the Vercel project, go to **Settings → Environment Variables** and add the same `PUSHER_*` values. **Vercel doesn't read your `.env` file**, so they have to be entered there.
3. Set `SIREN_SECRET` to a password you choose. Without one, anyone who finds the URL can set off the alarm.
4. Redeploy so the new variables take effect.

### If you set `SIREN_SECRET`

Open each page once with the key in the URL. The browser remembers it after that:

```
https://your-app.vercel.app/?key=YOUR_SECRET
https://your-app.vercel.app/button?key=YOUR_SECRET
```

---

## Using it

1. Open the home page and **click once to arm it**. Browsers block sound until you've clicked on a page. It should then say "Armed and listening".
2. Press the button on `/button` to start the alarm. Press it again (**TURN OFF**) to stop it.

## Optional: Siren Helper extension (Chrome / Edge)

With the extension installed, when the alarm fires the browser will:

- pause videos and audio in your other tabs, including fullscreen YouTube
- switch to the Siren tab and make the window fullscreen
- restore the window when the alarm is turned off

To install it:

1. Go to `chrome://extensions` (or `edge://extensions`).
2. Turn on **Developer mode**.
3. Click **Load unpacked** and pick the `extension` folder.
4. Reload the Siren home page.

The extension works on `localhost` and `*.vercel.app`. If you use a custom domain, add it to `matches` in [extension/manifest.json](extension/manifest.json) and reload the extension.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| No sound when the alarm fires | Click the home page once to arm it, and check the tab isn't muted. |
| "Pusher is not configured on the server" | The `PUSHER_*` variables are missing. Check `.env` locally, or the Vercel environment variables (then redeploy). |
| "Wrong or missing key" | `SIREN_SECRET` is set. Open the page once with `?key=YOUR_SECRET`. |
| Siren tab doesn't come to the front | Install the helper extension. If another app (such as a game) has focus, Windows may only flash the browser in the taskbar. |
| Reloaded the home page and the alarm shows off | Pusher only remembers the last state for 30 minutes. Press the button again. |

## Project layout

```
public/       index.html (home), button.html, siren.js (shared), default.mp3
api/          Vercel functions: trigger, stop, config
extension/    Siren Helper browser extension
dev-server.js Local server for `npm start` (not used on Vercel)
```

To change the alarm message, edit the `#message` line in `public/index.html`. To change the default sound, replace `public/default.mp3`.
