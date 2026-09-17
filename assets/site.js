/* All outcomes and video paths come from the audited, local episode catalog. */
(() => {
  "use strict";
  const data = window.GRACE_DEMO;
  const $ = (id) => document.getElementById(id);
  if (!data || !Array.isArray(data.cases) || !data.cases.length) {
    $("collection-description").textContent =
      "The episode catalog could not be loaded. Open MAIN_SHOWCASE.md to browse the videos.";
    return;
  }
  const labels = [
    "Soup & sauce into basket",
    "Cheese & butter into basket",
    "Moka pot on the stove",
    "Bowl into drawer",
    "Two mugs onto plates",
    "Book into the caddy",
    "Mug & pudding placement",
    "Soup & cheese into basket",
    "Two pots on the stove",
    "Mug into microwave",
  ];
  const byId = new Map(data.cases.map((episode) => [episode.case_id, episode]));
  const categories = [
    "Sequential placement",
    "Sequential placement",
    "Stove interaction",
    "Open, place, close",
    "Object arrangement",
    "Pick and place",
    "Object arrangement",
    "Sequential placement",
    "Sequential placement",
    "Open, place, close",
  ];
  const exampleNumber = (episode) =>
    data.cases
      .filter((entry) => entry.task_id === episode.task_id)
      .findIndex((entry) => entry.case_id === episode.case_id) + 1;
  const fps = data.fps;
  const totalSteps = data.cases[0].methods[0].rendered_frames - 1;
  const video = $("comparison-video");
  const singleVideo = $("single-video");
  const state = {
    group: "main",
    task: "all",
    episode: null,
    single: null,
    method: "GRACE",
  };
  let cancelSeek = () => {};
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const title = (value) => value.charAt(0).toUpperCase() + value.slice(1);
  const code = (episode) =>
    `${categories[episode.task_id]} · Example ${exampleNumber(episode)}`;
  const list = (values) =>
    values.length < 2
      ? values.join("")
      : `${values.slice(0, -1).join(", ")} and ${values.at(-1)}`;

  function readLocation() {
    const params = new URL(window.location.href).searchParams;
    const selected = byId.get(params.get("case"));
    state.group =
      selected?.showcase_group ||
      (params.get("collection") === "supplemental" ? "supplemental" : "main");
    state.episode =
      selected ||
      data.cases.find((episode) => episode.showcase_group === state.group);
    state.single = byId.get(params.get("single")) || state.episode;
    state.method = data.methods.includes(params.get("method"))
      ? params.get("method")
      : "GRACE";
    state.task = "all";
  }

  function saveLocation() {
    const address = new URL(window.location.href);
    address.searchParams.set("case", state.episode.case_id);
    address.searchParams.set("collection", state.group);
    address.searchParams.set("single", state.single.case_id);
    address.searchParams.set("method", state.method);
    // file:// viewers may disallow history changes; playback still works.
    try {
      window.history.replaceState(null, "", address);
    } catch (_) {
      /* Local browser policy. */
    }
  }

  function visibleCases() {
    return data.cases.filter(
      (episode) =>
        episode.showcase_group === state.group &&
        (state.task === "all" || episode.task_id === Number(state.task)),
    );
  }

  function renderCards() {
    document.querySelectorAll("[data-group]").forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.group === state.group),
      );
    });
    $("task-filter").value = state.task;
    const collectionSize = data.cases.filter(
      (episode) => episode.showcase_group === state.group,
    ).length;
    $("collection-description").textContent =
      state.group === "main"
        ? "Explore ten different tasks."
        : `${collectionSize} more examples, with new starting scenes for familiar tasks.`;
    $("case-grid").replaceChildren();
    const cases = visibleCases();
    if (!cases.length) {
      const message = document.createElement("p");
      message.className = "muted";
      message.textContent =
        "Explore this task in Featured tasks, or choose another task here.";
      $("case-grid").append(message);
    }
    cases.forEach((episode) => {
      const button = document.createElement("button");
      const failures = episode.advantage.failed_comparators.length;
      const badge = failures ? "Successful completion" : "Earlier completion";
      button.type = "button";
      button.className = "case-card";
      button.dataset.case = episode.case_id;
      button.setAttribute(
        "aria-pressed",
        String(episode.case_id === state.episode.case_id),
      );
      button.setAttribute(
        "aria-label",
        `${labels[episode.task_id]}. Example ${exampleNumber(episode)}. ${badge}`,
      );
      button.innerHTML = `<span class="case-card-image"><img src="${escape(episode.thumbnail)}" alt="" width="512" height="512" loading="lazy"><span class="card-play" aria-hidden="true">▶</span></span><span class="case-card-body"><span class="case-card-title">${escape(labels[episode.task_id])}</span><span class="case-card-outcome">${badge}</span>${state.group === "supplemental" ? `<span class="case-card-meta">Example ${exampleNumber(episode)}</span>` : ""}</span>`;
      button.addEventListener("click", () => {
        state.episode = episode;
        renderComparison();
        saveLocation();
        document
          .querySelectorAll(".case-card")
          .forEach((card) =>
            card.setAttribute(
              "aria-pressed",
              String(card.dataset.case === episode.case_id),
            ),
          );
        $("comparison-viewer").scrollIntoView({
          block: "start",
          behavior: reducedMotion() ? "instant" : "smooth",
        });
        $("case-title").setAttribute("tabindex", "-1");
        $("case-title").focus({ preventScroll: true });
      });
      $("case-grid").append(button);
    });
    $("comparison-viewer").hidden = !cases.length;
  }

  function reducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function setMedia(element, path, poster) {
    element.pause();
    element.removeAttribute("src");
    if (element.dataset.blobUrl) {
      URL.revokeObjectURL(element.dataset.blobUrl);
      delete element.dataset.blobUrl;
    }
    element.poster = poster;
    element.dataset.source = path;
    element.preload = "none";
    element.controls = false;
    $(element === video ? "play-comparison" : "play-single").hidden = false;
    element.load();
  }

  function ensureMedia(element) {
    if (!element.getAttribute("src")) {
      element.src = element.dataset.source;
      element.controls = true;
      $(element === video ? "play-comparison" : "play-single").hidden = true;
    }
  }

  async function playMedia(element) {
    ensureMedia(element);
    try {
      await element.play();
    } catch (error) {
      if (error.name !== "AbortError") {
        $(element === video ? "comparison-error" : "single-error").hidden =
          false;
      }
    }
  }

  function renderComparison() {
    cancelSeek();
    $("comparison-error").hidden = true;
    $("jump-completion").disabled = false;
    $("comparison-results").open = false;
    const episode = state.episode;
    const advantage = episode.advantage;
    $("case-code").textContent = code(episode);
    $("case-title").textContent = title(episode.description);
    const cases = visibleCases();
    const position =
      Math.max(
        0,
        cases.findIndex((entry) => entry.case_id === episode.case_id),
      ) + 1;
    $("case-position").textContent =
      `${String(position).padStart(2, "0")} / ${String(cases.length).padStart(2, "0")}`;
    $("current-step").textContent = "000";
    $("download-comparison").href = episode.overview_video;
    $("comparison-error-link").href = episode.overview_video;
    $("jump-completion").title = "See the scene when GRACE completes the task";
    video.setAttribute(
      "aria-label",
      `Eight-method comparison: ${episode.description}, example ${exampleNumber(episode)}`,
    );
    setMedia(video, episode.overview_video, episode.poster);
    const parts = [];
    if (advantage.failed_comparators.length) {
      const count = advantage.failed_comparators.length;
      const others =
        count === 7
          ? "all seven other methods"
          : `${count} comparison ${count === 1 ? "method" : "methods"}`;
      parts.push(
        `<strong>GRACE completes the task</strong> where ${others} ${count === 1 ? "does" : "do"} not.`,
      );
    }
    if (advantage.faster_than.length) {
      const count = advantage.faster_than.length;
      parts.push(
        `${advantage.failed_comparators.length ? "It also finishes" : "GRACE finishes"} earlier than <strong>${count} other successful ${count === 1 ? "method" : "methods"}</strong>.`,
      );
    }
    if (
      advantage.earliest_successful_completion &&
      advantage.tied_completion.length
    ) {
      parts.push(
        `It shares the earliest finish with ${escape(list(advantage.tied_completion))}.`,
      );
    }
    $("advantage-summary").innerHTML = parts.join(" ");
    $("result-rows").innerHTML = episode.methods
      .map((method) => {
        const steps = method.success ? method.recorded_action_steps : "—";
        const ours = method.method === "GRACE";
        const width = method.success
          ? (100 * method.recorded_action_steps) / totalSteps
          : 0;
        return `<tr${ours ? ' class="ours"' : ""}><th scope="row">${escape(method.method)}${ours ? "<span>ours</span>" : ""}</th><td class="timeline-cell"><div class="step-track${method.success ? "" : " failed"}" aria-hidden="true"><span class="step-bar" style="width:${width}%"></span></div></td><td class="${method.success ? "outcome-success" : "outcome-failure"}">${method.success ? "Success" : "Unsuccessful"}</td><td class="number">${steps}</td></tr>`;
      })
      .join("");
  }

  function updateStep() {
    $("current-step").textContent = String(
      Math.min(totalSteps, Math.floor(video.currentTime * fps + 1e-5)),
    ).padStart(3, "0");
  }

  function seekComparison(step) {
    cancelSeek();
    ensureMedia(video);
    video.pause();
    const target = (step + (step ? 0.05 : 0)) / fps;
    const events = [
      "loadedmetadata",
      "progress",
      "loadeddata",
      "canplaythrough",
      "durationchange",
    ];
    const controller = new AbortController();
    let active = true;
    let loadingLocalCopy = false;
    const loadLocalCopy = async () => {
      loadingLocalCopy = true;
      try {
        const response = await fetch(video.dataset.source, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Video download failed");
        const blob = await response.blob();
        if (!active) return;
        video.dataset.blobUrl = URL.createObjectURL(blob);
        video.src = video.dataset.blobUrl;
        video.load();
      } catch (error) {
        if (error.name !== "AbortError") {
          $("comparison-error").hidden = false;
          $("jump-completion").disabled = false;
          cancelSeek();
        }
      }
    };
    const seek = () => {
      if (video.readyState < 1) return;
      // Simple static preview servers may not support byte-range requests.
      // Wait until the target is seekable instead of accepting a clamp to zero.
      let available = target === 0;
      for (let index = 0; index < video.seekable.length; index++) {
        if (
          video.seekable.start(index) <= target &&
          video.seekable.end(index) >= target
        )
          available = true;
      }
      if (!available) {
        // Chromium can expose an empty seek range on hosts without Range
        // support. A downloaded local blob permits accurate frame seeking.
        if (
          !loadingLocalCopy &&
          !video.dataset.blobUrl &&
          video.readyState >= 2 &&
          video.networkState === 1 &&
          /^https?:/.test(location.protocol)
        )
          loadLocalCopy();
        return;
      }
      cancelSeek();
      video.currentTime = target;
      $("jump-completion").disabled = false;
      updateStep();
    };
    cancelSeek = () => {
      active = false;
      controller.abort();
      events.forEach((event) => video.removeEventListener(event, seek));
    };
    $("jump-completion").disabled = true;
    events.forEach((event) => video.addEventListener(event, seek));
    video.preload = "auto";
    seek();
  }

  function renderSingle() {
    $("single-error").hidden = true;
    document.querySelector(".single-completion-details").open = false;
    const episode = state.single;
    const method = episode.methods.find(
      (entry) => entry.method === state.method,
    );
    $("single-case").value = episode.case_id;
    $("single-method-select").value = state.method;
    $("single-code").textContent = code(episode);
    $("single-task-title").textContent = title(episode.description);
    $("single-method-name").textContent = state.method;
    $("single-outcome").textContent = method.success
      ? "Success"
      : "Unsuccessful";
    $("single-outcome").className = method.success
      ? "outcome-success"
      : "outcome-failure";
    $("single-steps").textContent = method.success
      ? method.recorded_action_steps
      : "—";
    $("download-single").href = method.video;
    $("single-error-link").href = method.video;
    singleVideo.setAttribute(
      "aria-label",
      `${state.method}: ${episode.description}, example ${exampleNumber(episode)}`,
    );
    setMedia(singleVideo, method.video, method.poster);
  }

  function renderHighlights() {
    for (const item of data.highlights) {
      const article = document.createElement("article");
      article.className = "highlight-card";
      article.dataset.highlight = item.case_id;
      article.innerHTML = `<div class="highlight-player"><video playsinline preload="none" poster="${escape(item.poster)}" aria-label="GRACE: ${escape(item.description)}"></video><button type="button" class="play-overlay highlight-play"><span class="play-icon" aria-hidden="true">▶</span><span>Watch GRACE</span></button></div><p class="highlight-error media-error" role="alert" hidden>Video could not be loaded. <a href="${escape(item.video)}">Open the video</a>.</p><div class="highlight-copy"><h3>${escape(item.title)}</h3><p>${escape(item.description)}</p><button type="button" class="text-link highlight-compare">Compare this task <span aria-hidden="true">↗</span></button></div>`;
      const clip = article.querySelector("video");
      clip.dataset.source = item.video;
      article
        .querySelector(".highlight-play")
        .addEventListener("click", async (event) => {
          event.currentTarget.hidden = true;
          clip.src = item.video;
          clip.controls = true;
          try {
            await clip.play();
          } catch (error) {
            if (error.name !== "AbortError")
              article.querySelector(".highlight-error").hidden = false;
          }
        });
      clip.addEventListener("error", () => {
        article.querySelector(".highlight-error").hidden = false;
      });
      article
        .querySelector(".highlight-compare")
        .addEventListener("click", () => {
          state.episode = byId.get(item.case_id);
          state.group = state.episode.showcase_group;
          state.task = "all";
          renderCards();
          renderComparison();
          saveLocation();
          $("comparison-viewer").scrollIntoView({
            block: "start",
            behavior: reducedMotion() ? "instant" : "smooth",
          });
          $("case-title").setAttribute("tabindex", "-1");
          $("case-title").focus({ preventScroll: true });
        });
      $("highlight-grid").append(article);
    }
  }

  readLocation();
  renderHighlights();
  $("hero-image").src = data.hero.frames.at(-1).image;
  $("hero-filmstrip").innerHTML = data.hero.frames
    .map(
      (frame, index) =>
        `<figure><img src="${escape(frame.image)}" alt="${["Initial scene", "GRACE executing the task", "Task completed by GRACE"][index]}" width="512" height="512"><figcaption>${["START", "IN MOTION", "COMPLETE"][index]}</figcaption></figure>`,
    )
    .join("");
  labels.forEach((label, index) => {
    const option = new Option(label, index);
    $("task-filter").add(option);
  });
  for (const group of ["main", "supplemental"]) {
    const optionGroup = document.createElement("optgroup");
    optionGroup.label = group === "main" ? "Featured tasks" : "More examples";
    data.cases
      .filter((episode) => episode.showcase_group === group)
      .forEach((episode) => {
        optionGroup.append(
          new Option(
            `${labels[episode.task_id]} · Example ${exampleNumber(episode)}`,
            episode.case_id,
          ),
        );
      });
    $("single-case").append(optionGroup);
  }
  data.methods.forEach((method) =>
    $("single-method-select").add(new Option(method, method)),
  );
  document.querySelectorAll("[data-group]").forEach((button) =>
    button.addEventListener("click", () => {
      state.group = button.dataset.group;
      state.task = "all";
      state.episode = data.cases.find(
        (episode) => episode.showcase_group === state.group,
      );
      renderCards();
      renderComparison();
      saveLocation();
    }),
  );
  $("task-filter").addEventListener("change", (event) => {
    state.task = event.target.value;
    const cases = visibleCases();
    if (cases.length) state.episode = cases[0];
    else video.pause();
    renderCards();
    if (cases.length) {
      renderComparison();
      saveLocation();
    }
  });
  $("single-case").addEventListener("change", (event) => {
    state.single = byId.get(event.target.value);
    renderSingle();
    saveLocation();
  });
  $("single-method-select").addEventListener("change", (event) => {
    state.method = event.target.value;
    renderSingle();
    saveLocation();
  });
  $("watch-grace-alone").addEventListener("click", () => {
    state.single = state.episode;
    state.method = "GRACE";
    renderSingle();
    saveLocation();
    $("single-method").scrollIntoView({
      block: "start",
      behavior: reducedMotion() ? "instant" : "smooth",
    });
    $("single-case").focus({ preventScroll: true });
  });
  $("jump-completion").addEventListener("click", () =>
    seekComparison(state.episode.advantage.grace_completion_step),
  );
  $("restart-video").addEventListener("click", () => seekComparison(0));
  $("play-comparison").addEventListener("click", () => playMedia(video));
  $("play-single").addEventListener("click", () => playMedia(singleVideo));
  ["timeupdate", "seeked", "ended"].forEach((event) =>
    video.addEventListener(event, updateStep),
  );
  document.querySelectorAll("video").forEach((player) =>
    player.addEventListener("play", () => {
      document.querySelectorAll("video").forEach((other) => {
        if (other !== player) other.pause();
      });
    }),
  );
  video.addEventListener("error", () => {
    $("comparison-error").hidden = false;
    $("jump-completion").disabled = false;
    cancelSeek();
  });
  singleVideo.addEventListener("error", () => {
    $("single-error").hidden = false;
  });
  window.addEventListener("popstate", () => {
    readLocation();
    renderCards();
    renderComparison();
    renderSingle();
  });
  renderCards();
  renderComparison();
  renderSingle();
})();
