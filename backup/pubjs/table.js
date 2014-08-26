define(function(require, exports){
	var $ = require('jquery');
	var pubjs = require('@core/pub');
	var view = require('@base/view');
	var common = require('@base/common/base')

	var GridV2 = view.container.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				data: [],
				cols: [],
				indicator: [],
				target: parent,
				hasSelect: true,
				hasAmount: true
			});

			this.$data = config.$data.data;

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var layout = $([
				'<div class="grid">',
					'<div class="fl gridLayoutLeft">',
						'<div class="gridCorner"></div>',
						'<div class="gridSidebar"></div>',
					'</div>',
					'<div class="gridLayoutRight">',
						'<div class="gridHeader"></div>',
						'<div class="gridContent"></div>',
					'</div>',
				'</div>'
			].join(''));

			var doms = this.$doms = {
				tableCorner: layout.find('.gridCorner'),
				tableHeader: layout.find('.gridHeader'),
				tableSidebar: layout.find('.gridSidebar'),
				tableContent: layout.find('.gridContent')
			}

			this.buildTableCorner().appendTo(doms.tableCorner);
			this.buildTableHeader().appendTo(doms.tableHeader);
			this.buildTableSidebar().appendTo(doms.tableSidebar);
			this.buildTableContent().appendTo(doms.tableContent);

			// 创建滚动条
			var scrollerV = this.create('scrollerV', common.scroller, {
				dir: 'V',
				pad: false, // 取消滚动条间隔，使之浮在内容的上面
				target: layout.find('.gridContent'),
				content:  layout.find('.gridContent table')
			});
			var scrollerH = this.create('scrollerH', common.scroller, {
				dir: 'H',
				pad: false,
				wheel: false,
				target: layout.find('.gridContent'),
				content:  layout.find('.gridContent table')
			});

			this.append(layout);

			// 计算表格宽高
			this.calculate();

			// 更新滚动条
			scrollerV.update();
			scrollerH.update();
		},
		buildTableCorner: function(){
			var c = this.getConfig()
			var cols = c.cols;

			// 自动根据hasSelect参数插入选择列
			if(c.hasSelect){
				cols.unshift({"type":"select","name":"sel"});
			}

			var dom = $([
				'<table cellspacing="0" cellpadding="0">',
					'<tr class="gridCornerHook"></tr>',
					'<tr class="gridCornerAmount">',
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
					'class': 'gridCornerTitle',
					'text': cols[i].text,
					'html': html
				})
				td.push(el);

				// 清除变量
				html = '';
			}
			dom.find('.gridCornerHook').append(td);
			return dom;
		},
		buildTableHeader: function(){
			var c = this.getConfig()
			var indicator = c.indicator;
			var data = this.$data.amount;

			var html = $([
				'<table cellspacing="0" cellpadding="0">',
					'<tr class="gridHeaderTitle"></tr>',
					'<tr class="gridHeaderAmount"></tr>',
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
					if(data){
						elAmount = this.buildTd({
							'text': data[indicator[i].name] || '-'
						});

					}else{
						elAmount = '<td>-</td>';
					}
					amount.push(elAmount);
				}
			}
			html.find('.gridHeaderTitle').append(title);

			// 总计模块
			if(c.hasAmount){
				html.find('.gridHeaderAmount').append(amount);
			}

			return html;
		},
		buildTableSidebar: function(){
			var datas = this.$data.items;
			var cols = this.getConfig().cols;

			var dom = $('<table cellspacing="0" cellpadding="0"/>');

			var i;
			if(datas){
				var tr, td;
				var data;
				var html, width, isIndexCol, title, type, column;
				var className = '';

				for (i = 0; i < datas.length; i++) {
					data = datas[i];

					tr = this.buildTr({
						'class': (i%2!==0) ? 'gridSidebarName' : 'gridSidebarName even'
					});

					for (var ii = 0; ii < cols.length; ii++) {
						column = cols[ii];

						isIndexCol = column.type == 'index';

						// 选择列
						if(column.type == 'select'){
							html = '<input type="checkbox" />';
						}

						// 操作列
						if(column.type == 'op'){
							html = '<span class="gridSidebarMenu"/>';
							className += ' center';
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
							className += ' '+ 'uk-text-truncate';
							title = data[column.name];
							type = 'index';
						}
						td = this.buildTd({
							'text': data[column.name],
							'html': html,
							'width': width,
							'class': className,
							'title': title,
							'type': type
						});
						tr.append(td);
						// 清除变量
						html = width = className = type= title= '';
					}
					dom.append(tr);
				}
			}else{
				var tds = [];
				for (i = 0; i < cols.length; i++) {
					tds.push('<td>-</td>');
				}
				dom.append($('<tr class="gridSidebarName even"></tr>').append(tds));
			}
			return dom;
		},
		buildTableContent: function(){
			var data = this.$data.items;
			var cols = this.getConfig().indicator;

			var html = $('<table  cellspacing="0" cellpadding="0"/>');
			if(data){
				var tr, td;
				for (var i = 0; i < data.length; i++) {

					tr = this.buildTr({
						'class': (i===0 )? 'gridContentFirstTr even': ((i%2 === 0)?'even':'')
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
				con.html(c.html)
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

			return tr;
		},
		calculate: function(isReset){
			var c = this.getConfig(),
				wrap = c.target || this.$el, // @优化todo
				data = this.$data;

			// 长度定义
			var datasLen = data.items && data.items.length || 0,
				indexLen = c.indicator.length,
				colsLen = c.cols.length;

			// DOM实例
			var header = wrap.find('.gridHeader'),
				content = wrap.find('.gridContent'),
				sidebar = wrap.find('.gridSidebar'),
				corner = wrap.find('.gridCorner');

			var sum = 0,		// 总数
				i,
				max,			// 最大值
				space,			// 间距
				elT, elD, elL, elR;	// DOM对象

			// 同步高度-汇总模块
			elL = wrap.find('.gridCornerAmount');
			elR = wrap.find('.gridHeaderAmount');
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
			var height = $(window).height()-corner.height() - offset; // var height = wrap.height()-corner.height();
			sidebar.height(height-border);
			content.height(height-border);

			// 同步宽度-左侧
			for (i = 0; i < colsLen; i++) {
				elT = wrap.find('.gridCornerTitle:eq('+i+')');
				elD = wrap.find('.gridSidebar td:eq('+i+')');
				max = this._getMax(elT.width(), elD.width());
				elT.width(max);
				elD.width(max);
			}
			// 设置主内容模块的左边距值
			var conLeftWidth = wrap.find('.gridLayoutLeft').width();
			wrap.find('.gridLayoutRight').css('margin-left', conLeftWidth);

			var className = '';
			// 清零
			if(isReset){
				console.log('--- Beginning reset ---');
				$('.gridLayoutLeft').removeClass('shadow'); // 清除滚动阴影
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
					className = c.hasAmount ? 'gridHeaderAmount' : 'gridHeaderTitle';
					elT = wrap.find('.'+className).find('td:eq('+i+')');
					elD = wrap.find('.gridContentFirstTr td:eq('+i+')');
					elT.css('width', 'auto');
					elD.css('width', 'auto');
				}
			}

			// 同步宽度-右侧
			for (i = 0; i < indexLen; i++) {
				// 总计模块
				className = c.hasAmount ? 'gridHeaderAmount' : 'gridHeaderTitle';
				elT = wrap.find('.'+className).find('td:eq('+i+')');
				elD = wrap.find('.gridContentFirstTr td:eq('+i+')');
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
		// 滚动条响应事件
		onScroll: function(ev){
			var scrollerH = this.$.scrollerH;
			var scrollerV = this.$.scrollerV

			var header = this.$el.find('.gridHeader');
			var sidebar = this.$el.find('.gridSidebar');

			var left = scrollerH.getScrollPos();
			var top = scrollerV.getScrollPos();

			header.scrollLeft(left);
			sidebar.scrollTop(top);

			var el = $('.gridLayoutLeft');
			if(left){
				el.addClass('shadow');
			}else{
				el.removeClass('shadow');
			}
			return false;
		},
		// 浏览器窗口大小变化响应事件
		onSYSResize: function(ev){
			var self = this;
			this.calculate(true);
			setTimeout(function(){
				console.log('grid mod SYSResize')
				self.$.scrollerV.update();
				self.$.scrollerH.update();
			}, 0);

			return false;
		},
		// 主菜单状态变动响应事件
		onMenuToggle: function(ev){
			this.calculate(true);
			this.$.scrollerH.update();
			this.$.scrollerV.update();
			return false;
		},
		renderName: function(i, val, data, con){
			return $('<div class="uk-text-truncate left" title="'+val+'">'+val+'</div>').width(con.width);
		},
		// 获取两者间的最大值
		_getMax: function(a, b){
			return a>b ? a : b;
		}
	});
	exports.main = GridV2;
});