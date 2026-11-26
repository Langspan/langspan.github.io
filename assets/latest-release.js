/* Follow published releases without a website deployment. Historical proof
   and feature claims stay versioned. Direct assets update as one set. */
(() => {
  'use strict';
  const endpoint = 'https://api.github.com/repos/Langspan/LangSpan.dev/releases/latest';
  const base = 'https://github.com/Langspan/LangSpan.dev/releases';
  const targets = ["aarch64-apple-darwin","x86_64-apple-darwin","x86_64-unknown-linux-gnu","aarch64-unknown-linux-gnu"];
  const by = selector => [...document.querySelectorAll(selector)];
  const state = value => document.documentElement.dataset.releaseState = value;
  state('fallback');
  // Use the public, unauthenticated endpoint. Never use URLs or HTML supplied
  // by API data. The known repository and validated tag define the links.
  function resolve(release) {
    if (!release || release.draft !== false || release.prerelease !== false ||
        !release.published_at || !/^v\d{1,8}\.\d{1,8}\.\d{1,8}$/.test(release.tag_name) ||
        !Array.isArray(release.assets)) return null;
    const tag = release.tag_name;
    const names = targets.map(t => 'langspan-' + tag + '-' + t + '.tar.gz');
    names.push('SHA256SUMS');
    if (!names.every(name => release.assets.some(a =>
      a && a.name === name && a.state === 'uploaded' && Number.isSafeInteger(a.size) && a.size > 0))) return null;
    return tag;
  }
  function apply(tag) {
    const download = base + '/download/' + tag + '/';
    // Synchronous update: version, checksums and platform links always agree.
    by('[data-release-target]').forEach(a => {
      const target = a.dataset.releaseTarget;
      if (targets.includes(target)) a.href = download + 'langspan-' + tag + '-' + target + '.tar.gz';
    });
    by('[data-release-checksums]').forEach(a => a.href = download + 'SHA256SUMS');
    by('[data-release-tag-link]').forEach(a => a.href = base + '/tag/' + tag);
    by('[data-release-version]').forEach(n => n.textContent = tag);
    by('[data-release-number]').forEach(n => n.textContent = tag.slice(1));
    state('ready');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  fetch(endpoint, {credentials:'omit', signal:controller.signal})
    .then(response => response.ok ? response.json() : null)
    .then(resolve)
    .then(tag => { if (tag) apply(tag); })
    .catch(() => {}) // The last verified, labeled version stays usable.
    .finally(() => clearTimeout(timeout));
})();
