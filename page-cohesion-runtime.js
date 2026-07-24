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
        "width": compact ? "calc(100vw - 20px)" : "calc(100vw - 72px)",
        "max-width": compact ? "calc(100vw - 20px)" : "none",
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
        "max-width": compact ? "100%" : "900px",
        "font-size": compact ? "clamp(30px, 7.8vw, 36px)" : "clamp(38px, 3.15vw, 56px)",
        "line-height": "1.16"
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
        "position": "relative",
        "top": "auto",
        "right": "auto",
        "bottom": "auto",
        "left": "auto",
        "width": compact ? "calc(100% - 28px)" : "min(1480px, calc(100% - 96px))",
        "max-width": "1480px",
        "margin": compact ? "32px auto 0" : "clamp(42px, 4vw, 56px) auto 0",
        "padding": compact ? "0 10px" : "0 clamp(18px, 2.4vw, 38px)",
        "border": "0",
        "border-left": "0",
        "border-radius": "0",
        "background": "transparent",
        "box-shadow": "none",
        "text-align": "left",
        "backdrop-filter": "none",
        "-webkit-backdrop-filter": "none",
        "display": "grid",
        "grid-template-columns": compact ? "minmax(0, 1fr)" : "minmax(280px, 0.78fr) minmax(360px, 1.22fr)",
        "align-items": "center",
        "gap": compact ? "16px" : "clamp(40px, 5vw, 78px)"
      }
    );

    setImportant(
      document.querySelectorAll("body[data-page='project-access'] #project-access .project-access-ref-intro h1"),
      {
        "color": "#172232",
        "font-family": "\"SF Pro Display\", \"PingFang SC\", sans-serif",
        "font-size": compact ? "36px" : "clamp(40px, 3.7vw, 58px)",
        "font-weight": "560",
        "line-height": "1.08",
        "letter-spacing": "-0.045em"
      }
    );

    setImportant(
      document.querySelectorAll("body[data-page='project-access'] #project-access .project-access-ref-intro p"),
      {
        "max-width": "520px",
        "margin": "0",
        "color": "rgba(23, 34, 50, 0.68)",
        "font-size": compact ? "14px" : "clamp(15px, 1.05vw, 17px)",
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
