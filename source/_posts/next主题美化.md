---
title: next主题美化（持续更新）
date: 2022-3-16 10:08:11
categories: 笔记
tags: 
comments: false
description: 

---

## 1，新建“分类”下的页面

1，打开主题配置文件"config.yml"

2，找到Menu Settings

<!--more-->

menu:
  home: / || fa fa-home		#首页
  categories: /categories/ || fa fa-th	#分类
  notes: /categories/笔记/ || fa fa-folder-open	#笔记
  read: /categories/阅读/ || fa fa-book	#阅读
  tags: /tags/ || fa fa-tags		#标签
  archives: /archives/ || fa fa-archive	#时间轴
  about: /about/ || fa fa-user		#关于
  #schedule: /schedule/ || fa fa-calendar	#日程表
  #sitemap: /sitemap.xml || fa fa-sitemap	#站点地图
  #commonweal: /404/ || fa fa-heartbeat	#公益 404

3，对应添加你需要的页面，如：read: /categories/阅读/ || fa fa-book	#阅读，read页面属于'categories'分类的子页面'阅读'，“||”前面的是目标链接，后面的是图标名称，next使用的图标全是[图标库 - Font Awesome 中文网](https://link.zhihu.com/?target=http%3A//www.fontawesome.com.cn/faicons/%23web-application)这一网站的，有想用的图标直接在fontawesome上面找图标的名称就行。

4，新添加的菜单需要翻译对应的中文，打开theme/next/languages/zh-CN.yml，在menu下设置：

5，同时，需要在Hexo根目录下的source中创建对应的文件夹，文件夹名称与<read>保持一致，文件夹中创建index.md文件，进行该页面描述，type必须与步骤3中添加的<categories>一致

 在根目录下打开Git Bash，输入如下代码： hexo new page "categories" sources文件夹下会生成文件夹，文件中有一个`index.md`文件，修改内容分别如下： 

title: 阅读
date: 2021-01-08 16:04:21
type: "categories"
comments: false 

注：如果有启用评论，默认页面带有评论。需要关闭的话，添加字段comments并将值设置为false。 

6，编辑博客文章时，categories分类必须与步骤3中添加的<阅读>一致

title: 如何阅读一本书？
date: 2021-01-07 15:59:11
categories: 阅读
tags: 

-读书
comments: false
description: 

7，至此，上传后的博客文章和创建的页面相关联，正常显示，调转

## 2，鼠标点击红心特效

 在`/themes/next/source/js/`下新建文件 clicklove.js ，接着把下面的代码拷贝粘贴到 clicklove.js 文件中： 

```
!function(e,t,a){function n(){c(".heart{width: 10px;height: 10px;position: fixed;background: #f00;transform: rotate(45deg);-webkit-transform: rotate(45deg);-moz-transform: rotate(45deg);}.heart:after,.heart:before{content: '';width: inherit;height: inherit;background: inherit;border-radius: 50%;-webkit-border-radius: 50%;-moz-border-radius: 50%;position: fixed;}.heart:after{top: -5px;}.heart:before{left: -5px;}"),o(),r()}function r(){for(var e=0;e<d.length;e++)d[e].alpha<=0?(t.body.removeChild(d[e].el),d.splice(e,1)):(d[e].y--,d[e].scale+=.004,d[e].alpha-=.013,d[e].el.style.cssText="left:"+d[e].x+"px;top:"+d[e].y+"px;opacity:"+d[e].alpha+";transform:scale("+d[e].scale+","+d[e].scale+") rotate(45deg);background:"+d[e].color+";z-index:99999");requestAnimationFrame(r)}function o(){var t="function"==typeof e.onclick&&e.onclick;e.onclick=function(e){t&&t(),i(e)}}function i(e){var a=t.createElement("div");a.className="heart",d.push({el:a,x:e.clientX-5,y:e.clientY-5,scale:1,alpha:1,color:s()}),t.body.appendChild(a)}function c(e){var a=t.createElement("style");a.type="text/css";try{a.appendChild(t.createTextNode(e))}catch(t){a.styleSheet.cssText=e}t.getElementsByTagName("head")[0].appendChild(a)}function s(){return"rgb("+~~(255*Math.random())+","+~~(255*Math.random())+","+~~(255*Math.random())+")"}var d=[];e.requestAnimationFrame=function(){return e.requestAnimationFrame||e.webkitRequestAnimationFrame||e.mozRequestAnimationFrame||e.oRequestAnimationFrame||e.msRequestAnimationFrame||function(e){setTimeout(e,1e3/60)}}(),n()}(window,document);

```

 在`\themes\next\layout\_layout.swig`文件末尾添加： 

