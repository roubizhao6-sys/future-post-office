(function () {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  function bytesToBase64(bytes) {
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return btoa(binary);
  }

  function base64ToBytes(value) {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  async function deriveKey(password, salt) {
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 120000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function encryptCapsule(data, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const plaintext = encoder.encode(JSON.stringify(data));
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);

    return {
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
      cipher: bytesToBase64(new Uint8Array(encrypted))
    };
  }

  function escapeJsonForScript(value) {
    return JSON.stringify(value).replace(/</g, "\\u003c");
  }

  function capsuleViewerBootstrap() {
    const data = window.CAPSULE_DATA;
    const root = document.getElementById("capsule-root");
    const status = document.getElementById("capsule-status");
    const lockPanel = document.getElementById("lock-panel");
    const passwordInput = document.getElementById("capsule-password");
    const unlockButton = document.getElementById("unlock-button");

    const themes = {
      dream: {
        bg: "linear-gradient(160deg,#10091f,#2b174f 55%,#090611)",
        accent: "#f7c873",
        soft: "#f3d9a5"
      },
      dawn: {
        bg: "linear-gradient(160deg,#15100f,#523122 50%,#0b0706)",
        accent: "#ffb77a",
        soft: "#ffd7b4"
      },
      bloom: {
        bg: "linear-gradient(160deg,#160c1b,#5a1d4d 55%,#0e060f)",
        accent: "#f9a8d4",
        soft: "#ffd0e7"
      }
    };

    const theme = themes[data.theme] || themes.dream;

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function formatDate(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    function renderContent(content, preview) {
      const photos = Array.isArray(content.photos) ? content.photos : [];
      root.innerHTML = `
        <div class="capsule-open">
          <p class="eyebrow">${preview ? "未来邮局预览" : "时间胶囊已开启"}</p>
          <h1>${escapeHtml(content.title || "给未来的你")}</h1>
          <p class="to-line">写给：${escapeHtml(content.recipient || "未来")}</p>
          <article class="letter">${escapeHtml(content.message || "").replace(/\n/g, "<br>")}</article>
          ${photos.length ? `<div class="photo-grid">${photos.map((photo) => `<img src="${photo}" alt="胶囊照片">`).join("")}</div>` : ""}
          <p class="signature">${escapeHtml(content.sender || "")} · 封存于 ${formatDate(content.createdAt || new Date().toISOString())}</p>
          ${preview ? '<div class="watermark">未来邮局免费预览</div>' : ""}
        </div>
      `;
      status.textContent = "";
    }

    function showCountdown() {
      const openAt = new Date(data.openAt);
      const now = new Date();
      const diff = openAt.getTime() - now.getTime();

      if (Number.isNaN(openAt.getTime())) {
        status.textContent = "开启日期无效，请联系制作人。";
        return false;
      }

      if (diff <= 0) {
        lockPanel.hidden = false;
        status.textContent = "时间到了。输入你约定的密码，打开这封信。";
        return true;
      }

      const days = Math.ceil(diff / 86400000);
      const hours = Math.ceil(diff / 3600000);
      const text = days > 1 ? `还有 ${days} 天` : `还有 ${hours} 小时`;
      root.innerHTML = `
        <div class="locked-capsule">
          <p class="eyebrow">未来邮局</p>
          <h1>${escapeHtml(data.recipientHint || "给未来的你")}</h1>
          <p>这颗胶囊将在 <strong>${formatDate(data.openAt)}</strong> 开启。</p>
          <div class="big-countdown">${text}</div>
          <p class="muted">提前打开只会看到倒计时。到约定时间后，输入密码才能阅读内容。</p>
        </div>
      `;
      lockPanel.hidden = true;
      status.textContent = "";
      return false;
    }

    async function decryptContent(password) {
      const salt = Uint8Array.from(atob(data.salt), (char) => char.charCodeAt(0));
      const iv = Uint8Array.from(atob(data.iv), (char) => char.charCodeAt(0));
      const cipher = Uint8Array.from(atob(data.cipher), (char) => char.charCodeAt(0));

      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
      );

      const key = await crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 120000, hash: "SHA-256" },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        false,
        ["decrypt"]
      );

      const plaintext = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
      return JSON.parse(new TextDecoder().decode(plaintext));
    }

    if (data.mode === "preview") {
      renderContent(data, true);
      return;
    }

    showCountdown();

    unlockButton.addEventListener("click", async () => {
      const password = passwordInput.value;
      if (!password) {
        status.textContent = "请输入密码。";
        return;
      }

      status.textContent = "正在打开……";
      try {
        const content = await decryptContent(password);
        renderContent(content, false);
      } catch (error) {
        status.textContent = "密码不正确，或文件已损坏。";
      }
    });
  }

  const capsuleCss = `
    *{box-sizing:border-box}body{margin:0;min-height:100vh;color:#f7f4ff;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;background:var(--capsule-bg);display:grid;place-items:center;padding:24px}
    .capsule-shell{width:min(820px,100%);border:1px solid rgba(255,255,255,.14);border-radius:28px;background:rgba(12,8,25,.72);box-shadow:0 30px 90px rgba(0,0,0,.48);padding:clamp(24px,6vw,56px);position:relative;overflow:hidden}
    .capsule-shell:before{content:"";position:absolute;inset:-40% 40% 60% -30%;background:radial-gradient(circle,var(--capsule-accent),transparent 62%);opacity:.16;pointer-events:none}
    .eyebrow{color:var(--capsule-soft);font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}
    h1{font-size:clamp(34px,8vw,68px);line-height:1.03;letter-spacing:-.06em;margin:14px 0}.to-line,.muted{color:#b9b1d3}
    .big-countdown{font-size:clamp(40px,12vw,92px);font-weight:950;letter-spacing:-.08em;color:var(--capsule-accent);margin:22px 0}
    .letter{margin:24px 0;color:#eee9ff;font-size:clamp(17px,3vw,21px);line-height:2;white-space:normal}
    .signature{color:#b9b1d3;text-align:right}.photo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin:24px 0}.photo-grid img{width:100%;height:240px;object-fit:cover;border-radius:18px;border:1px solid rgba(255,255,255,.14)}
    .lock-panel{display:grid;gap:12px;margin-top:22px}.lock-panel[hidden]{display:none}.password-row{display:flex;gap:10px;flex-wrap:wrap}.password-row input{flex:1;min-width:200px;padding:14px 16px;border-radius:14px;border:1px solid rgba(255,255,255,.18);background:rgba(0,0,0,.25);color:#fff}
    button{padding:14px 18px;border:0;border-radius:14px;background:var(--capsule-accent);color:#160e2b;font-weight:900;cursor:pointer}.status{min-height:24px;color:var(--capsule-soft)}.watermark{position:absolute;right:-42px;top:32px;transform:rotate(34deg);padding:10px 56px;background:rgba(255,255,255,.12);color:rgba(255,255,255,.65);font-weight:900}
    @media(max-width:560px){.photo-grid img{height:190px}.capsule-shell{padding:22px}}
  `;

  async function buildCapsuleDocument(data, options) {
    const settings = options || {};
    const isPreview = Boolean(settings.preview);
    let scriptData;
    let modeLabel;

    if (isPreview) {
      scriptData = {
        mode: "preview",
        theme: data.theme,
        recipientHint: data.recipient,
        ...data
      };
      modeLabel = "未来邮局预览";
    } else {
      const password = data.password;
      if (!password || password.length < 4) {
        throw new Error("密码至少需要4个字符。");
      }
      const payload = {
        title: data.title,
        recipient: data.recipient,
        sender: data.sender,
        message: data.message,
        photos: data.photos,
        createdAt: new Date().toISOString()
      };
      const encrypted = await encryptCapsule(payload, password);
      scriptData = {
        mode: "locked",
        openAt: data.openAt,
        theme: data.theme,
        recipientHint: data.recipient,
        ...encrypted
      };
      modeLabel = "未来邮局";
    }

    const safeData = escapeJsonForScript(scriptData);
    const themeMap = {
      dream: ["#0d071a", "#f7c873", "#f3d9a5"],
      dawn: ["#100b09", "#ffb77a", "#ffd7b4"],
      bloom: ["#100712", "#f9a8d4", "#ffd0e7"]
    };
    const colors = themeMap[data.theme] || themeMap.dream;

    return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${modeLabel}</title>
<style>:root{--capsule-bg:${colors[0]};--capsule-accent:${colors[1]};--capsule-soft:${colors[2]}}${capsuleCss}</style>
</head>
<body>
<main class="capsule-shell">
  <div id="capsule-root"><p class="muted">正在准备这颗时间胶囊……</p></div>
  <section class="lock-panel" id="lock-panel" hidden>
    <label for="capsule-password">输入你们约定的密码</label>
    <div class="password-row">
      <input id="capsule-password" type="password" autocomplete="off" placeholder="密码">
      <button id="unlock-button" type="button">打开胶囊</button>
    </div>
  </section>
  <p class="status" id="capsule-status"></p>
</main>
<script>window.CAPSULE_DATA=${safeData};(${capsuleViewerBootstrap.toString()})();<\/script>
</body>
</html>`;
  }

  window.CapsuleEngine = {
    buildCapsuleDocument,
    encryptCapsule,
    bytesToBase64,
    base64ToBytes
  };
})();
