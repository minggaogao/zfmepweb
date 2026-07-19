(() => {
  const setImportant = (elements, styles) => {
    elements.forEach((element) => {
      Object.entries(styles).forEach(([property, value]) => {
        element.style.setProperty(property, value, "important");
      });
    });
  };

  const applyPageCohesion = () => {
    const compact = window.matchMedia("(max-width: 760px)").matches;

    setImportant(
      document.querySelectorAll("body[data-page='systems'] main > #climate"),
      {
        "box-sizing": "border-box",
        "width": compact ? "calc(100vw - 20px)" : "calc(100vw - 48px)",
        "max-width": compact ? "calc(100vw - 20px)" : "1704px",
        "margin-left": "auto",
        "margin-right": "auto",
        "grid-template-columns": "minmax(0, 1fr)",
        "justify-content": compact ? "center" : "stretch"
      }
    );

    setImportant(
      document.querySelectorAll("body[data-page='systems'] main #climate > .section-heading"),
      {
        "box-sizing": "border-box",
        "width": "100%",
        "max-width": "100%",
        "margin": "0",
        "padding": compact ? "34px 24px 30px" : "clamp(52px, 6vw, 88px)",
        "min-height": compact ? "680px" : "clamp(590px, 46vw, 720px)",
        "display": "grid",
        "align-content": "end",
        "justify-items": "start",
        "overflow": "hidden",
        "border-radius": compact ? "24px" : "34px",
        "box-shadow": "0 34px 90px rgba(19, 32, 59, 0.19)"
      }
    );

    setImportant(
      document.querySelectorAll("body[data-page='systems'] main #climate > .section-heading h2"),
      {
        "max-width": compact ? "100%" : "700px",
        "font-size": compact ? "39px" : "clamp(52px, 5vw, 76px)",
        "line-height": "1.08"
      }
    );

    setImportant(
      document.querySelectorAll("body[data-page='delivery'] main > #fit > .section-copy"),
      {
        "min-height": compact ? "0" : "clamp(590px, 49vw, 760px)",
        "padding": compact
          ? "0 0 38px"
          : "clamp(46px, 6vw, 92px) 0 clamp(46px, 6vw, 92px) clamp(46px, 6vw, 92px)",
        "overflow": "hidden",
        "border-radius": compact ? "24px" : "clamp(24px, 2.4vw, 36px)",
        "color": "#ffffff",
        "background": "radial-gradient(circle at 8% 12%, rgba(57, 99, 255, 0.24), transparent 28%), #111a2a",
        "box-shadow": "0 34px 90px rgba(17, 26, 42, 0.16)"
      }
    );

    setImportant(
      document.querySelectorAll("body[data-page='delivery'] main > #fit > .section-copy > :not(figure)"),
      {
        "grid-column": "1",
        "width": compact ? "auto" : "min(500px, 100%)",
        "max-width": compact ? "none" : "500px",
        "margin-left": compact ? "28px" : "0",
        "margin-right": compact ? "28px" : "clamp(28px, 4vw, 64px)"
      }
    );

    setImportant(
      document.querySelectorAll("body[data-page='project-access'] #project-access .project-access-ref-hero img"),
      {
        "position": "absolute",
        "inset": "0",
        "display": "block",
        "width": "100%",
        "height": "100%",
        "max-height": "none",
        "object-fit": "cover"
      }
    );

    setImportant(
      document.querySelectorAll("body[data-page='project-access'] #project-access .project-access-ref-intro"),
      {
        "position": "absolute",
        "top": compact ? "178px" : "clamp(220px, 22vw, 320px)",
        "right": "auto",
        "bottom": "auto",
        "left": compact ? "28px" : "clamp(44px, 6vw, 94px)",
        "width": compact ? "calc(100% - 56px)" : "min(620px, calc(100% - 120px))",
        "margin": "0",
        "padding": compact ? "0 0 0 18px" : "0 0 0 24px",
        "border": "0",
        "border-left": "2px solid rgba(126, 233, 221, 0.94)",
        "border-radius": "0",
        "background": "transparent",
        "box-shadow": "none",
        "text-align": "left",
        "backdrop-filter": "none",
        "-webkit-backdrop-filter": "none"
      }
    );

    setImportant(
      document.querySelectorAll("body[data-page='project-access'] #project-access .project-access-ref-intro h1"),
      {
        "color": "#ffffff",
        "font-family": "\"SF Pro Display\", \"PingFang SC\", sans-serif",
        "font-size": compact ? "38px" : "clamp(46px, 4.5vw, 66px)",
        "font-weight": "560",
        "line-height": "1.05",
        "letter-spacing": "-0.055em"
      }
    );

    setImportant(
      document.querySelectorAll("body[data-page='project-access'] #project-access .project-access-ref-intro p"),
      {
        "max-width": "520px",
        "margin": "18px 0 0",
        "color": "rgba(255, 255, 255, 0.72)",
        "font-size": compact ? "13px" : "clamp(14px, 1.1vw, 17px)",
        "line-height": compact ? "1.65" : "1.8"
      }
    );
  };

  const initHomeCaseSwitcher = () => {
    const buttons = [...document.querySelectorAll("[data-zf-home-case-target]")];
    const panels = [...document.querySelectorAll("[data-zf-home-case-panel]")];
    if (!buttons.length || !panels.length) return;

    const activateCase = (caseId) => {
      buttons.forEach((button) => {
        const active = button.dataset.zfHomeCaseTarget === caseId;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
        button.tabIndex = active ? 0 : -1;
      });

      panels.forEach((panel) => {
        const active = panel.dataset.zfHomeCasePanel === caseId;
        panel.hidden = !active;
        panel.classList.toggle("is-active", active);
        panel.classList.remove("is-entering");
        if (active) {
          window.requestAnimationFrame(() => panel.classList.add("is-entering"));
        }
      });
    };

    buttons.forEach((button, index) => {
      if (button.dataset.zfCaseReady === "true") return;
      button.dataset.zfCaseReady = "true";
      button.addEventListener("click", () => activateCase(button.dataset.zfHomeCaseTarget));
      button.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        let nextIndex = index;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + buttons.length) % buttons.length;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % buttons.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = buttons.length - 1;
        buttons[nextIndex].focus();
        activateCase(buttons[nextIndex].dataset.zfHomeCaseTarget);
      });
    });
  };

  const settlePageCohesion = () => {
    initHomeCaseSwitcher();
    applyPageCohesion();
    window.requestAnimationFrame(applyPageCohesion);
    window.setTimeout(applyPageCohesion, 120);
    window.setTimeout(applyPageCohesion, 520);
  };

  settlePageCohesion();
  window.addEventListener("load", settlePageCohesion, { once: true });
  window.addEventListener("resize", settlePageCohesion);
  window.addEventListener("hashchange", settlePageCohesion);
})();
