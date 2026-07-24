(() => {
  "use strict";

  const sceneConfigs = [
    {
      id: "air-scenes",
      page: "systems",
      host: "#systems",
      insertBefore: "#systems .system-grid",
      selector: "#systems .system-scene-card",
      eyebrow: "Space Climate Browser",
      title: "选择空间，查看空气系统如何回应真实生活",
      labels: ["餐厨会客", "主卧睡眠", "长辈房", "儿童房", "阅读书房", "茶室", "收藏空间", "影音室", "电竞房", "冥想瑜伽", "厨房", "卫浴"]
    },
    {
      id: "water-scenes",
      page: "water-supply-drainage",
      host: "#water-supply-drainage",
      insertBefore: "#water-supply-drainage .water-proof-scene",
      selector: "#water-supply-drainage .water-proof-scene[data-water-state]",
      eyebrow: "Water Life Browser",
      title: "选择用水场景，查看一条完整的到达与离开路径",
      labels: ["晨间洗漱", "厨房备餐", "沐浴", "排水", "庭院", "柔和淋浴", "岛台", "直饮", "鲜水循环", "厨房纯水", "静音排水", "平衡供水", "热水循环", "自动冲洗", "污水提升", "雨水提升"]
    },
    {
      id: "basement-scenes",
      page: "basement-system",
      host: "main",
      insertBefore: "#basement-sport-layer",
      selector: "main > .basement-showcase",
      eyebrow: "Below-Ground Life Browser",
      title: "地下空间不必一次看完，选择您关心的生活场景",
      labels: ["运动空间", "阅读空间", "餐叙空间", "茶室", "雪茄房", "酒窖", "游戏影音", "聚会空间", "冥想空间"]
    },
    {
      id: "delivery-stages",
      page: "delivery",
      host: "main",
      insertBefore: "#constraints",
      selector: "main > :is(#constraints, #delivery-brief, #integration, #delivery, #team-execution, #delivery-commissioning, #process, #delivery-result)",
      eyebrow: "Delivery Stage Browser",
      title: "从一户一方案到长期运行，看见专业如何形成闭环",
      labels: ["需求与边界", "现场勘察", "计算与建模", "图纸与交底", "自有施工", "检测与调试", "安全文明", "售后运维"],
      order: ["constraints", "delivery-brief", "integration", "delivery", "team-execution", "delivery-commissioning", "process", "delivery-result"]
    }
  ];
  const activeSceneState = {};
  let initializedPage = null;
  let settleTimer;

  const normalizeDeliveryStages = () => {
    if (document.body.dataset.page !== "delivery") return;
    document.querySelectorAll("main > :is(#constraints, #delivery-brief, #integration, #delivery, #team-execution, #delivery-commissioning, #process, #delivery-result)").forEach((stage) => {
      // Earlier layout scripts lock the old split layout with inline !important
      // declarations. These stages now inherit their complete scene treatment
      // from the final delivery stylesheet instead.
      stage.removeAttribute("style");
      stage.querySelectorAll("*").forEach((node) => node.removeAttribute("style"));
    });
  };

  const setImportantStyles = (element, styles) => {
    if (!element) return;
    Object.entries(styles).forEach(([property, value]) => {
      if (element.style.getPropertyValue(property) !== value || element.style.getPropertyPriority(property) !== "important") {
        element.style.setProperty(property, value, "important");
      }
    });
  };

  const lockDeliveryEditorialLayout = () => {
    if (document.body.dataset.page !== "delivery") return;
    const isMobile = window.innerWidth <= 760;
    const mediaLeftStages = new Set(["delivery-brief", "delivery", "delivery-commissioning", "delivery-result"]);
    const stageAccents = {
      constraints: "#0d9f91",
      "delivery-brief": "#d89a20",
      integration: "#2f68d8",
      delivery: "#d95757",
      "team-execution": "#7659c9",
      "delivery-commissioning": "#0e91a3",
      process: "#d87520",
      "delivery-result": "#2d9568"
    };
    const sections = Array.from(document.querySelectorAll("main > :is(#fit, #constraints, #delivery-brief, #integration, #delivery, #team-execution, #delivery-commissioning, #process, #delivery-result)"));
    sections.forEach((section) => {
      const hidden = section.classList.contains("is-scene-browser-hidden");
      const isOpening = section.id === "fit";
      const mediaOnLeft = mediaLeftStages.has(section.id);
      const accent = stageAccents[section.id] || "#0d7772";
      setImportantStyles(section, {
        display: isOpening ? "block" : (hidden ? "none" : "block"),
        position: "relative",
        width: isMobile ? "calc(100vw - 34px)" : "min(1704px, calc(100vw - 48px))",
        "max-width": "none",
        "min-height": "0",
        margin: "clamp(56px, 6vw, 88px) auto 0",
        padding: "0",
        overflow: "visible",
        border: "0",
        "border-radius": "0",
        background: "transparent"
      });
      const copy = section.querySelector(":scope > .section-copy");
      setImportantStyles(copy, {
        position: "relative",
        display: isOpening || isMobile ? "block" : "grid",
        "grid-template-columns": isOpening || isMobile ? "none" : "minmax(390px, .9fr) minmax(0, 1.1fr)",
        "column-gap": isOpening || isMobile ? "0" : "clamp(42px, 5vw, 82px)",
        "row-gap": isOpening || isMobile ? "0" : "0",
        "align-items": isOpening || isMobile ? "initial" : "center",
        width: "100%",
        "max-width": "none",
        "min-height": "0",
        margin: "0",
        padding: isOpening || isMobile ? "0" : "clamp(30px, 3vw, 44px) 0 0",
        "border-top": isOpening || isMobile ? "0" : `3px solid ${accent}`,
        color: "#182033",
        background: "transparent",
        overflow: "visible"
      });
      copy?.querySelectorAll(":scope > :not(figure)").forEach((node) => {
        setImportantStyles(node, {
          position: "relative",
          "z-index": "auto",
          width: isOpening ? "min(920px, 100%)" : (isMobile ? "calc(100% - 44px)" : "100%"),
          "max-width": isOpening ? "920px" : (isMobile ? "calc(100% - 44px)" : "none"),
          "margin-left": "0",
          "margin-right": "0",
          "grid-column": isOpening || isMobile ? "auto" : (mediaOnLeft ? "2" : "1"),
          color: "#182033",
          "text-align": "left"
        });
      });
      setImportantStyles(copy?.querySelector(":scope > .eyebrow"), {
        color: accent,
        "grid-row": isOpening || isMobile ? "auto" : "1",
        "margin-top": "0",
        "margin-bottom": "14px"
      });
      setImportantStyles(copy?.querySelector(":scope > h2"), {
        color: "#182033",
        "grid-row": isOpening || isMobile ? "auto" : "2",
        "font-size": isMobile ? "clamp(30px, 7.8vw, 36px)" : "clamp(30px, 2.5vw, 40px)",
        "font-weight": "520",
        "line-height": "1.36",
        "letter-spacing": "0",
        "margin-top": "0",
        "margin-bottom": "22px"
      });
      copy?.querySelectorAll(":scope > p:not(.eyebrow)").forEach((node) => {
        setImportantStyles(node, {
          "grid-row": isOpening || isMobile ? "auto" : "3",
          color: "rgba(24, 32, 51, 0.72)",
          "font-size": "16px",
          "line-height": "1.95",
          "margin-top": "0",
          "margin-bottom": "16px",
          "text-shadow": "none"
        });
      });
      setImportantStyles(copy?.querySelector(":scope > blockquote"), {
        "grid-row": isOpening || isMobile ? "auto" : "5",
        padding: "0 0 0 18px",
        color: "rgba(24, 32, 51, 0.78)",
        "font-size": "15px",
        "line-height": "1.85",
        "margin-top": "0",
        "margin-bottom": "0",
        "border-left": `3px solid ${accent}`,
        background: "transparent"
      });
      setImportantStyles(copy?.querySelector(":scope > .delivery-stage-proof"), {
        "grid-row": isOpening || isMobile ? "auto" : "4"
      });
      const media = section.querySelector(":scope .delivery-scene-media");
      setImportantStyles(media, {
        position: "relative",
        "z-index": "auto",
        inset: "auto",
        display: "block",
        "grid-column": isOpening || isMobile ? "auto" : (mediaOnLeft ? "1" : "2"),
        "grid-row": isOpening || isMobile ? "auto" : "1 / span 5",
        width: "100%",
        "max-width": "none",
        height: "auto",
        "min-height": "0",
        "aspect-ratio": isOpening ? (isMobile ? "4 / 3" : "2.2 / 1") : (isMobile ? "16 / 9" : "3 / 2"),
        margin: isOpening || isMobile ? "clamp(30px, 4vw, 48px) 0 0" : "0",
        "border-radius": isMobile ? "8px" : "8px",
        overflow: "hidden",
        background: "#101b2d"
      });
      setImportantStyles(media?.querySelector("img"), {
        position: "static",
        inset: "auto",
        display: "block",
        width: "100%",
        height: "100%",
        "min-height": "0",
        "object-fit": "cover",
        filter: "saturate(1.04) contrast(1.02) brightness(0.98)",
        "border-radius": "inherit"
      });
      setImportantStyles(section.querySelector(":scope > .section-bridge"), { display: "none" });
    });
    const opening = document.querySelector("main > #fit");
    setImportantStyles(opening, {
      display: "flex",
      "flex-direction": "column",
      gap: "0",
      "row-gap": "0",
      "column-gap": "0"
    });
    setImportantStyles(opening?.querySelector(":scope > .delivery-scene-media"), { order: "1" });
    setImportantStyles(opening?.querySelector(":scope > .section-copy"), {
      order: "2",
      width: "100%",
      "max-width": "none",
      margin: "0",
      padding: isMobile ? "34px 24px 38px" : "clamp(44px, 4.5vw, 70px)",
      "border-radius": isMobile ? "0 0 8px 8px" : "0 0 8px 8px",
      color: "#f7fbfa",
      background: "#173f4b"
    });
    setImportantStyles(opening?.querySelector(":scope > .delivery-scene-media"), {
      margin: "0",
      "border-radius": "8px 8px 0 0"
    });
    setImportantStyles(opening?.querySelector(":scope > .zf-delivery-optimization"), {
      order: "3"
    });
    const optimization = opening?.querySelector(":scope > .zf-delivery-optimization");
    setImportantStyles(optimization, {
      color: "#182033",
      background: "#ffffff"
    });
    setImportantStyles(optimization?.querySelector(":scope > header h2"), {
      color: "#182033",
      "text-shadow": "none"
    });
    setImportantStyles(optimization?.querySelector(":scope > header > p:last-child"), {
      color: "rgba(24, 32, 51, 0.68)",
      "text-shadow": "none"
    });
    setImportantStyles(optimization?.querySelector(":scope > .zf-delivery-optimization-equation"), {
      color: "rgba(24, 32, 51, 0.78)",
      "text-shadow": "none"
    });
    optimization?.querySelectorAll(".zf-delivery-optimization-flow p").forEach((node) => {
      setImportantStyles(node, {
        color: "rgba(24, 32, 51, 0.66)",
        "text-shadow": "none"
      });
    });
    setImportantStyles(opening?.querySelector(".delivery-hero-copy > .eyebrow"), {
      width: "100%",
      "max-width": "none",
      color: "#f1b94a"
    });
    setImportantStyles(opening?.querySelector(".delivery-hero-copy > h2"), {
      width: "100%",
      "max-width": "none",
      color: "#ffffff",
      "font-size": isMobile ? "clamp(32px, 8.6vw, 40px)" : "clamp(42px, 4vw, 58px)",
      "line-height": "1.22",
      "white-space": isMobile ? "normal" : "nowrap"
    });
    setImportantStyles(opening?.querySelector(".delivery-hero-copy > .delivery-hero-lead"), {
      width: isMobile ? "100%" : "min(840px, 100%)",
      "max-width": isMobile ? "100%" : "840px",
      color: "rgba(247, 251, 250, 0.82)"
    });
    setImportantStyles(opening?.querySelector(".delivery-hero-copy > blockquote"), {
      width: isMobile ? "100%" : "min(840px, 100%)",
      "max-width": isMobile ? "100%" : "840px",
      color: "#ffffff",
      "border-left": "3px solid #f1b94a"
    });
    const principles = opening?.querySelector(".delivery-hero-principles");
    setImportantStyles(principles, {
      display: "grid",
      "grid-template-columns": isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
      gap: "0",
      width: "100%",
      "max-width": "none",
      margin: "30px 0 0",
      color: "#f7fbfa",
      "border-top": "1px solid rgba(247, 251, 250, 0.2)",
      "border-bottom": "1px solid rgba(247, 251, 250, 0.2)"
    });
    const principleAccents = ["#f1b94a", "#74d3c8", "#ff8d76"];
    principles?.querySelectorAll(":scope > span").forEach((item, index) => {
      setImportantStyles(item, {
        padding: isMobile ? "14px 0" : "16px 18px",
        color: "#f7fbfa",
        "border-right": isMobile ? "0" : "1px solid rgba(247, 251, 250, 0.18)",
        "border-bottom": isMobile ? "1px solid rgba(247, 251, 250, 0.18)" : "0"
      });
      setImportantStyles(item.querySelector("i"), { color: principleAccents[index] || "#74d3c8" });
      setImportantStyles(item.querySelector("strong"), { color: "#ffffff" });
      setImportantStyles(item.querySelector("small"), { color: "rgba(247, 251, 250, 0.66)" });
    });
  };

  const lockAirHeroSpacing = () => {
    if (document.body.dataset.page !== "systems") return;
    const compact = window.innerWidth <= 760;
    setImportantStyles(document.querySelector("#climate > .section-heading"), {
      padding: compact ? "52px 28px" : "clamp(88px, 8vw, 124px)",
      "align-content": "start"
    });
  };

  const resetSceneBrowser = (config) => {
    document.querySelector(`[data-scene-browser="${config.id}"]`)?.remove();
    document.querySelectorAll(config.selector).forEach((scene) => {
      scene.classList.remove("is-scene-browser-active", "is-scene-browser-hidden");
      scene.removeAttribute("aria-hidden");
      scene.style.removeProperty("display");
    });
  };

  const createSceneBrowser = (config) => {
    if (document.body.dataset.page !== config.page) return;
    const host = document.querySelector(config.host);
    const anchor = document.querySelector(config.insertBefore);
    const scenes = Array.from(document.querySelectorAll(config.selector));
    if (config.order) {
      scenes.sort((firstScene, secondScene) => config.order.indexOf(firstScene.id) - config.order.indexOf(secondScene.id));
    }
    if (!host || !anchor || !scenes.length) return;

    document.querySelector(`[data-scene-browser="${config.id}"]`)?.remove();

    const nav = document.createElement("section");
    nav.className = "zf-scene-browser";
    nav.dataset.sceneBrowser = config.id;
    nav.id = config.id;
    nav.style.setProperty("display", "block", "important");
    nav.innerHTML = `
      <header class="zf-scene-browser-head">
        <p>${config.eyebrow}</p>
        <h2>${config.title}</h2>
        <span>${config.id === "delivery-stages" ? "选择阶段，一次查看一个章节" : "点击切换 · 当前仅展开一个场景"}</span>
      </header>
      <div class="zf-scene-browser-tabs" role="tablist"></div>
    `;

    anchor.parentNode.insertBefore(nav, anchor);
    const tabs = nav.querySelector(".zf-scene-browser-tabs");
    const gallery = nav.querySelector(".zf-delivery-stage-gallery");

    const activate = (index, focus = false) => {
      activeSceneState[config.id] = index;
      scenes.forEach((scene, sceneIndex) => {
        const active = sceneIndex === index;
        if (!scene.dataset.sceneBrowserDisplay) {
          scene.dataset.sceneBrowserDisplay = getComputedStyle(scene).display === "none" ? "block" : getComputedStyle(scene).display;
        }
        scene.classList.toggle("is-scene-browser-active", active);
        scene.classList.toggle("is-scene-browser-hidden", !active);
        scene.setAttribute("aria-hidden", active ? "false" : "true");
        scene.style.setProperty("display", active ? scene.dataset.sceneBrowserDisplay : "none", "important");
      });
      Array.from(tabs.children).forEach((button, buttonIndex) => {
        const active = buttonIndex === index;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", active ? "true" : "false");
        button.tabIndex = active ? 0 : -1;
      });
      Array.from(gallery?.children || []).forEach((card, cardIndex) => {
        const active = cardIndex === index;
        card.classList.toggle("is-active", active);
        card.setAttribute("aria-pressed", active ? "true" : "false");
      });
      if (focus) scenes[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    scenes.forEach((scene, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.role = "tab";
      button.innerHTML = `<span>${String(index + 1).padStart(2, "0")}</span><strong>${config.labels[index] || `场景 ${index + 1}`}</strong>`;
      button.addEventListener("click", () => activate(index, false));
      tabs.appendChild(button);

      if (gallery) {
        const image = scene.querySelector("img");
        const card = document.createElement("button");
        card.type = "button";
        card.className = "zf-delivery-stage-card";
        card.setAttribute("aria-label", `查看${config.labels[index] || `阶段 ${index + 1}`}的完整说明`);
        card.innerHTML = `
          <span class="zf-delivery-stage-image">${image ? `<img src="${image.getAttribute("src")}" alt="" loading="lazy" />` : ""}</span>
          <span class="zf-delivery-stage-caption"><i>${String(index + 1).padStart(2, "0")}</i><strong>${config.labels[index] || `阶段 ${index + 1}`}</strong><em>查看这一阶段</em></span>
        `;
        card.addEventListener("click", () => activate(index, true));
        gallery.appendChild(card);
      }
    });

    const deepIndex = scenes.findIndex((scene) => scene.id && window.location.hash === `#${scene.id}`);
    const storedIndex = Math.min(activeSceneState[config.id] ?? 0, scenes.length - 1);
    activate(deepIndex >= 0 ? deepIndex : storedIndex);
  };

  const solutionContent = {
    flat: ["URBAN FLAT", "先处理高层住宅里最容易被忽略的环境波动", "外窗与风压边界、梅雨季湿负荷、卧室新风、远端热水与静音排水", "DOAS 新风除湿、柔和冷热末端、316L 平衡供水、热水循环与静音排水", "空间简洁、设备低存在、运行状态可以被持续验证"],
    duplex: ["DUPLEX HOME", "先把两层空间的温差、风量与水路组织成一个整体", "上下层负荷差、挑空区回风、楼梯串风、多点同时用水与管线竖向关系", "分层分区空气系统、竖向压力平衡、冷热水干管组织与低噪排水", "每层独立舒适，又能在同一套控制逻辑中稳定运行"],
    villa: ["PRIVATE VILLA", "别墅需要的不是更多设备，而是更清楚的系统边界", "多朝向负荷、庭院与室内空气、设备机房、长距离水路和不同使用频率", "DOAS 分区、设备集中管理、平衡供水、热水循环、庭院给排水与维护通道", "复杂系统被收进清晰秩序，长期使用依然从容"],
    basement: ["BELOW-GROUND SPACE", "先让地下空间摆脱潮、霉、闷与低位排水风险", "围护含湿、冷表面露点、氡与异味、空气滞留、暴雨和污水提升边界", "防水防潮、独立除湿通风、露点控制、污水与雨水提升及报警", "地下空间回到干爽、安静、可长期停留的住宅状态"]
  };

  const initAccessSolutions = () => {
    const detail = document.querySelector("[data-access-solution-detail]");
    const buttons = Array.from(document.querySelectorAll("[data-access-solution]"));
    if (!detail || !buttons.length || detail.dataset.ready === "true") return;
    detail.dataset.ready = "true";

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const data = solutionContent[button.dataset.accessSolution];
        if (!data) return;
        buttons.forEach((item) => item.setAttribute("aria-selected", item === button ? "true" : "false"));
        detail.classList.remove("is-switching");
        void detail.offsetWidth;
        detail.classList.add("is-switching");
        detail.innerHTML = `
          <p>${data[0]}</p>
          <h3>${data[1]}</h3>
          <div><span>重点判断</span><strong>${data[2]}</strong></div>
          <div><span>系统连接</span><strong>${data[3]}</strong></div>
          <div><span>交付目标</span><strong>${data[4]}</strong></div>
        `;
      });
    });
  };

  const init = () => {
    const activePage = document.body.dataset.page;
    if (activePage !== initializedPage) {
      normalizeDeliveryStages();
      sceneConfigs.forEach((config) => {
        if (config.page !== activePage) resetSceneBrowser(config);
      });
      sceneConfigs
        .filter((config) => config.page === activePage)
        .forEach((config) => {
          resetSceneBrowser(config);
          createSceneBrowser(config);
        });
      initializedPage = activePage;
    }
    lockDeliveryEditorialLayout();
    lockAirHeroSpacing();
    initAccessSolutions();
    const airLogic = document.querySelector("#environment-logic");
    if (document.body.dataset.page === "systems" && airLogic) {
      airLogic.style.setProperty("display", "grid", "important");
      airLogic.style.setProperty("height", "auto", "important");
      airLogic.style.setProperty("min-height", window.innerWidth > 980 ? "640px" : "0", "important");
      airLogic.style.setProperty("padding", window.innerWidth > 980 ? "clamp(34px, 4vw, 70px)" : "24px", "important");
      airLogic.style.setProperty("border", "1px solid rgba(77, 111, 189, .16)", "important");
      airLogic.style.setProperty("border-radius", window.innerWidth > 980 ? "32px" : "24px", "important");
      airLogic.style.setProperty("background", "radial-gradient(circle at 7% 8%, rgba(45, 219, 210, .19), transparent 31%), radial-gradient(circle at 91% 92%, rgba(117, 84, 255, .15), transparent 36%), #f7faff", "important");
      airLogic.style.setProperty("box-shadow", "0 24px 70px rgba(31, 52, 86, .10)", "important");
      airLogic.style.setProperty("overflow", "visible", "important");
      const airPath = airLogic.querySelector(".zf-air-logic-path");
      if (airPath) {
        airPath.style.setProperty("display", "grid", "important");
        airPath.style.setProperty("grid-template-columns", window.innerWidth > 980 ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))", "important");
        airPath.style.setProperty("align-content", "center", "important");
        airPath.style.setProperty("align-self", "center", "important");
        airPath.querySelectorAll("article").forEach((card) => {
          card.style.setProperty("transform", "none", "important");
        });
      }
    }
    const waterLogic = document.querySelector("#water-logic");
    if (document.body.dataset.page === "water-supply-drainage" && waterLogic) {
      waterLogic.style.setProperty("display", "block", "important");
      waterLogic.style.setProperty("height", "auto", "important");
      waterLogic.style.setProperty("min-height", "0", "important");
    }
    const deliveryOutputs = document.querySelector("#delivery-outputs");
    if (document.body.dataset.page === "delivery" && deliveryOutputs) {
      deliveryOutputs.style.setProperty("display", "block", "important");
      deliveryOutputs.style.setProperty("height", "auto", "important");
    }
  };

  const settleLayout = () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(init, 640);
  };

  const start = () => {
    init();
    settleLayout();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();

  window.addEventListener("hashchange", () => {
    window.requestAnimationFrame(init);
    settleLayout();
  });
  window.addEventListener("zf:routechange", () => {
    window.requestAnimationFrame(init);
    settleLayout();
  });
  window.addEventListener("resize", () => {
    lockDeliveryEditorialLayout();
    lockAirHeroSpacing();
  });
})();
