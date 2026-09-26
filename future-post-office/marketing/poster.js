const params = new URLSearchParams(location.search);
const config = {
  title: params.get('title') || '把今天的话，寄给未来',
  subtitle: params.get('subtitle') || '生日 · 纪念日 · 异地恋 · 毕业 · 给未来的自己',
  detail: params.get('detail') || '不是普通贺卡，是一个只能在未来日期打开的电子时间胶囊。',
  price: params.get('price') || '¥9.9 起',
  badge: params.get('badge') || '未来邮局'
};
document.getElementById('title').textContent = config.title;
document.getElementById('subtitle').textContent = config.subtitle;
document.getElementById('detail').textContent = config.detail;
document.getElementById('price').textContent = config.price;
document.getElementById('badge').textContent = config.badge;
