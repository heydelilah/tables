HTML5 LocalStorage 本地存储
=============================
Date:20140901

### 1， 说明：

- HTML5 提供了两种在客户端存储数据的新方法：
	1. `localStorage` - 没有时间限制的数据存储
	2. `sessionStorage` - 针对一个 session 的数据存储

- 大小：官方建议是每个网站5MB

- 对于Chrome Browser, 缺省储存地址：
	`C:/Documents and Settings/UserName/Local Settings/Application Data/Google/Chrome/User Data/Default/Local Storage`

- 低版本IE兼容 ：userData


### 2， 用法：

存储数据的方法就是直接给window.localStorage添加一个属性；

- localStorage. length:返回现在已经存储的变量数目。
- localStorage. key(n):返回第n个变量的键值(key)。 可在不知道有哪些键值的时候使用
- localStorage.getItem(k):和localStorage.k一样，取得键值为k的变量的值。
- localStorage.setItem(k , v):和localStorage.k = v一样，设置键值k的变量值。
- localStorage.removeItem(k):删除键值为k的变量。
- localStorage.clear():清空所有变量。 一次性清除所有的键值对

1. storage事件，可以对键值对的改变进行监听
2. HTML5本地存储只能存字符串，任何格式存储的时候都会被自动转为字符串，所以读取的时候，需要自己进行类型的转换


### 3， 引用：

- HTML5 LocalStorage-本地存储-xiaowei0705[http://www.cnblogs.com/xiaowei0705/archive/2011/04/19/2021372.html]
- localStorage简要说明-2012-05-19-小想[http://www.html5china.com/HTML5features/LocalStorage/20120519_3711.html]
