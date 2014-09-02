获取在viewport中的坐标位置
========================================
Date:20140902

> 浏览器窗口的大小，则是指在浏览器窗口中看到的那部分网页面积，又叫做viewport（视口）。


1. 获取DOM元素在viewport中的坐标位置
	不断与父容器（offsetParent对象）累加offsetTop,offsetLeft

	```
	function getElementLeft(element){
		var actualLeft = element.offsetLeft;
		var current = element.offsetParent;
		while (current !== null){
			actualLeft += current.offsetLeft;
			current = current.offsetParent;
		}
		return actualLeft;
	}
	function getElementTop(element){
		var actualTop = element.offsetTop;
		var current = element.offsetParent;
		while (current !== null){
			actualTop += current.offsetTop;
			current = current.offsetParent;
		}
		return actualTop;
	}
	```

2. 获取鼠标点击的坐标位置
	- event对象中的clientX,clientY

3. DOM元素，包含属性：
	```
	clientHeight, clientWidth
	scrollWidth, scrollHeight
	offsetLeft, offsetTop
	offsetParent
	```

4. 事件Event对象，包含属性：
	`clientX,pageX,screenX, offsetLeft, scrollTop`

5. 引用：
	- 用Javascript获取页面元素的位置 -阮一峰-2009年9月14日 http://www.ruanyifeng.com/blog/2009/09/find_element_s_position_using_javascript.html