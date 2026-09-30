# 🎵 Background Music

The wedding site plays **"Perfect" by Ed Sheeran** softly in the background,
starting the moment a guest scrolls the page (or taps "Open Your Boarding
Pass").

## How to add the song

1. Get a legally-obtained copy of **Perfect — Ed Sheeran** (for example, the
   MP3 you own, or a licensed copy from your music service).
2. Rename the file to exactly:

   ```
   perfect.mp3
   ```

3. Drop it into this `audio/` folder so the path is:

   ```
   audio/perfect.mp3
   ```

That's it. `js/script.js` already points to `audio/perfect.mp3`, plays it, and
fades it in gently.

## What if the file is missing?

If `audio/perfect.mp3` is not present, the site **automatically falls back to a
soft, romantic ambient chord progression** (G – D – Em – C) generated live with
the Web Audio API, so the background is never silent.

## Music controls

- Music starts on the **first scroll** or when the guest opens the boarding
  pass, and begins at **0:05 (5 seconds)** to skip the quiet lead-in. Every
  loop also repeats from 0:05.
- The floating **🔊 / 🔇 button** (bottom-right) mutes or unmutes all music and
  sound effects at any time.

## Changing the start point

Open `js/script.js` and edit the value of the `START_AT` constant near the top
of the `Music` module:

```js
var START_AT = 5; // start "Perfect" from 0:05 (5 seconds)
```

> Note: Browsers only allow audio to start after a user interaction (a scroll,
> tap, or key press). The site is built to respect that: it arms the music on
> the first gesture.