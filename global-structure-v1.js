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
      title: "从定义生活到验证运行，按阶段查看我们的工作",
      labels: ["定义生活", "项目启动", "系统深化", "设计落地", "施工协同", "调试验证", "运行复核", "长期交付"],
      order: ["constraints", "delivery-brief", "integration", "delivery", "team-execution", "delivery-commissioning", "process", "delivery-result"]
    }
  ];
  const activeSceneState = {};
  let initializedPage = null;
  let settleTimer;
  const transitionPages = new Set(["delivery", "delivery-page", "air", "systems"]);

  const beginStructureTransition = () => {
    document.documentElement.classList.add("zf-route-structure-pending");
  };

  const endStructureTransition = () => {
    window.requestAnimationFrame(() => {
      document.documentElement.classList.remove("zf-route-structure-pending");
    });
  };

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
    const sections = Array.from(document.querySelectorAll("main > :is(#fit, #constraints, #delivery-brief, #integration, #delivery, #team-execution, #delivery-commissioning, #process, #delivery-result)"));
    sections.forEach((section) => {
      const hidden = section.classList.contains("is-scene-browser-hidden");
      setImportantStyles(section, {
        display: section.id === "fit" ? "block" : (hidden ? "none" : "block"),
        position: "relative",
        width: isMobile ? "calc(100vw - 34px)" : "min(1216px, calc(100vw - 64px))",
        "max-width": "none",
        "min-height": "0",
        margin: "clamp(28px, 4vw, 64px) auto 0",
        padding: "0",
        overflow: "visible",
        border: "0",
        "border-radius": "0",
        background: "transparent"
      });
      const copy = section.querySelector(":scope > .section-copy");
      setImportantStyles(copy, {
        position: "relative",
        display: "block",
        width: "100%",
        "max-width": "none",
        "min-height": "0",
        margin: "0",
        padding: "0",
        color: "#182033",
        background: "transparent",
        overflow: "visible"
      });
      copy?.querySelectorAll(":scope > :not(figure)").forEach((node) => {
        setImportantStyles(node, {
          position: "relative",
          "z-index": "auto",
          width: isMobile ? "calc(100% - 44px)" : "min(720px, 100%)",
          "max-width": isMobile ? "calc(100% - 44px)" : "720px",
          "margin-left": "0",
          "margin-right": "0",
          color: "#182033",
          "text-align": "left"
        });
      });
      setImportantStyles(copy?.querySelector(":scope > .eyebrow"), {
        color: "rgba(24, 68, 76, 0.66)",
        "margin-top": "0",
        "margin-bottom": "14px"
      });
      setImportantStyles(copy?.querySelector(":scope > h2"), {
        color: "#182033",
        "font-size": isMobile ? "clamp(30px, 7.8vw, 36px)" : "clamp(38px, 3.15vw, 56px)",
        "line-height": "1.16",
        "margin-top": "0",
        "margin-bottom": "18px"
      });
      copy?.querySelectorAll(":scope > p:not(.eyebrow), :scope > blockquote").forEach((node) => {
        setImportantStyles(node, {
          color: "rgba(24, 32, 51, 0.72)",
          "font-size": "15px",
          "line-height": "1.85",
          "margin-top": "0",
          "margin-bottom": "12px",
          "text-shadow": "none"
        });
      });
      setImportantStyles(copy?.querySelector(":scope > blockquote"), {
        padding: "0 0 0 18px",
        "border-left": "2px solid #87c9c9",
        background: "transparent"
      });
      const media = section.querySelector(":scope .delivery-scene-media");
      setImportantStyles(media, {
        position: "relative",
        "z-index": "auto",
        inset: "auto",
        display: "block",
        width: "100%",
        height: "auto",
        "min-height": "0",
        "aspect-ratio": "16 / 9",
        margin: "clamp(28px, 3vw, 42px) 0 0",
        "border-radius": isMobile ? "24px" : "30px",
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
        filter: "saturate(0.98) contrast(1.02) brightness(0.96)",
        "border-radius": "inherit"
      });
      setImportantStyles(section.querySelector(":scope > .section-bridge"), { display: "none" });
    });
    const opening = document.querySelector("main > #fit");
    setImportantStyles(opening, {
      display: "flex",
      "flex-direction": "column"
    });
    setImportantStyles(opening?.querySelector(":scope > .delivery-scene-media"), { order: "1" });
    setImportantStyles(opening?.querySelector(":scope > .section-copy"), {
      order: "2",
      "margin-top": "clamp(36px, 4vw, 58px)"
    });
    const principles = opening?.querySelector(".delivery-hero-principles");
    setImportantStyles(principles, {
      display: "grid",
      "grid-template-columns": isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))",
      gap: "0",
      width: "100%",
      "max-width": "720px",
      margin: "30px 0 0",
      color: "#182033",
      "border-top": "1px solid rgba(24, 32, 51, 0.14)",
      "border-bottom": "1px solid rgba(24, 32, 51, 0.14)"
    });
    principles?.querySelectorAll(":scope > span").forEach((item) => {
      setImportantStyles(item, {
        padding: isMobile ? "14px 0" : "16px 18px",
        color: "#182033",
        "border-right": isMobile ? "0" : "1px solid rgba(24, 32, 51, 0.14)",
        "border-bottom": isMobile ? "1px solid rgba(24, 32, 51, 0.14)" : "0"
      });
      setImportantStyles(item.querySelector("i"), { color: "#397a7c" });
      setImportantStyles(item.querySelector("strong"), { color: "#182033" });
      setImportantStyles(item.querySelector("small"), { color: "rgba(24, 32, 51, 0.58)" });
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
        <span>点击切换 · 当前仅展开一个场景</span>
      </header>
      <div class="zf-scene-browser-tabs" role="tablist"></div>
      ${config.id === "delivery-stages" ? '<div class="zf-delivery-stage-gallery" aria-label="设计交付阶段画廊"></div>' : ''}
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
    endStructureTransition();
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
    beginStructureTransition();
    window.requestAnimationFrame(init);
    settleLayout();
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href^='#']");
    const target = link?.getAttribute("href")?.slice(1);
    if (!transitionPages.has(target)) return;
    beginStructureTransition();
    window.requestAnimationFrame(() => {
      init();
      settleLayout();
    });
  }, true);
  window.addEventListener("resize", () => {
    lockDeliveryEditorialLayout();
    lockAirHeroSpacing();
  });
})();
