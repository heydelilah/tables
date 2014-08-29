define(function(require, exports){
	var $ = require('jquery');
	var pubjs = require('@core/pub');
	var view = require('@base/view');
	var common = require('@base/common/base');
	var util = require('util');

	var HighGrid = view.container.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'target': parent,

				'cols': [],				// 列定义
				'indicator': [],

				'data': null,			// 静态数据
				'url': null,			// 远程数据地址
				'param': null,			// 远程数据请求参数
				"reqMethod":"get",		// 数据获取方式
				'auto_load': true,		// 自动加载数据
				'eventDataLoad': false, // 是否冒泡数据已加载完成事件

				'hasRefresh': true,		// 刷新控件
				'refresh_time': 10,		// 刷新间隔
				'refresh_auto': 0,		// 自动刷新中

				'hasSelect':false,		// 是否显示多选列
				'hasAmount': true,		// 是否有总计模块
				'hasPager': true,		// 是否有分页模块

				'pager': null,			// 分页模块配置信息

				'style': {
					'selected': 'M-HighGridListRowSelected',	// 选中样式
					'highlight': 'M-HighGridListRowHighlight'	// 高亮样式
				}
			});

			this.$data = config.$data.data;

			this.$selects = [];
			this.$highlights = [];

			// 自动刷新Timeout ID
			self.$refresh_timeid = 0;

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var c = this.getConfig();
			if (!c.data && c.auto_load && c.url){
				// 加载数据
				this.load();
			}else{
				this.buildTable();
			}
		},
		buildTable: function(){
			var c = this.getConfig();

			var layout = $([
				'<div class="M-HighGrid">',
					'<div class="M-HighGridHeader">',
						'<div class="M-HighGridHeaderLeft"></div>',
						'<div class="M-HighGridHeaderRight"></div>',
					'</div>',
					'<div class="M-HighGridList">',
						'<div class="fl M-HighGridListLayoutLeft">',
							'<div class="M-HighGridListCorner"></div>',
							'<div class="M-HighGridListSidebar"></div>',
						'</div>',
						'<div class="M-HighGridListLayoutRight">',
							'<div class="M-HighGridListHeader"></div>',
							'<div class="M-HighGridListContent"></div>',
						'</div>',
					'</div>',
					'<div class="M-HighGridPager mt10 tr"></div>',
					'<div class="M-tableListLoading"></div>',
				'</div>'
			].join(''));

			var doms = this.$doms = {
				corner: layout.find('.M-HighGridListCorner'),
				header: layout.find('.M-HighGridListHeader'),
				sidebar: layout.find('.M-HighGridListSidebar'),
				content: layout.find('.M-HighGridListContent'),
				loading: layout.find('.M-tableListLoading')
			}

			this.buildTableCorner().appendTo(doms.corner);
			this.buildTableHeader().appendTo(doms.header);
			this.buildTableSidebar().appendTo(doms.sidebar);
			this.buildTableContent().appendTo(doms.content);

			// 分页模块
			if(c.hasPager && c.url){
				var data = this.$data;
				this.createAsync(
					'pager', '@base/common/base.pager',
					util.extend(c.pager, {'target': layout.find('.M-HighGridPager')}),
					function(mod){
						mod.setup({
							'total': data.total,
							'size': (data.size || undefined),
							'page': (data.page || undefined)
						});
					}
				);
			}
			// 刷新控件
			if (c.hasRefresh){
				// 读取记录的配置
				c.refresh_id = 'grid_refresh' + this._.uri;
				if (c.refresh_auto){
					c.refresh_auto = (pubjs.storage(c.refresh_id) !== '0');
				}
				var div = $('<div class="M-HighGridRefresh" />').appendTo(layout.find('.M-HighGridHeaderLeft'));
				div.html([
					'<span data-type="0" class="M-HighGridRefreshAuto" ><i></i>'+LANG("自动刷新")+'</span>',
					'<button class="uk-button refNormal"><em /></button>'
				].join(''));
				var ref = this.$refresh = {
					dom: div,
					check: div.find('.M-HighGridRefreshAuto'),
					button: div.find('button')
				};
				this.refreshCallBack = this.refreshCallBack.bind(this);
				if (c.refresh_auto){
					ref.check.find('i').addClass('act').attr('data-type', 1);
				}
				this.uiBind(ref.check, 'click', 'eventRefreshMode');
				this.uiBind(ref.button, 'click', 'eventRefreshManual');
			}

			// 创建滚动条
			var scrollerV = this.create('scrollerV', common.scroller, {
				dir: 'V',
				pad: false, // 取消滚动条间隔，使之浮在内容的上面
				target: doms.content,
				content:  doms.content.find('table')
			});
			var scrollerH = this.create('scrollerH', common.scroller, {
				dir: 'H',
				pad: false,
				wheel: false,
				target: doms.content,
				content:  doms.content.find('table')
			});

			this.append(layout);

			// 计算表格宽高
			this.calculate();

			// 更新滚动条
			scrollerV.update();
			scrollerH.update();
		},

		/** ---- 刷新控件 ---- **/
		eventRefreshMode: function(evt, elm){
			this.setConfig('refresh_auto', +$(elm).attr("data-type"));
			this.toggleRefresh();
		},
		eventRefreshManual: function(){
			this.load(true);
		},
		toggleRefresh: function(mode){
			var self = this;
			var c = self.getConfig();
			if (mode === undefined){
				mode = !c.refresh_auto;
			}else {
				mode = !!mode;
			}
			c.refresh_auto = mode;
			self._toggleRefresh(mode);
			self.$refresh.check
				.attr("data-type",mode?1:0);

			self.$refresh.check.find('i').toggleClass("act",mode);
			pubjs.storage(c.refresh_id, +mode);
			return self;
		},
		refreshCallBack: function(mode){
			var self = this;
			if (self.getDOM().width() > 0){
				self.cast('autoRefresh');
			}else {
				self.$refresh_timeid = 0;
				self._toggleRefresh(1);
			}
		},
		onAutoRefresh: function(){
			if (this.getDOM().width() > 0){
				// 表格正常显示, 刷新自己
				this.load(true);
			}else {
				// 表格隐藏, 拦截事件不刷新
				return false;
			}
		},
		_toggleRefresh: function(mode){
			var self = this;
			if (mode){
				if (!self.$refresh_timeid){
					self.$refresh_timeid = setTimeout(
						self.refreshCallBack,
						self.getConfig().refresh_time * 1000
					);
				}
			}else {
				if (self.$refresh_timeid){
					clearTimeout(self.$refresh_timeid);
					self.$refresh_timeid = 0;
				}
			}
			return self;
		},
		/** ---- 刷新控件 ---- **/

		buildTableCorner: function(){
			var c = this.getConfig()
			var cols = c.cols;

			// 自动根据hasSelect参数插入选择列
			// 如果已有自定义的select，则不会重复添加
			var repeat = util.find(c.cols, 'select', 'type');
			if(c.hasSelect && !repeat){
				cols.unshift({"type":"select","name":"sel"});
			}

			var dom = $([
				'<table cellspacing="0" cellpadding="0">',
					'<tr class="M-HighGridListCornerTitle"></tr>',
					'<tr class="M-HighGridListCornerAmount">',
						c.hasAmount ? '<td colspan="'+cols.length+'">汇总</td>' : '',
					'</tr>',
				'</table>'
			].join(''));

			var td = [];
			var el;
			var html;
			for (var i = 0; i < cols.length; i++) {
				// 选择列
				if(cols[i].type == 'select'){
					html = '<input type="checkbox" />';
				}

				el = this.buildTd({
					'text': cols[i].text,
					'html': html
				})
				td.push(el);

				// 清除变量
				html = '';
			}
			dom.find('.M-HighGridListCornerTitle').append(td);
			// 绑定全选框事件
			this.uiBind(dom.find('input[type="checkbox"]'), 'click', 'eventSelectAll');
			return dom;
		},
		buildTableHeader: function(){
			var c = this.getConfig()
			var indicator = c.indicator;
			var data = this.$data && this.$data.amount || null;

			var html = $([
				'<table cellspacing="0" cellpadding="0">',
					'<tr class="M-HighGridListHeaderTitle"></tr>',
					'<tr class="M-HighGridListHeaderAmount"></tr>',
				'</table>'
			].join(''));

			var title = [];
			var amount = [];
			var elTitle, elAmount;
			for (var i = 0; i < indicator.length; i++) {
				elTitle = this.buildTd({
					'text': indicator[i].text || '-'
				});
				title.push(elTitle);

				// 总计模块
				if(c.hasAmount){
					// 有数据
					if(data){
						elAmount = this.buildTd({
							'text': data[indicator[i].name] || '-'
						});

					}else{
						// 无数据
						elAmount = '<td>-</td>';
					}
					amount.push(elAmount);
				}
			}
			html.find('.M-HighGridListHeaderTitle').append(title);

			// 总计模块
			if(c.hasAmount){
				html.find('.M-HighGridListHeaderAmount').append(amount);
			}

			return html;
		},
		buildTableSidebar: function(){
			var datas = this.$data && this.$data.items || null;
			var cols = this.getConfig().cols;

			var dom = $('<table cellspacing="0" cellpadding="0"/>');

			var i;
			if(datas){
				var tr, td;
				var data;
				var html, width, isIndexCol, title, type, column, hasDataType;
				var className = '';

				for (i = 0; i < datas.length; i++) {
					data = datas[i];

					tr = this.buildTr({
						'dataId': data.id,
						'class': (i%2!==0) ? 'M-HighGridListSidebarName' : 'M-HighGridListSidebarName even'
					});

					for (var ii = 0; ii < cols.length; ii++) {
						column = cols[ii];

						isIndexCol = column.type == 'index';

						// 选择列
						if(column.type == 'select'){
							html = '<input type="checkbox"/>';
							hasDataType = true;
						}

						// 操作列
						if(column.type == 'op'){
							html = '<span class="M-HighGridListSidebarMenu"/>';
							className += ' tc';
							hasDataType = true;
						}

						if(column.render){
							html = this[column.render](ii, data[column.name], data, column);
						}
						if(column.width){
							width = column.width;
						}
						if(column.align){
							className += ' '+ column.align;
						}

						if(isIndexCol){
							width = width || 150;
							className += ' '+ 'uk-text-truncate tl';
							title = data[column.name];
							type = 'index';
						}
						td = this.buildTd({
							'text': data[column.name],
							'html': html,
							'width': width,
							'class': className,
							'title': title,
							'type': type,
							'dataType': hasDataType ? column.type : null
						});
						tr.append(td);
						// 清除变量
						html = width = className = type= title = hasDataType= '';
					}
					dom.append(tr);
				}
			}else{
				// 无数据
				var tds = [];
				for (i = 0; i < cols.length; i++) {
					tds.push('<td>-</td>');
				}
				dom.append($('<tr class="M-HighGridListSidebarName even"></tr>').append(tds));
			}
			// 绑定选择框事件
			this.uiProxy(dom, 'input[type="checkbox"]', 'click', 'eventCheckboxClick');
			return dom;
		},
		buildTableContent: function(){
			var data =  this.$data && this.$data.items || null;
			var cols = this.getConfig().indicator;

			var html = $('<table  cellspacing="0" cellpadding="0"/>');
			if(data){
				var tr, td;
				for (var i = 0; i < data.length; i++) {

					tr = this.buildTr({
						'dataId': data[i].id,
						'class': (i===0 )? 'M-HighGridListContentFirstTr even': ((i%2 === 0)?'even':'')
					});

					for (var ii = 0; ii < cols.length; ii++) {
						td = this.buildTd({
							text: data[i][cols[ii].name] || '-'
						});
						tr.append(td);
					}
					html.append(tr);
				}
			}else{
				// 无数据
				html.append('<tr class="even"><td class="tc" colspan="'+cols.length+'">无数据</td></tr>')
			}

			return html;
		},
		buildTd: function(c){
			var con, td;
			td = con = $('<td></td>');

			if(c.type == 'index'){
				con = $('<div></div>').width( c.width || 150).appendTo(td);
			}

			if(c.class){
				con.addClass(c.class);
			}
			if(c.text){
				con.text(c.text);
			}
			if(c.width){
				con.css('width', c.width);
			}
			if(c.title){
				con.attr('title', c.title);
			}
			if(c.html){
				con.html(c.html);
			}
			if(c.dataType){
				con.attr('data-type', c.dataType);
			}

			return td;
		},
		buildTr: function(c){
			var tr = $('<tr></tr>');
			if(c.class){
				tr.addClass(c.class);
			}
			if(c.text){
				tr.text(c.text);
			}
			if(c.html){
				tr.html(c.html)
			}
			if(c.dataId){
				tr.attr('data-id', c.dataId);
			}
			return tr;
		},
		calculate: function(isReset){
			var c = this.getConfig(),
				wrap = c.target || this.$el, // @优化todo
				data = this.$data || [];

			// 长度定义
			var datasLen = data.items && data.items.length || 0,
				indexLen = c.indicator.length,
				colsLen = c.cols.length;

			// DOM实例
			var header = wrap.find('.M-HighGridListHeader'),
				content = wrap.find('.M-HighGridListContent'),
				sidebar = wrap.find('.M-HighGridListSidebar'),
				corner = wrap.find('.M-HighGridListCorner');

			var sum = 0,		// 总数
				i,
				max,			// 最大值
				space,			// 间距
				elT, elD, elL, elR;	// DOM对象

			// 同步高度-汇总模块
			elL = wrap.find('.M-HighGridListCornerAmount');
			elR = wrap.find('.M-HighGridListHeaderAmount');
			elL.height(elR.height());

			// 同步高度-下侧
			for (i = 0; i < datasLen; i++) {
				elL = sidebar.find('tr:eq('+i+')');
				elR = content.find('tr:eq('+i+')');
				max = this._getMax(elL.height(), elR.height());
				elL.height(max);
				elR.height(max);
			}

			// 以浏览器高度作为表格的高度
			var border = 2;
			var offset = 50+20+10+20; // @todo 针对clicki新版项目：菜单高度+上边距+容器上边距+下边距
			var pager = wrap.find('.M-HighGridPager').height();
			var gridHeader = wrap.find('.M-HighGridHeader').height();
			var height = $(window).height()-corner.height() - offset; // var height = wrap.height()-corner.height();
			sidebar.height(height-border -pager-gridHeader);
			content.height(height-border - pager-gridHeader);

			// 同步宽度-左侧
			for (i = 0; i < colsLen; i++) {
				elT = wrap.find('.M-HighGridListCorner td:eq('+i+')');
				elD = wrap.find('.M-HighGridListSidebar td:eq('+i+')');
				max = this._getMax(elT.width(), elD.width());
				elT.width(max);
				elD.width(max);
			}
			// 设置主内容模块的左边距值
			var conLeftWidth = wrap.find('.M-HighGridListLayoutLeft').width();
			wrap.find('.M-HighGridListLayoutRight').css('margin-left', conLeftWidth);

			var className = '';
			// 清零
			if(isReset){
				$('.M-HighGridListLayoutLeft').removeClass('shadow'); // 清除滚动阴影
				header.find('table').css('width', 'inherit');
				content.find('table').css('width', 'inherit');
				header.css('min-width', 0);
				content.css('min-width', 0);
				header.css('width', wrap.width() - conLeftWidth);
				content.css('width', wrap.width() - conLeftWidth);
				content.css('min-height', 'inherit'); // 清除上一次由滚动条生成的min-height

				// 清零右侧宽度
				for (i = 0; i < indexLen; i++) {
					// 总计模块
					className = c.hasAmount ? 'M-HighGridListHeaderAmount' : 'M-HighGridListHeaderTitle';
					elT = wrap.find('.'+className).find('td:eq('+i+')');
					elD = wrap.find('.M-HighGridListContentFirstTr td:eq('+i+')');
					elT.css('width', 'auto');
					elD.css('width', 'auto');
				}
			}

			// 同步宽度-右侧
			for (i = 0; i < indexLen; i++) {
				// 总计模块
				className = c.hasAmount ? 'M-HighGridListHeaderAmount' : 'M-HighGridListHeaderTitle';
				elT = wrap.find('.'+className).find('td:eq('+i+')');
				elD = wrap.find('.M-HighGridListContentFirstTr td:eq('+i+')');
				space = elT.outerWidth() - elT.width();
				max = this._getMax(elT.width(), elD.width());
				sum = sum + max + space;
				elT.width(max);
				elD.width(max);
			}
			// 更新表格宽度值，使每一列能以计算值呈现出来
			header.find('table').width(sum);
			content.find('table').width(sum);

			// 防止resize后重计算时，实际内容框挤出了外框。
			content.css('max-width',sum);
		},
		setData: function(data){
			this.reset();
			this.$data = data;
			this.buildTable();
			this.setStyles();
		},
		getData: function(data){
			return this.$data;
		},
		reset: function(){
			this.$data = null;
			// 清除子实例
			var mod = this.$;
			if(mod){
				for(var i in mod){
					mod[i].destroy();
				}
			}
			this.$el.empty();
		},
		/**
		 * 设置选中数据
		 * @param {Object} selects: [], highlights: []
		 */
		setValue: function(value){
			// 更新选中/高亮值
			this.$selects = value && value.selects || [];
			this.$highlights = value && value.highlights || [];

			// 设置选中/高亮状态
			this.setStyles();
		},
		getValue: function(){
			return {
				selects: this.$selects,
				highlights: this.$highlights
			}
		},
		resetValue: function(){
			this.$selects = [];
			this.$highlights = [];
			this.resetStyles();
		},
		// 更新行样式
		setStyles: function(){
			this.resetStyles();

			var sidebar = this.$doms.sidebar;
			var content = this.$doms.content;

			var style = this.getConfig('style');
			var i, tr;

			var ids = this.$selects;
			for (i = 0; i < ids.length; i++) {
				tr = sidebar.find('tr[data-id="'+ids[i]+'"]').addClass(style.selected);
				tr.find('input[type="checkbox"]').prop('checked', true);
				content.find('tr[data-id="'+ids[i]+'"]').addClass(style.selected);
			}
			ids = this.$highlights;
			for (i = 0; i < ids.length; i++) {
				sidebar.find('tr[data-id="'+ids[i]+'"]').addClass(style.highlight);
				content.find('tr[data-id="'+ids[i]+'"]').addClass(style.highlight);
			}
		},
		// 清除行样式
		resetStyles: function(){
			// 清除样式
			var style = this.getConfig('style');
			var className = style.selected +' '+style.highlight;
			var doms = this.$doms;
			var trLeft = doms.sidebar.find('tr');
			var trRight = doms.content.find('tr');
			trLeft.removeClass(className);
			trRight.removeClass(className);
			// 清除勾选
			trLeft.find('input[type="checkbox"]').prop('checked', false);
			doms.corner.find('tr input[type="checkbox"]').prop('checked', false);
		},
		load: function(){
			var c = this.getConfig();
			if (!c.url){ return this; }

			var param = this.getParam();

			this.showLoading();

			this.$reqID = pubjs.data[c.reqMethod](c.url, param, this, 'onData');

			return this;
		},
		onData: function(err, data){
			// this.hidewLoading();
			if (err){
				pubjs.error('拉取数据错误', err);
				this.setData([]);
				return;
			}

			var c = this.getConfig();
			this.setData(data);
			if(c.eventDataLoad){
				this.fire("gridDataLoad",data);
			}
		},
		reload: function(url, param, page){
			var c = this.getConfig();
			if (url){
				c.url = url;
			}
			if (param){
				c.param = util.extend(
					{},
					c.param,
					param,
					{page: page || 1}
				);

			}

			this.load();
		},
		setParam: function(param, replace){
			var cParam = this.getConfig('param');
			cParam = replace ? param :util.extend(cParam, param);
			this.setConfig('param', cParam)
			return cParam;
		},
		getParam: function(){
			return this.getConfig('param');
		},
		showLoading: function(){
			var el = this.getDOM();
			if(this.$doms){
				this.$doms.loading.css({
					width: el.width(),
					height: el.height()
				}).show();

			}
		},
		hideLoading: function(){},
		// 复选框点击事件
		eventCheckboxClick: function(ev, dom){
			var c = this.getConfig();

			var trLeft = $(dom).parents('tr');
			var id = trLeft.attr('data-id');
			var trRight = this.$doms.content.find('tr[data-id="'+id+'"]');

			// 添加行选中样式
			var className = c.style.selected;
			var beforeToggleStatus = trLeft.hasClass(className); // 原状态
			var toggleClass = beforeToggleStatus ? 'removeClass' : 'addClass';
			trLeft[toggleClass](className);
			trRight[toggleClass](className);

			// 更新选中值
			this.updateSelectedValue(!beforeToggleStatus, id);


			// return false; // 会阻止了checkbox的默认勾选事件
		},
		// 全选框点击事件
		eventSelectAll: function(ev, dom){
			var c = this.getConfig();

			var doms = this.$doms;
			var trLeft = doms.sidebar.find('tr');
			var trRight = doms.content.find('tr');

			$(dom).toggleClass('checked');

			var isSelected = $(dom).hasClass('checked')? true: false;
			var toggleClass = isSelected ? 'addClass' : 'removeClass';

			var className = c.style.selected;
			trLeft[toggleClass](className);
			trRight[toggleClass](className);
			trLeft.find('input[type="checkbox"]').prop('checked', isSelected);

			// 更新选中值
			this.updateSelectedValue(isSelected);

			// return false; // 会阻止了checkbox的默认勾选事件
		},
		updateSelectedValue: function(add, value){
			var data = value ? [{'id':value}] :(this.$data&&this.$data.items||[]);

			for (var i = 0; i < data.length; i++) {
				var index = util.index(this.$selects, data[i].id);
				// 增加
				if(add){
					if(index == null){
						this.$selects.push(data[i].id);
					}
				}else{
				// 清除
					if(index != null){
						this.$selects.splice(index, 1);
					}
				}
			}
		},
		// 滚动条响应事件
		onScroll: function(ev){
			var scrollerH = this.$.scrollerH;
			var scrollerV = this.$.scrollerV

			var header = this.$el.find('.M-HighGridListHeader');
			var sidebar = this.$el.find('.M-HighGridListSidebar');

			var left = scrollerH.getScrollPos();
			var top = scrollerV.getScrollPos();

			header.scrollLeft(left);
			sidebar.scrollTop(top);

			var el = $('.M-HighGridListLayoutLeft');
			if(left){
				el.addClass('shadow');
			}else{
				el.removeClass('shadow');
			}
			return false;
		},
		/**
		 * 分页切换事件
		 * @param  {Object} ev 事件变量
		 * @return {Bool}       返回false拦截事件冒泡
		 */
		onChangePage: function(ev){
			if (this.$.pager){
				this.setParam({
					page: ev.param.page,
					limit: ev.param.size
				});
				this.load();
			}
			return false;
		},
		// 浏览器窗口大小变化响应事件
		onSYSResize: function(ev){
			var self = this;

			// @todo 把同步高度和同步宽度分开，先同步高度。去掉滚动条。
			this.calculate(true);

			// 跳出JS执行线程，让浏览器线程先渲染
			setTimeout(function(){
				self.$.scrollerV.update();
				self.$.scrollerH.update();
			}, 0);

			// 再同步宽度 @todo

			return false;
		},
		// 主菜单状态变动响应事件
		onMenuToggle: function(ev){
			this.calculate(true);
			this.$.scrollerH.update();
			this.$.scrollerV.update();
			return false;
		},
		// 右侧工具栏状态变动响应事件
		onToolsToggle: function(ev){
			this.calculate(true);
			this.$.scrollerH.update();
			this.$.scrollerV.update();
			return false;
		},
		// 获取两者间的最大值
		_getMax: function(a, b){
			return a>b ? a : b;
		}
	});
	exports.base = HighGrid;
});