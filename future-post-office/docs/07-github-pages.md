# GitHub Pages部署

仓库根目录使用 `.github/workflows/pages.yml` 自动部署 `future-post-office` 文件夹。

## 发布前

- 测试微信号能否被搜索添加。
- 确认收款码没有进入公开仓库。
- 确认没有客户隐私和真实照片。
- 运行本地页面检查。

## 开启Pages

进入仓库：

```text
Settings -> Pages -> Build and deployment -> Source -> GitHub Actions
```

推送 `main` 后，Actions会自动部署。

## 网址

```text
https://你的GitHub用户名.github.io/仓库名/
```

## 自定义域名

有付费能力后再绑定。第一笔订单之前不要为了域名花钱。
