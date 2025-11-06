# 详细代码分析 - 路由配置与链接实现

## 目录
1. 路由配置文件
2. 首页链接详解
3. 发现页现状
4. 需要实现的功能

## 路由配置文件

文件路径: D:\Users\LinZhiJie\Downloads\vue-music\src\router\index.js

总共定义了 15 条路由:
- / -> 重定向到 /firstpage (首页)
- /firstpage (首页)
- /discover (发现页)
- /login (登录页)
- /more (更多页)
- /nextTracks (下一曲目)
- /set (设置页)
- /musicLibrary (音乐库)
- /artist (艺人详情)
- /moviePage (电影页)
- /search (搜索页)
- /searchDemo (搜索演示)
- /playsList (播放列表)
- /callback (回调页)
- /* (404 未找到)

所有路由使用动态导入(code splitting)优化性能

## 首页链接详解

文件路径: D:\Users\LinZhiJie\Downloads\vue-music\src\pages\FirstPage/index.vue

### 链接 #1：推荐歌单 - 查看全部
- 代码位置: 第 130-133 行
- 导航目标: /discover?key=推荐歌单
- 数据源: firstFetchProfile('recommend', 12, 'playlist')
- 获取数量: 12个

### 链接 #2：新专辑 - 查看全部
- 代码位置: 第 149-152 行
- 导航目标: /discover?key=新专辑
- 数据源: firstFetchProfile('new', 12, 'album')
- 获取数量: 12个

### 链接 #3：推荐艺人 - 未配置
- 代码位置: 第 166-169 行
- 现状: 没有"查看全部"链接
- 显示数量: 6个艺人
- 建议: 可添加类似的链接

## 发现页现状

文件路径: D:\Users\LinZhiJie\Downloads\vue-music\src\pages\Discover/index.vue

当前代码仅包含:
- 基本的页面骨架
- 标题和文字
- 最小化样式

缺失的功能:
- 没有接收 key 查询参数
- 没有 API 调用
- 没有条件渲染不同内容
- 没有完整样式

## 需要实现的功能

核心需求:
1. 接收路由查询参数 (key)
2. 根据不同的 key 值调用对应的 API
3. 使用 AlbumCard 组件展示结果
4. 实现与首页一致的样式

API 参数说明:
- key='推荐歌单' -> firstFetchProfile('recommend', 50, 'playlist')
- key='新专辑' -> firstFetchProfile('new', 50, 'album')

可用的 UI 组件:
- AlbumCard (已实现)
- 样式参考: 搜索页、音乐库页

参考实现可参考:
- 搜索页的参数处理方式
- 艺人页的 URL 参数提取
- 音乐库页的网格布局

