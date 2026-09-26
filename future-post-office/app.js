const FUTURE_POST_CONFIG = {
  email: "roubizhao6@gmail.com",
  wechatId: "wxid_ctbgu0cumn8412",
  pageName: "未来邮局"
};

const wechatButtons = document.querySelectorAll('[data-copy-wechat]');
const wechatStatus = document.querySelector('[data-wechat-status]');

wechatButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const id = FUTURE_POST_CONFIG.wechatId.trim();

    if (!id || id.startsWith('YOUR_')) {
      if (wechatStatus) wechatStatus.textContent = '还没有配置微信号。';
      return;
    }

    try {
      await navigator.clipboard.writeText(id);
      button.textContent = '已复制';
      if (wechatStatus) wechatStatus.textContent = `微信号：${id}。请先测试能否被搜索添加。`;
      window.setTimeout(() => { button.textContent = '复制微信号'; }, 1800);
    } catch (error) {
      if (wechatStatus) wechatStatus.textContent = `微信号：${id}，请手动复制。`;
    }
  });
});

const emailLinks = document.querySelectorAll('[data-contact-email]');
emailLinks.forEach((link) => {
  link.href = `mailto:${FUTURE_POST_CONFIG.email}`;
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
