const form = document.getElementById('capsule-form');
const previewFrame = document.getElementById('preview-frame');
const status = document.getElementById('builder-status');
const copyOrderButton = document.getElementById('copy-order');
let photoDataUrls = [];

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function loadPhotos() {
  const input = document.getElementById('photos');
  const files = Array.from(input.files || []);
  const maxCount = window.CAPSULE_MODE === 'full' ? 6 : 1;
  const selected = files.slice(0, maxCount);
  const results = [];

  for (const file of selected) {
    if (!file.type.startsWith('image/')) {
      throw new Error('只能上传图片文件。');
    }
    if (file.size > 3 * 1024 * 1024) {
      throw new Error('单张图片不能超过3MB。');
    }
    results.push(await readFileAsDataUrl(file));
  }

  return results;
}

function collectData() {
  const openAt = document.getElementById('openAt').value;
  const password = document.getElementById('password').value;
  const data = {
    recipient: document.getElementById('recipient').value.trim(),
    sender: document.getElementById('sender').value.trim(),
    title: document.getElementById('title').value.trim(),
    message: document.getElementById('message').value.trim(),
    openAt,
    theme: document.getElementById('theme').value,
    password,
    photos: photoDataUrls
  };

  if (!data.recipient || !data.title || !data.message || !data.openAt || !data.password) {
    throw new Error('请填写所有必填项。');
  }

  if (password.length < 4) {
    throw new Error('密码至少需要4个字符。');
  }

  return data;
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  status.textContent = '正在生成……';

  try {
    photoDataUrls = await loadPhotos();
    const data = collectData();
    const html = await window.CapsuleEngine.buildCapsuleDocument(data, { preview: true });
    previewFrame.srcdoc = html;
    status.textContent = '预览已生成。满意后复制下单信息发给微信。';
  } catch (error) {
    status.textContent = error.message || '生成失败。';
  }
});

copyOrderButton.addEventListener('click', async () => {
  try {
    const data = collectData();
    const text = [
      '未来邮局订单信息',
      `送给谁：${data.recipient}`,
      `署名：${data.sender || '未填写'}`,
      `标题：${data.title}`,
      `开启日期：${data.openAt}`,
      `主题：${data.theme}`,
      `照片：${data.photos.length}张`,
      `版本意向：未来信 ¥9.9 / 记忆胶囊 ¥19.9 / 双人未来信 ¥29.9`,
      '',
      '请注意：正式付款前先确认版本和交付时间。'
    ].join('\n');
    await navigator.clipboard.writeText(text);
    status.textContent = '下单信息已复制，可以发给微信。';
  } catch (error) {
    status.textContent = error.message || '复制失败，请手动填写。';
  }
});

const defaultOpenDate = new Date();
defaultOpenDate.setFullYear(defaultOpenDate.getFullYear() + 1);
const localDate = new Date(defaultOpenDate.getTime() - defaultOpenDate.getTimezoneOffset() * 60000);
document.getElementById('openAt').value = localDate.toISOString().slice(0, 16);

const downloadButton = document.getElementById('download-capsule');
if (window.CAPSULE_MODE === 'full') {
  downloadButton.hidden = false;
}

downloadButton.addEventListener('click', async () => {
  if (window.CAPSULE_MODE !== 'full') {
    status.textContent = '公开预览页不能生成正式版，请通过微信确认订单。';
    return;
  }

  status.textContent = '正在生成正式版……';

  try {
    photoDataUrls = await loadPhotos();
    const data = collectData();
    const html = await window.CapsuleEngine.buildCapsuleDocument(data, { preview: false });
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (data.recipient || '未来').replace(/[\/:*?"<>|]/g, '_').slice(0, 20);
    link.href = url;
    link.download = `未来邮局-${safeName}.html`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    status.textContent = '正式版已下载。请把文件和密码分开发送给客户。';
  } catch (error) {
    status.textContent = error.message || '正式版生成失败。';
  }
});
