"use strict";

(function () {
  const byId = (id) => document.getElementById(id);
  const prompt = (text) => ({ type: "line", tone: "prompt", text });
  const text = (value) => ({ type: "line", tone: "muted", text: value });
  const tool = (label, path) => ({ type: "tool", label, path });
  const code = (removed, added) => ({ type: "code", removed, added });
  const note = (value, tone = "", title = "") => ({ type: "note", text: value, tone, title });
  const brief = (...lines) => ({ type: "brief", lines });
  const facts = (rows) => ({ type: "facts", rows });
  const agent = (state, foot, ...blocks) => ({ state, foot, blocks });

  // All scenes are authored illustrations. They neither run agents nor report
  // recorded sessions, benchmarks, or proven changes to an agent's behavior.
  const activeAgentA = agent(
    "Working", "Native permissions stay in charge",
    prompt("Refactor session refresh."),
    tool("Edit", "src/auth/session.ts"),
    code("− return session;", "+ return refreshSession(session);"),
    note("File admitted for this operation.")
  );

  const stories = {
    overlap: {
      hosts: ["Claude Code", "Codex"],
      kicker: "One developer. Two independent agents.",
      label: "Local coordination",
      steps: ["Work starts", "Overlap found", "Other work moves", "A fresh attempt"],
      disclosure: "Illustrative local flow, not a recorded host session. Native Codex acceptance has not yet been verified. Admission is cooperative; host permissions still apply.",
      scenes: [
        {
          eyebrow: "Work starts",
          title: "Parallel sessions. One visible file claim.",
          description: "Agent A’s supported edit holds this file for a bounded time. Agent B continues in its own native session.",
          action: "Try an overlapping edit",
          focus: "a",
          a: activeAgentA,
          b: agent(
            "Exploring", "An independent native session",
            prompt("Add refresh coverage."),
            text("Checking the session flow…"),
            tool("Read", "src/auth/session.ts"),
            text("Choosing the next edit.")
          ),
          shared: { kind: "Shared work", file: "src/auth/session.ts", detail: "Current file claim · Agent A", status: "In progress" }
        },
        {
          eyebrow: "Overlap found",
          title: "The same file. A clear conflict.",
          description: "Agent B requests the file while Agent A’s claim is current. The supported edit receives a conflict before it runs.",
          action: "Choose an unrelated file",
          focus: "b",
          conflict: true,
          a: activeAgentA,
          b: agent(
            "Conflict", "This supported edit has not run",
            prompt("Update the session handler."),
            tool("apply_patch", "src/auth/session.ts"),
            note("Agent A currently holds this file.", "warning", "Overlapping edit denied"),
            text("Choose other work or make a fresh attempt later.")
          ),
          shared: { kind: "File overlap", file: "src/auth/session.ts", detail: "Agent A holds it · Agent B requested it", status: "Conflict", conflict: true }
        },
        {
          eyebrow: "Other work moves",
          title: "An overlap needn’t stop all the work.",
          description: "Agent B chooses a different file. LangSpan can admit that request while Agent A keeps its current claim.",
          action: "Complete Agent A’s edit",
          focus: "b",
          a: activeAgentA,
          b: agent(
            "Admitted", "Agent B chooses what to do next",
            prompt("Work on the refresh test first."),
            tool("apply_patch", "tests/session.test.ts"),
            code("− expect(session).toBeDefined();", "+ expect(session.expiresAt).toBeLater();"),
            note("No current conflict for this file.")
          ),
          shared: { kind: "Separate scopes", file: "session.ts + session.test.ts", detail: "Two current claims · different files", status: "Both admitted" }
        },
        {
          eyebrow: "A fresh attempt",
          title: "Finished work makes room for the next edit.",
          description: "Agent A finishes its edit and completes the current admission. Agent B makes a fresh request for the original file, with the host’s own permissions still in charge.",
          action: "Replay this story",
          focus: "b",
          a: agent(
            "Completed", "Reported result recorded",
            prompt("Refactor session refresh."),
            tool("Edit", "src/auth/session.ts"),
            note("Host reported a successful edit."),
            text("The matching current admission is complete.")
          ),
          b: agent(
            "Admitted", "A new request, with native permissions intact",
            prompt("Make a fresh attempt at the handler."),
            tool("apply_patch", "src/auth/session.ts"),
            note("No current overlapping claim."),
            text("The host still decides whether the tool may run.")
          ),
          shared: { kind: "Fresh request", file: "src/auth/session.ts", detail: "Agent A completed · new Agent B request", status: "Admitted" }
        }
      ]
    },
    context: {
      hosts: ["Claude Code", "Claude Code"],
      kicker: "Relevant peer activity, in the next prompt.",
      label: "Local peer context",
      steps: ["Peer activity", "Session starts", "Context updates", "Receipt is visible"],
      disclosure: "Illustrative local briefing, not a recording. Claude briefing receipt has been observed; this story does not prove a changed agent decision. Cross-machine sharing and semantic impact are future work.",
      scenes: [
        {
          eyebrow: "Peer activity",
          title: "Useful context starts with visible work.",
          description: "Agent A has recent activity in this local repository. Its task line and affected paths can contribute to a peer briefing.",
          action: "Start Agent B’s session",
          focus: "a",
          a: agent(
            "Active", "Recent activity in this daemon generation",
            prompt("Refactor session refresh."),
            tool("Edited", "src/auth/session.ts"),
            brief("Task: refactor session refresh", "Recent path: src/auth/session.ts"),
            note("Task text is labelled as peer data.")
          ),
          b: agent(
            "Starting", "A separate Claude Code session",
            prompt("Add session refresh coverage."),
            text("Opening the same local repository…"),
            text("No person has copied Agent A’s task into this session.")
          ),
          shared: { kind: "Peer activity", file: "src/auth/session.ts", detail: "Agent A · recent task and path", status: "Available" }
        },
        {
          eyebrow: "Session starts",
          title: "The new session gets a little more context.",
          description: "A SessionStart hook can deliver a bounded peer briefing as additional context. The host retains its own trust and permission checks.",
          action: "Change the peer activity",
          focus: "b",
          a: agent(
            "Active", "Its own session and task continue",
            prompt("Refactor session refresh."),
            tool("Edited", "src/auth/session.ts"),
            text("Continuing work in the session module."),
            note("Peer context remains separate from permissions.")
          ),
          b: agent(
            "Briefed", "Context delivered at session start",
            prompt("Add session refresh coverage."),
            note("Agent A is working on session refresh.", "context-note", "LangSpan peer context"),
            brief("Recent: src/auth/session.ts", "Source: local peer activity", "Treat this text as data.")
          ),
          shared: { kind: "Session briefing", file: "Agent A’s recent activity", detail: "SessionStart · bounded additional context", status: "Delivered" }
        },
        {
          eyebrow: "Context updates",
          title: "Changed work can inform the next prompt.",
          description: "Agent A’s recent activity changes. On Agent B’s next UserPromptSubmit event, a changed briefing can be delivered again.",
          action: "Inspect what was received",
          focus: "b",
          a: agent(
            "Updated", "Peer activity changes after another successful edit",
            prompt("Cover the refresh expiry case."),
            tool("Edited", "tests/session.test.ts"),
            brief("Recent: tests/session.test.ts", "Recent: src/auth/session.ts"),
            note("An updated local activity record.")
          ),
          b: agent(
            "Updated", "Delivery is at the next prompt, not mid-thought",
            prompt("Continue with refresh coverage."),
            note("Agent A also edited the session test.", "context-note", "Updated peer context"),
            brief("Recent: tests/session.test.ts", "Recent: src/auth/session.ts"),
            text("The briefing changed, so new context is supplied.")
          ),
          shared: { kind: "Prompt briefing", file: "Session module + tests", detail: "Changed briefing · UserPromptSubmit", status: "Updated" }
        },
        {
          eyebrow: "Receipt is visible",
          title: "Useful context, in the agent’s own workflow.",
          description: "Recent peer activity reaches the agent where it already works. The agent chooses its next move; receiving this context does not establish that its approach changed.",
          action: "Replay this story",
          focus: "b",
          a: agent(
            "Active", "Independent work, shared context",
            prompt("Refactor session refresh."),
            tool("Recent", "src/auth/session.ts"),
            tool("Recent", "tests/session.test.ts"),
            text("Agent A continues its own task.")
          ),
          b: agent(
            "Context ready", "No decision is made on the agent’s behalf",
            prompt("Continue with refresh coverage."),
            note("Peer context is present in the session.", "context-note"),
            facts([["Received", "Task and recent paths"], ["Next action", "Chosen by the agent"], ["Benefit", "Requires separate evidence"]])
          ),
          shared: { kind: "Known outcome", file: "Peer context received", detail: "Receipt is distinct from a changed decision", status: "Inspectable" }
        }
      ]
    },
    changes: {
      hosts: ["Shell / editor", "CLI + MCP"],
      kicker: "What was reported. What was seen on disk.",
      label: "Observed changes",
      steps: ["Outside the hook", "A complete scan", "Inspect the change", "Freshness matters"],
      disclosure: "Illustrative Git observation, not a recording. Scans are bounded and periodic. A disk change does not establish authorship or reveal every intermediate write.",
      scenes: [
        {
          eyebrow: "Outside the hook",
          title: "Not every write goes through a supported hook.",
          description: "A checkout file changes through a shell or editor. LangSpan has no supported post-tool record for this particular write.",
          action: "Run the next complete scan",
          focus: "a",
          a: agent(
            "File changed", "A write outside the supported edit hooks",
            prompt("Adjust the health route."),
            tool("File", "src/routes.ts"),
            code("− path: \"/status\"", "+ path: \"/health\""),
            note("No supported post-tool callback for this write.", "context-note")
          ),
          b: agent(
            "Last view", "Previous complete scan retained",
            prompt("Inspect shared checkout changes."),
            text("The last complete view is still available."),
            facts([["Path", "src/routes.ts"], ["Latest write", "Not observed yet"]])
          ),
          shared: { kind: "Last complete view", file: "src/routes.ts", detail: "A new disk change awaits observation", status: "Previous scan" }
        },
        {
          eyebrow: "A complete scan",
          title: "The next complete scan adds the missing fact.",
          description: "The bounded Git observer sees the changed file content. It records the observation without attributing the write to an agent.",
          action: "Inspect the change",
          focus: "b",
          a: agent(
            "File changed", "The original write is not rewritten",
            prompt("Adjust the health route."),
            tool("File", "src/routes.ts"),
            code("− path: \"/status\"", "+ path: \"/health\""),
            text("The changed content is now on disk.")
          ),
          b: agent(
            "Observed", "Only a complete scan updates this view",
            prompt("Inspect shared checkout changes."),
            tool("Observed", "src/routes.ts"),
            note("File content differs from the previous complete scan."),
            facts([["Source", "Git observer"], ["Author", "Unknown"]])
          ),
          shared: { kind: "Disk observation", file: "src/routes.ts", detail: "Changed content · complete scan", status: "Recorded" }
        },
        {
          eyebrow: "Inspect the change",
          title: "A useful record, with honest attribution.",
          description: "CLI and MCP make observed changes inspectable. The path and observation source are known; the author is not inferred.",
          action: "See a later incomplete scan",
          focus: "b",
          a: agent(
            "Independent", "A disk observation does not identify a writer",
            prompt("Keep working in the checkout."),
            text("Edits may come from several tools or people."),
            tool("Path", "src/routes.ts"),
            text("Authorship is not established by this scan.")
          ),
          b: agent(
            "Inspecting", "The same facts are available through MCP",
            tool("CLI", "langspan changes demo --json"),
            facts([["Path", "src/routes.ts"], ["Result", "Content changed"], ["Source", "Complete Git scan"], ["Author", "Unknown"]]),
            note("An observation, not a claim of who made it.")
          ),
          shared: { kind: "Shared record", file: "src/routes.ts", detail: "File change · author unknown", status: "Inspectable" }
        },
        {
          eyebrow: "Freshness matters",
          title: "A previous complete view stays a previous view.",
          description: "If a later scan is incomplete, the last complete baseline remains. Its freshness must be read as that earlier scan’s—not as coverage of new work.",
          action: "Replay this story",
          focus: "b",
          a: agent(
            "More work", "The checkout may change again",
            prompt("Continue with the routing task."),
            tool("File", "src/routes.ts"),
            text("New work may exist after the last complete scan."),
            note("A bounded scan can be incomplete.", "context-note")
          ),
          b: agent(
            "Previous view", "An incomplete scan does not refresh the baseline",
            tool("Overview", "Last complete observation"),
            brief("An incomplete scan keeps the previous baseline.", "That earlier view does not establish coverage of newer work."),
            note("The earlier view is retained with its original freshness.", "context-note")
          ),
          shared: { kind: "Retained baseline", file: "Last complete checkout view", detail: "Freshness still belongs to the earlier scan", status: "Not refreshed" }
        }
      ]
    }
  };

  function node(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  }

  function renderBlock(block) {
    if (block.type === "line") return node("p", "terminal-line " + block.tone, block.text);
    if (block.type === "tool") {
      const element = node("div", "tool-line");
      element.append(node("span", "tool-label", block.label), node("code", "", block.path));
      return element;
    }
    if (block.type === "code") {
      const element = node("div", "code-lines");
      element.append(node("p", "remove", block.removed), node("p", "add", block.added));
      return element;
    }
    if (block.type === "note") {
      const element = node("div", "terminal-note " + block.tone);
      const icon = node("span", "note-icon", block.tone === "warning" ? "!" : block.tone === "context-note" ? "≋" : "✓");
      icon.setAttribute("aria-hidden", "true");
      const copy = node("div");
      if (block.title) copy.append(node("strong", "", block.title));
      copy.append(node("span", "", block.text));
      element.append(icon, copy);
      return element;
    }
    if (block.type === "brief") {
      const element = node("div", "brief-lines");
      block.lines.forEach((line) => element.append(node("p", "", line)));
      return element;
    }
    const element = node("dl", "result-data");
    block.rows.forEach(([name, value]) => element.append(node("dt", "", name), node("dd", "", value)));
    return element;
  }

  function setText(id, value) {
    const element = byId(id);
    if (element) element.textContent = value;
  }

  const panel = byId("story-panel");
  const storyButtons = Array.from(document.querySelectorAll("[data-story]"));
  const stepButtons = Array.from(document.querySelectorAll("[data-step]"));
  const playButton = byId("play-toggle");
  const nextButton = byId("story-next-action");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const STEP_DURATION = 5000;
  let currentStory = "overlap";
  let currentStep = 0;
  let playing = false;
  let playTimer = null;

  function syncPlayback() {
    if (!playButton) return;
    playButton.classList.toggle("is-playing", playing);
    playButton.setAttribute("aria-pressed", String(playing));
    const atEnd = currentStep === stories[currentStory].scenes.length - 1;
    playButton.setAttribute("aria-label", playing ? "Pause walkthrough" : atEnd ? "Replay walkthrough" : "Play walkthrough");
    setText("play-label", playing ? "Pause" : atEnd ? "Replay" : "Play");
  }

  function pause() {
    if (playTimer !== null) window.clearTimeout(playTimer);
    playTimer = null;
    playing = false;
    syncPlayback();
  }

  function renderAgent(key, value, focused, conflicted, host) {
    const element = byId("agent-" + key);
    const lines = byId("agent-" + key + "-lines");
    if (!element || !lines) return;
    element.classList.toggle("is-focus", focused);
    element.classList.toggle("is-conflict", conflicted);
    setText("agent-" + key + "-title", "Agent " + key.toUpperCase());
    setText("agent-" + key + "-host", host);
    setText("agent-" + key + "-state", value.state);
    setText("agent-" + key + "-foot", value.foot);
    lines.replaceChildren(...value.blocks.map(renderBlock));
    lines.scrollTop = 0;
    lines.classList.remove("scene-enter");
    if (!reducedMotion.matches) {
      window.requestAnimationFrame(() => lines.classList.add("scene-enter"));
    }
  }

  function render() {
    const story = stories[currentStory];
    const scene = story.scenes[currentStep];
    if (!panel) return;
    panel.dataset.story = currentStory;
    panel.dataset.step = String(currentStep);
    panel.setAttribute("aria-labelledby", "tab-" + currentStory);
    setText("stage-kicker", story.kicker);
    const localLabel = panel.querySelector(".stage-local");
    if (localLabel) localLabel.textContent = story.label;
    renderAgent("a", scene.a, scene.focus === "a", false, story.hosts[0]);
    renderAgent("b", scene.b, scene.focus === "b", Boolean(scene.conflict), story.hosts[1]);
    setText("shared-kind", scene.shared.kind);
    setText("shared-file", scene.shared.file);
    setText("shared-detail", scene.shared.detail);
    setText("shared-status", scene.shared.status);
    const shared = byId("shared-work");
    if (shared) shared.classList.toggle("is-conflict", Boolean(scene.shared.conflict));
    setText("step-eyebrow", scene.eyebrow);
    setText("step-title", scene.title);
    setText("step-description", scene.description);
    setText("story-next-action", scene.action);
    setText("demo-disclosure", story.disclosure);
    setText("step-count", (currentStep + 1) + " / " + story.scenes.length);
    storyButtons.forEach((button) => {
      const selected = button.dataset.story === currentStory;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
    });
    stepButtons.forEach((button, index) => {
      const label = button.querySelector("span:last-child");
      if (label) label.textContent = story.steps[index];
      button.classList.toggle("is-current", index === currentStep);
      button.classList.toggle("is-past", index < currentStep);
      button.setAttribute("aria-label", "Step " + (index + 1) + ": " + story.steps[index]);
      if (index === currentStep) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    });
    syncPlayback();
  }

  function selectStory(name) {
    if (!Object.prototype.hasOwnProperty.call(stories, name)) return;
    pause();
    currentStory = name;
    currentStep = 0;
    render();
  }

  function selectStep(index) {
    if (!Number.isInteger(index) || index < 0 || index >= stories[currentStory].scenes.length) return;
    pause();
    currentStep = index;
    render();
  }

  function scheduleStep() {
    playTimer = window.setTimeout(() => {
      playTimer = null;
      if (!playing || document.hidden) {
        pause();
        return;
      }
      currentStep += 1;
      render();
      if (currentStep >= stories[currentStory].scenes.length - 1) pause();
      else scheduleStep();
    }, STEP_DURATION);
  }

  function startPlayback() {
    if (document.hidden) return;
    if (currentStep === stories[currentStory].scenes.length - 1) {
      currentStep = 0;
      render();
    }
    playing = true;
    syncPlayback();
    scheduleStep();
  }

  function openStory(name) {
    selectStory(name);
    const section = byId("demo");
    if (section) section.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
    if (panel) panel.focus({ preventScroll: true });
  }

  storyButtons.forEach((button, index) => {
    button.addEventListener("click", () => selectStory(button.dataset.story));
    button.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % storyButtons.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + storyButtons.length) % storyButtons.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = storyButtons.length - 1;
      else return;
      event.preventDefault();
      const next = storyButtons[nextIndex];
      selectStory(next.dataset.story);
      next.focus();
    });
  });

  stepButtons.forEach((button) => {
    button.addEventListener("click", () => selectStep(Number(button.dataset.step)));
  });
  if (nextButton) nextButton.addEventListener("click", () => {
    const nextStep = currentStep + 1;
    selectStep(nextStep === stories[currentStory].scenes.length ? 0 : nextStep);
  });
  if (playButton) playButton.addEventListener("click", () => playing ? pause() : startPlayback());
  const replayButton = byId("replay");
  if (replayButton) replayButton.addEventListener("click", () => selectStep(0));
  document.querySelectorAll("[data-start-tour]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openStory("overlap");
    });
  });
  document.querySelectorAll("[data-open-story]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openStory(button.dataset.openStory);
    });
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause();
  });
  window.addEventListener("pagehide", pause);

  const vendorButtons = Array.from(document.querySelectorAll("[data-vendor]"));
  vendorButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const vendor = button.dataset.vendor;
      if (vendor !== "claude-code" && vendor !== "codex") return;
      vendorButtons.forEach((choice) => choice.setAttribute("aria-pressed", String(choice === button)));
      const command = byId("hooks-command");
      if (command) {
        const target = command.querySelector("code") || command;
        target.textContent = [
          "./target/release/langspan hooks install " + vendor + " \\",
          "  --workspace my-project --root /path/to/project"
        ].join("\n");
      }
      setText("copy-status", "");
    });
  });

  const resetTimers = new WeakMap();
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = byId(button.dataset.copy);
      const codeElement = target && (target.querySelector("code") || target);
      if (!codeElement) return;
      const value = codeElement.textContent.trim();
      const previousTimer = resetTimers.get(button);
      if (previousTimer) window.clearTimeout(previousTimer);
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      button.textContent = "Copying…";
      setText("copy-status", "");
      let timeout;
      try {
        if (!navigator.clipboard || !window.isSecureContext) throw new Error("Clipboard unavailable");
        await Promise.race([
          navigator.clipboard.writeText(value),
          new Promise((_, reject) => {
            timeout = window.setTimeout(() => reject(new Error("Clipboard response timed out")), 1200);
          })
        ]);
        button.textContent = "Copied";
        setText("copy-status", "Command copied to your clipboard.");
      } catch (_) {
        let selected = false;
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(codeElement);
          selection.removeAllRanges();
          selection.addRange(range);
          selected = true;
        }
        button.textContent = "Copy manually";
        setText("copy-status", selected
          ? "Automatic copy was not confirmed. The command is selected so you can copy it."
          : "Automatic copy is unavailable. Copy the command from the code block.");
      } finally {
        if (timeout !== undefined) window.clearTimeout(timeout);
        button.disabled = false;
        button.removeAttribute("aria-busy");
        resetTimers.set(button, window.setTimeout(() => {
          button.textContent = "Copy";
          resetTimers.delete(button);
        }, 2400));
      }
    });
  });

  // The authored first scene also provides a useful no-JavaScript fallback.
  // Playback starts only after an explicit press of Play.
  render();
  document.documentElement.classList.add("js-ready");
})();
