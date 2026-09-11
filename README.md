# CURVE Replay Demo Library

This directory contains anonymous, replay-only demonstrations for the CURVE
action-chunk replanning study on LIBERO-10.

## Demo website

Open `index.html` to browse the website. All scripts, styles, still images,
catalog data, and videos are included in this directory. The website uses no
external fonts, analytics, CDN assets, or runtime package dependencies.

For a local HTTP preview, run the following from this directory and open
`http://localhost:8765`:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

The site includes:

- Three focused CURVE highlights with direct links to the corresponding
  eight-method comparisons.
- A main showcase with one episode for each of the ten distinct tasks.
- A separate supplemental collection for ten additional initializations.
- A synchronized eight-method player with a short outcome caption, restart,
  jump to CURVE completion, and video download. The full comparison table is
  available in a closed-by-default disclosure.
- An independent single-method player with all twenty episodes and eight methods.
- A short visual explanation of history as geometry. Internal source identifiers
  and playback settings are kept out of the main page copy.
- Responsive layouts for desktop and mobile, keyboard navigation, and reduced
  motion support.

The address preserves selected episodes and methods, so a hosted URL can be
copied to share a specific comparison. Only the selected videos are attached
to players, and video preload is disabled until requested.

For anonymous static hosting, copy **the contents of this whole directory**
to the publishing root of the anonymous repository. Use `index.html` as the
entry point. Relative asset paths support both a root URL and a repository
subpath. The included `.nojekyll` supports GitHub Pages. No build command or
backend is required. The local copy is ready for hosting; this step does not
create a remote repository or deploy a public website.

`assets/data.js` is a browser copy of the audited catalog, augmented with
poster paths. `assets/posters/` contains still frames extracted from the videos.
`assets/highlights/` contains three CURVE-only presentation clips in a separate
directory. These crop the text strip and retain the original motion through
successful completion plus one second, at the original playback speed.
When the video collection changes, regenerate these assets with the companion
website build script in the research workspace before republishing.

## Video collection

Start with the [main showcase](MAIN_SHOWCASE.md): ten different tasks, with
one selected initialization per task. The
[supplemental showcase](SUPPLEMENTAL_SHOWCASE.md) contains ten additional
initializations, including further examples of successful and earlier completion.
Each entry links to the synchronized comparison and all individual method videos,
and lists the completion steps for all eight methods.

Each selected case has one 24 fps video for each method and one synchronized
overview video containing all eight methods:

- Native
- SEAM
- RTC
- POTR
- BID-Backward
- DVAC
- PACE
- CURVE

The videos were rendered from stored action traces from the completed official
episodes. No new policy inference or strategy rollout is performed when the
videos are viewed. `catalog.json` lists the audited cases and relative video
paths without internal source paths or author metadata.

Each case therefore has nine full videos. All full videos contain 521 frames.
Single-method videos are 512x584; overview videos are 2048x1168. The final
frames are held when an episode terminates before the common 520-step display
window.

Videos are stored in separate directories:

- `single_method_videos/`: individual method demonstrations (160 videos).
- `comparison_videos/`: synchronized eight-method comparisons (20 videos).

`catalog.json` links to both directories using relative paths.

The library contains 20 selected cases from LIBERO-10, with 160 single-method
videos and 20 overviews. The overview uses a 4x2 layout, in the
method order above. DVAC and PACE follow their stored adaptive execution
horizons. Frames align by evaluator step and are presented at 24 fps.

Every selected case has CURVE marked successful and at least one comparator
that either fails or completes in more recorded execution steps on the same
task and initial state. The selection combines successful completion and
earlier completion examples. Additional initializations of the same task are
kept in the supplemental playlist so the main sequence covers ten distinct tasks.

Completion steps refer to the first successful termination in the recorded
episode, verified by replay. Earlier completion is compared between successful
methods. Failed methods are listed as unsuccessful, with no completion time.
All methods use the same playback rate and step alignment; the comparisons
show task execution progress rather than policy inference latency.

`catalog.json` includes each case's main/supplemental group, CURVE completion
step, failed comparators, and successful comparators that finish later.
`main_showcase.json` and `supplemental_showcase.json` provide ordered playlists
with relative paths for an anonymous demo site.

The three shorter presentation highlights are separate derivatives and are
additional to the 180 full videos. The full source videos remain unchanged.
