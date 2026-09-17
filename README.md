# Between Glances — GRACE demonstrations

**GRACE — Geometric Replanning with Adaptive Chunk Execution**

This collection accompanies *Between Glances: Geometric Memory for Adaptive Action Chunking*.
At each observation, the remaining plan and geometry from the preceding generation guide
how the robot continues. Stability during the current generation determines the execution
prefix; the completed generation then supplies geometric memory for the next observation.
The current recordings use `previous_only` geometry with the `variance` execution rule.

## Viewing the collection

Open `index.html`, or run this command from this directory and visit `http://localhost:8765`:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

The page contains three GRACE highlights, a [main showcase](MAIN_SHOWCASE.md) covering
all ten LIBERO-10 tasks, and ten additional initializations in the
[supplemental showcase](SUPPLEMENTAL_SHOWCASE.md). Each example offers a synchronized
comparison and eight individual players: Native, SEAM, RTC, POTR, BID-Backward,
DVAC, PACE, and GRACE. Links preserve the selected case and method.

Each comparison uses the same task, initial-state index and seed. Selection spans the seven registered seeds (7, 17, 27, 47, 57, 77, 97).
First priority is GRACE success with at least four of seven comparators unsuccessful;
second priority is GRACE completing strictly before every other successful method.
The main collection covers ten tasks, with ten further majority-failure examples.
Each scene is used only once, and each case records its seed. Aggregate performance is
reported separately in the paper. Completion steps measure recorded execution progress.
Policy inference time is excluded from the playback timeline.
Featured examples also undergo visual review for clear task completion.

## Video and data protocol

The 180 full videos contain 521 frames at 24 fps: initial frame, followed by 520 execution
steps. Terminal frames are held after an episode ends. Individual panels are 512 × 584;
eight-method comparisons are 2048 × 1168. All methods share the same step alignment.
GRACE follows its recorded actual execution prefixes; DVAC and PACE follow their stored
adaptive horizons. Replays use saved actions without new policy inference.

Three additional 512 × 512 highlights preserve GRACE motion through completion and one
second of the terminal scene. Only the title strip is cropped. Scene thumbnails and the
hero filmstrip are cropped in the same way; individual-player posters retain their labels.

`catalog.json` and `assets/data.js` contain the same current collection. The two playlist
JSON files follow its ordering. Every referenced video and poster is included locally.
There are no external fonts, analytics, CDN assets, or runtime package dependencies.

## Static hosting

Copy this entire directory to the hosting root. Relative asset paths work at a root URL
or repository subpath; `.nojekyll` is included. There is no build command or backend on
the host. Publishing is separate from preparing this local package.
