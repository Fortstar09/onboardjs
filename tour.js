// tour.js — paste this as a single file and serve it
(function () {
  if (window.InitTour) return;

  const style = document.createElement("style");
  style.innerHTML = `
    .tour-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:999998;pointer-events:none}
    .tour-tooltip{position: absolute;max-width:320px;padding:12px;border-radius:10px;background:#fff;color:#111;box-shadow:0 8px 30px rgba(0,0,0,.18);z-index:999999;font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial}
    .tour-tooltip .controls{display:flex;gap:8px;margin-top:10px;justify-content:flex-end}
    .tour-tooltip button{padding:6px 10px;border-radius:8px;border:0;background:#f3f4f6;cursor:pointer}
    .tour-highlight{position:relative;z-index:1000000;box-shadow:0 0 0 4px rgba(255,255,255,0.0) !important;outline:3px solid rgba(255,255,0,0.85);border-radius:6px}
    @media (max-width:420px){ .tour-tooltip{max-width:92vw;padding:10px} }
  `;
  document.head.appendChild(style);

  function $(sel, root = document) { try { return root.querySelector(sel); } catch (e) { return null; } }

  window.InitTour = function (opts = {}) {
    const steps = Array.isArray(opts.steps) ? opts.steps : [];
    if (!steps.length) return;
    let idx = 0, overlay = null, tooltip = null, highlighted = null;

    function createOverlay() {
      overlay = document.createElement("div");
      overlay.className = "tour-overlay";
      overlay.style.pointerEvents = "auto";
      document.body.appendChild(overlay);
    }
    function removeOverlay() { if (overlay) overlay.remove(); overlay = null; }

    function showStep(i) {
      cleanupTooltip();
      const step = steps[i];
      if (!step) { endTour(); return; }

      const el = step.element ? $(step.element) : null;
      if (!el && step.element) { idx = i + 1; showStep(idx); return; }

      if (highlighted) highlighted.classList.remove("tour-highlight");
      if (el) { highlighted = el; el.classList.add("tour-highlight"); }

      if (el) el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

      tooltip = document.createElement("div");
      tooltip.className = "tour-tooltip";
      tooltip.innerHTML = `
        <div class="tour-body">
          ${step.title ? `<strong>${escapeHtml(step.title)}</strong><div style="height:6px"></div>` : ""}
          ${escapeHtml(step.text || "")}
        </div>
        <div class="controls">
          <button data-action="back">Back</button>
          <button data-action="next">${i === steps.length - 1 ? "Finish" : "Next"}</button>
          <button data-action="skip">Skip</button>
        </div>
      `;
      document.body.appendChild(tooltip);

      positionTooltip(el, tooltip, step.position || "bottom");

      tooltip.addEventListener("click", onTooltipClick);
      window.dispatchEvent(new CustomEvent("tour-step", { detail: { stepIndex: i, step } }));
    }

    function onTooltipClick(e) {
      const a = e.target.closest("button[data-action]");
      if (!a) return;
      const act = a.getAttribute("data-action");
      const stepId = steps[idx].id || `step-${idx+1}`;

      console.log({ stepId, action: act }); // <-- log here

      if (act === "next") { idx = idx + 1; if (idx >= steps.length) endTour(); else showStep(idx); }
      if (act === "back") { idx = Math.max(0, idx - 1); showStep(idx); }
      if (act === "skip") endTour();
    }

    function positionTooltip(target, tip, preferred) {
      const pad = 12, vw = window.innerWidth, vh = window.innerHeight, scrollY = window.scrollY, scrollX = window.scrollX;

      if (!target) {
        tip.style.left = Math.round((vw - tip.offsetWidth) / 2) + "px";
        tip.style.top = Math.round(scrollY + vh * 0.12) + "px";
        return;
      }

      const r = target.getBoundingClientRect();
      const positions = preferred === "top" ? ["top", "bottom", "right", "left"] : ["bottom", "top", "right", "left"];

      for (const pos of positions) {
        if (pos === "bottom") {
          let top = r.bottom + pad + scrollY;
          let left = Math.min(Math.max(r.left + scrollX, 8), vw - tip.offsetWidth - 8);
          if (top + tip.offsetHeight <= scrollY + vh) { tip.style.top = top + "px"; tip.style.left = left + "px"; return; }
        }
        if (pos === "top") {
          let top = r.top - tip.offsetHeight - pad + scrollY;
          let left = Math.min(Math.max(r.left + scrollX, 8), vw - tip.offsetWidth - 8);
          if (top >= scrollY) { tip.style.top = top + "px"; tip.style.left = left + "px"; return; }
        }
        if (pos === "right") {
          let left = r.right + pad + scrollX;
          let top = Math.min(Math.max(r.top + scrollY, scrollY + 8), scrollY + vh - tip.offsetHeight - 8);
          if (left + tip.offsetWidth <= scrollX + vw) { tip.style.left = left + "px"; tip.style.top = top + "px"; return; }
        }
        if (pos === "left") {
          let left = r.left - tip.offsetWidth - pad + scrollX;
          let top = Math.min(Math.max(r.top + scrollY, scrollY + 8), scrollY + vh - tip.offsetHeight - 8);
          if (left >= scrollX) { tip.style.left = left + "px"; tip.style.top = top + "px"; return; }
        }
      }

      // fallback center
      tip.style.left = Math.round((vw - tip.offsetWidth) / 2 + scrollX) + "px";
      tip.style.top = Math.round(scrollY + vh * 0.12) + "px";
    }

    function cleanupTooltip() {
      if (tooltip) { tooltip.removeEventListener("click", onTooltipClick); tooltip.remove(); tooltip = null; }
      if (highlighted) { highlighted.classList.remove("tour-highlight"); highlighted = null; }
    }

    function endTour() {
      cleanupTooltip();
      removeOverlay();
      window.dispatchEvent(new CustomEvent("tour-ended", {}));
    }

    function escapeHtml(s){ return String(s||"").replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

    createOverlay();
    showStep(idx);

    return {
      next: () => { idx++; showStep(idx); },
      back: () => { idx = Math.max(0, idx-1); showStep(idx); },
      end: endTour,
      goTo: (n) => { idx = Math.max(0, Math.min(n, steps.length-1)); showStep(idx); }
    };
  };
})();
