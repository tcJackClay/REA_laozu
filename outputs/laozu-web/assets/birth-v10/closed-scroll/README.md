# Source admission scroll

All art pixels come from original Unity Sprite objects in `assets/data/2k6966p.bin`, never the user's screenshot. See `manifest.json` for bundle hash, Sprite identities, atlas texture rect and UV mapping.

- `closed-scroll.png`: transparent 1105×571 image including the source hanging ornament.
- `closed-scroll-loop.png`: 32 horizontal frames, each 1105×571, sampled from the original `fx_ui_rxwd_jz_purple_loop` clip. Duration 1.0333333015441895 seconds.
- `cloud1.png`–`cloud3.png`: exact source sprite crops. Their original RectTransform dimensions and matrices are in `clouds1080x1920` of the manifest.
- `cloud1-grey.png`–`cloud3-grey.png`: brightness .55 variant calibrated to the provided runtime reference. This is an explicit presentation calibration, not a recovered shader constant. Original cloud distortion shader is not reproduced.
- `original-animation-curves.json`: original closed/open clip bindings, constant values, streamed cubic coefficients and source duration. All paths matched. Closed clip duration is 1.0333333 seconds; open clip duration is 1.3333334 seconds. Shader glow/dissolve is not baked into the closed sprite sheet.

Place the closed sprite canvas at **x=-13, y=237** within the original 1080×1920 coordinate stage. Do not scale it independently; scale the entire stage once. Transparent padding is intentional and keeps the source shake animation and ornament inside a stable canvas. At frame zero the upper shaft's visible pixels begin below the canvas top.

CSS sprite playback example (the first and last source frames meet):

```css
.source-closed-scroll {
 position:absolute; left:-13px; top:237px; width:1105px; height:571px;
 background:url('closed-scroll-loop.png') 0 0 / 3200% 100%;
 animation:source-scroll-idle 1.0333333015441895s steps(32) infinite;
}
@keyframes source-scroll-idle {to{background-position:103.2258064516% 0}}
```

This output is the scroll base and ornament. Layer clouds underneath at their source matrix positions, and retain the game's black background outside the art. Quality-colored opening effects require the corresponding source clip/material; the closed base art is shared by those variants.

## Original opening clip

`open-scroll-sheet.png` contains 24 frames in a **6-column, 4-row grid**. Each frame is **1084×1192**. Its canvas belongs at **x=-3, y=304** on the 1080×1920 stage. Playback duration is **1.3333333730697632 seconds**. The complete timing and provenance are in `open-scroll-data.json`.

For elapsed `t` seconds, pick `i=min(23,floor(clamp(t/duration,0,1)*23))`, source column `i % 6`, row `floor(i/6)`. The source sample times include both exact endpoints; interpolate the frame index if drawing through Canvas. `open-scroll-last.png` is a static end frame for holding the paper underneath live profile text. `open-scroll-first.png` is provided for initial-frame inspection.

Opening pixels use the original upper/lower shafts, base paper and ornament; every position, rotation and scale comes from the recovered `fx_ui_rxwd_jz_purple_open` cubic curves. This is not a CSS clip reveal approximation. Clouds, quality glow and the original words/dissolve shader are separate and omitted from the baked sheet; put live profile contents over the expanded paper at the appropriate confirmed time.
