(async function () {
  const page = document.querySelector("[data-device-entry]");
  if (!page) return;
  const zf = window.ZFMaintenance;
  const editor = document.querySelector("[data-component-editor]");
  const template = document.querySelector("[data-component-template]");
  const homeSelect = document.querySelector('[name="home"]');

  function addComponent(values) {
    const row = template.content.firstElementChild.cloneNode(true);
    Object.entries(values || {}).forEach(([name, value]) => {
      const field = row.querySelector(`[name="${name}"]`);
      if (field) field.value = value;
    });
    row.querySelector("[data-remove-component]").addEventListener("click", () => {
      if (editor.children.length > 1) row.remove();
    });
    editor.appendChild(row);
  }

  document.querySelector("[data-add-component]").addEventListener("click", () => addComponent());
  addComponent({ componentName: "初效滤网", componentSpec: "G4 / 420×260×20 mm", componentQuantity: 2, componentCycle: 3 });
  addComponent({ componentName: "中效滤网", componentSpec: "F7 / 420×260×45 mm", componentQuantity: 2, componentCycle: 6 });
  addComponent({ componentName: "高效滤网", componentSpec: "H13 / 420×260×65 mm", componentQuantity: 1, componentCycle: 12 });

  try {
    const customers = zf.isDemo ? zf.demoStore.get().customers : (await zf.api("/api/admin/customers")).customers;
    homeSelect.innerHTML = '<option value="">请选择住宅</option>' + customers
      .filter((item) => item.home_id)
      .map((item) => `<option value="${zf.escapeHtml(item.home_id)}">${zf.escapeHtml(item.home_name)} · ${zf.escapeHtml(item.display_name)}</option>`).join("");
    const requested = new URLSearchParams(location.search).get("home");
    if (requested && Array.from(homeSelect.options).some((option) => option.value === requested)) homeSelect.value = requested;
  } catch (_) {}

  document.querySelector("[data-device-form]").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const components = Array.from(editor.querySelectorAll(".zf-component-row")).map((row) => ({
      kind: { "耗材": "consumable", "部件": "component", "检测点": "measurement", "清洁点位": "cleaning_point" }[row.querySelector('[name="componentKind"]').value],
      name: row.querySelector('[name="componentName"]').value,
      specification: row.querySelector('[name="componentSpec"]').value,
      barcode: row.querySelector('[name="componentBarcode"]').value,
      quantity: Number(row.querySelector('[name="componentQuantity"]').value),
      cycleMonths: Number(row.querySelector('[name="componentCycle"]').value)
    }));
    const payload = {
      homeId: String(fd.get("home")), internalCode: String(fd.get("zefengCode")),
      deviceType: String(fd.get("type")), brand: String(fd.get("brand")), model: String(fd.get("model")),
      serialNumber: String(fd.get("serial")), manufacturerBarcode: String(fd.get("manufacturerBarcode") || ""),
      location: String(fd.get("location")), commissionedOn: String(fd.get("commissioned")),
      warrantyUntil: String(fd.get("warranty") || ""), status: String(fd.get("state")), components
    };
    const note = document.querySelector("[data-save-note]");
    try {
      if (zf.isDemo) {
        const data = zf.demoStore.get();
        data.devices.unshift({ id: crypto.randomUUID(), internal_code: payload.internalCode, device_type: payload.deviceType, brand: payload.brand, model: payload.model, serial_number: payload.serialNumber, location: payload.location, status: payload.status });
        zf.demoStore.set(data);
      } else {
        await zf.api("/api/admin/devices", { method: "POST", body: JSON.stringify(payload) });
      }
      note.textContent = `设备 ${payload.internalCode} 及 ${components.length} 项部件明细已经安全保存。`;
      note.classList.add("show");
      note.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (failure) {
      note.textContent = failure.message || "设备保存失败，请重试。";
      note.classList.add("show");
    }
  });
})();