```
<!-- 页面点击小红心 -->
<script type="text/javascript" src="/js/click.js"></script>
```

## 3，添加字数统计和阅读时长

```c
// 1，安装hexo-symbols-count-time 
$ npm installl hexo-symbols-count-time --save
//1.1如果有警告如下
npm WARN babel-eslint@10.0.1 requires a peer of eslint@>= 4.12.1 but none is installed. You must install peer dependencies yourself.
//还需安装eslint
$ npm install eslint --save
//2,在Hexo站点配置文件添加如下配置
symbols_count_time:
  symbols: true                # 文章字数统计
  time: true                   # 文章阅读时长
  total_symbols: true          # 站点总字数统计
  total_time: true             # 站点总阅读时长
  exclude_codeblock: false     # 排除代码字数统计
  awl: 4					 # Average Word Length
  wpm: 275					 # Words Per Minute（每分钟阅读词数）
  suffix: "mins."
//3, 在NexT主题配置文件添加如下配置（NexT主题已支持该插件，有的话无需再添加）
symbols_count_time:
  separated_meta: true     # 是否另起一行（true的话不和发表时间等同一行）
  item_text_post: true     # 首页文章统计数量前是否显示文字描述（本文字数、阅读时长）
  item_text_total: false   # 页面底部统计数量前是否显示文字描述（站点总字数、站点阅读时长）
```



## 4，添加背景图片,设置透明和边框圆角

- 进入 `themes\next\source\css` 目录中

- 打开 `main.styl` 文件

- 在末尾添加 `css` 代码即可

-  背景图片位于 `themes\next\source\images` 路径下 

  ```css
  // 自定义样式
  // --------------------------------------------------
  body {
    background: url(/images/background.png);
    background-repeat: no-repeat;
    background-attachment: fixed;
    background-position: 50% 50%;
    color: var(--text-color);
    font-family: 'Lato', "PingFang SC", "Microsoft YaHei", sans-serif;
    font-size: 1em;
    line-height: 2;
  }
  
  // 侧边标题栏
  .header-inner {
    border-radius: 20px 20px 20px 20px; //边框圆角
    opacity: 0.85;
  }
  
  // 侧边头像栏
  .sidebar{
    transition-duration: 0.4s;  
    opacity: 0.85;  // 透明度
    border-radius: 10px 10px 10px 10px; //边框圆角
  }
  
  // 侧边头像框内部
  .sidebar-inner {
    background: var(--content-bg-color);
    border-radius: 10px 10px 10px 10px; //边框圆角
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.06), 0 1px 5px 0 rgba(0,0,0,0.12), 0 -1px 0.5px 0 rgba(0,0,0,0.09);
    box-sizing: border-box;
    color: var(--text-color);
    width: 240px;
    opacity: 0;
  }
  
  // 中心文章栏
  .content {
    padding-top: 15px;
    opacity: 0.9;
  }
  
  //第一个文章
  .post-block {
    background: var(--content-bg-color);
    border-radius: 10px 10px 10px 10px; //边框圆角
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.06), 0 1px 5px 0 rgba(0,0,0,0.12);
    padding: 40px;
  }
  
  //之后的所有文章
  .post-block + .post-block {
    border-radius: 10px 10px 10px 10px; //边框圆角
    box-shadow: 0 2px 2px 0 rgba(0,0,0,0.12), 0 3px 1px -2px rgba(0,0,0,0.06), 0 1px 5px 0 rgba(0,0,0,0.12), 0 -1px 0.5px 0 rgba(0,0,0,0.09);
    margin-top: 12px;
  }
  ```

  
