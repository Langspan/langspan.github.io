"use strict";

document.documentElement.classList.add("js-ready");

// These are illustrative states, not captured tool output or live coordination.
const scenarios = {
  conflict: {
    task: "# Adjust the same session handler",
    file: "src/auth/session.ts",
    removed: "− return session;",
    added: "+ return validateSession(session);",
    aResult: "Admitted",
    aDetail: "This file is held for this operation.",
    aHost: "Waiting for your permission",
    bResult: "Conflict · denied",
    bDetail: "src/auth/session.ts is held by Session A.",
    bHostLabel: "NEXT",
    bHost: "Choose other work or retry later",
    message: "The overlapping edit is denied. Both agents keep their own sessions.",
    kind: "FILE CONFLICT",
    caption: "A current admission makes the overlap visible before a supported edit runs. The host still owns its permission checks."
  },
  parallel: {
    task: "# Add coverage while Session A edits",
    file: "tests/session.test.ts",
    removed: "− it(\"returns the session\", …);",
    added: "+ it(\"refreshes the session\", …);",
    aResult: "Admitted",
    aDetail: "src/auth/session.ts is held for this operation.",
    aHost: "Waiting for your permission",
    bResult: "Admitted",
    bDetail: "The requested file has no current conflict.",
    bHostLabel: "HOST",
    bHost: "Normal permission checks still apply",
    message: "Different files. Independent sessions. Both requests can proceed.",
    kind: "UNRELATED WORK",
    caption: "Coordination is scoped to the requested files. Session B can work on the test while Session A holds the implementation file."
  },
  observed: {
    task: "# Tests updated in the same checkout",
    file: "tests/session.test.ts",
    removed: "− it(\"returns the session\", …);",
    added: "+ it(\"refreshes the session\", …);",
    aResult: "Result observed",
    aDetail: "The current admission has been completed.",
    aHost: "Edit reported successful",
    bResult: "Result observed",
    bDetail: "The current admission has been completed.",
    bHostLabel: "HOST",
    bHost: "Patch reported successful",
    message: "Reported results become inspectable history. Completed admissions release their files.",
    kind: "OBSERVED RESULTS",
    caption: "The supported post-tool result is recorded. A still-current admission can complete; a late result is observed without reviving an expired grant."
  }
};

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function selectScenario(name) {
  const scenario = scenarios[name];
  if (!scenario) return;
  document.querySelectorAll("[data-scenario]").forEach(function (button) {
    button.setAttribute("aria-pressed", String(button.dataset.scenario === name));
  });
  setText("#agent-b-task", scenario.task);
  setText("#agent-b-file", scenario.file);
  setText("#agent-b-code .line-remove", scenario.removed);
  setText("#agent-b-code .line-add", scenario.added);
  setText("#agent-a-result .result-word", scenario.aResult);
  setText("#agent-a-result .result-detail", scenario.aDetail);
  setText("#agent-a-result .host-state span:last-child", scenario.aHost);
  setText("#agent-b-result .result-word", scenario.bResult);
  setText("#agent-b-result .result-detail", scenario.bDetail);
  setText("#agent-b-result .host-state-label", scenario.bHostLabel);
  setText("#agent-b-result .host-state span:last-child", scenario.bHost);
  setText("#coordination-message", scenario.message);
  setText("#coordination-kind", scenario.kind);
  setText("#scenario-caption", scenario.caption);
  document.querySelector("#agent-b-result").classList.toggle("result-conflict", name === "conflict");
}

document.querySelectorAll("[data-scenario]").forEach(function (button) {
  button.addEventListener("click", function () {
    selectScenario(button.dataset.scenario);
  });
});

document.querySelectorAll("[data-copy]").forEach(function (button) {
  button.addEventListener("click", async function () {
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error("Clipboard unavailable");
      await Promise.race([
        navigator.clipboard.writeText(button.dataset.copy),
        new Promise(function (_, reject) { window.setTimeout(function () { reject(new Error("Clipboard did not respond")); }, 1200); })
      ]);
      button.textContent = "Copied";
      setText("#copy-status", "Command copied to your clipboard.");
      window.setTimeout(function () { button.textContent = "Copy"; }, 1800);
    } catch (_) {
      button.textContent = "Select command";
      const code = button.parentElement.querySelector("code");
      const selection = window.getSelection();
      if (code && selection) {
        const range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      setText("#copy-status", "Clipboard access is unavailable. The command is selected so you can copy it.");
      window.setTimeout(function () { button.textContent = "Copy"; }, 2500);
    }
  });
});
