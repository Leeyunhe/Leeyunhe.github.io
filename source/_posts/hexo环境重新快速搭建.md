---
title: 更换电脑hexo环境如何快速重新搭建？
date: 2023-4-11 15:59:11
categories: 笔记
tags: 
comments: false
description: 

---

## 1.安装Git(默认安装)

下载网址https://git-scm.com/download/win

<!--more-->

## #2.克隆main主分支，

```
$ git clone -b main https://github.com/Leeyunhe/Leeyunhe.github.io.git
```

## 3.克隆hexo_bak分支，

```
$ git clone -b hexo_bak https://github.com/Leeyunhe/Leeyunhe.github.io.git
```

## 4.安装node.js(修改安装目录，默认安装)

下载网址https://nodejs.org/en，

## 5.用 node -v 和 npm -v 命令检查版本

上述node.js安装成功之后，npm同时也已经安装成功，用 node -v 和 npm -v 命令检查版本

## 6.配置npm在安装全局模块时的路径和缓存cache的路径

否则默认安装在C盘，不方便管理且占用C盘空间
	1，在node.js安装目录下新建两个文件夹 node_global和node_cache
	2，在git bush命令下执行如下两个命令：

```c
	npm config set prefix "F:\Blogs\nodejs\node_global"
	npm config set cache "F:\Blogs\nodejs\node_cache"
```

​	3，在环境变量 -> 系统变量中新建一个变量名为 “NODE_PATH”， 值为“F:\Blogs\nodejs\node_modules”，
​	4，最后编辑用户变量里的Path，将相应npm的路径改为：F:\Blogs\nodejs\node_global，
​	5，在git bush命令下执行 

```
npm install webpack -g
```

 然后安装成功后可以看到自定义的两个文件夹已生效：
	6，npm webpack -v 查看安装webpack的版本号

## 7.输入npm命令安装Hexo：

```c
npm install -g hexo-cli
```

## 8.安装完成后，输入 hexo init 命令初始化博客：

## 9.然后输入 hexo g 静态部署： 

## 10.部署完成，输入hexo s 命令可以查看

浏览器输入 http://localhost:4000 就可以打开新部署的网页：看完之后 ctrl +c 停止运行服务器。

## 11.hexo命令

```c
	hexo init    //命令初始化博客：
	hexo clean   //清除缓存文件 db.json 和已生成的静态文件 public
	hexo g       //生成网站静态文件到默认设置的 public 文件夹(hexo generate 的缩写)
	hexo s       //命令可以查看新部署的网页,浏览器输入 http://localhost:4000
	hexo d       //自动生成网站静态文件，并部署到设定的仓库(hexo deploy 的缩写)
```

## 12.绑定GitHub

​	1.输入 ssh 命令，查看本机是否安装 SSH：ssh
​	2.输入 ssh-keygen -t rsa 命令（注意空格），指定 RSA 算法生成密钥，然后敲四次回车键，生成两个文件:秘钥 id_rsa 和公钥 id_rsa.pub. 
​	3.将公钥 id_rsa.pub 的内容添加到 GitHub->settings->SSH and GPG keys-> New SSH key.
​	4.在 Git Bash 中输入 ssh -T git@github.com 进行检验

## 13.将博客部署到设定的git仓库主分支main

​	安装Git部署插件npm install hexo-deployer-git --save(删除原.deploy_git文件夹，hexo g后重新生成)
​	hexo clean   #清除缓存文件 db.json 和已生成的静态文件 public
​	hexo g       #生成网站静态文件到默认设置的 public 文件夹(hexo generate 的缩写)
​	hexo d       #自动生成网站静态文件，并部署到设定的仓库(hexo deploy 的缩写)

## 14.备份hexo到git分支hexo_bak

​	1.添加所有文件夹和文件到本地仓库

```
git add .
```

​	2.提交文件

```
git commit -m "提交注释"
```

​	3.push到git分支

```
git push --set-upstream origin hexo_bak
```

