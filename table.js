window.Grid = function(config){
	this.$config = $.extend({
		cols: [
			{name:'op',text:"操作", type: 'op'},
			{name:'id',text:"ID"},
			{name:'name',text:"名称", type:'index', render: 'renderName', width: 200}
		],
		indicator: [
			{name: 'cpc', text: 'CPC'},
			{name: 'cpm', text: 'CPM'},
			{name: 'cpa', text: 'CPA'},
			{name: 'clicks', text: '点击量'},
			{name: 'regs', text: '注册量'},
			{name: 'test', text: '字符串'},
			{name: 'rate', text: '比率'},
			{name: 'price', text: '价格'}
		],
		hasSelect: true,
		hasAmount: true,
		target: null
	}, config);

	this.$data = this.$config.data;

	this.build();
	this.calculate();
}
Grid.prototype = {
	$el: null,
	build: function(data){
		var layout = this.$el = $([
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

		// 绑定滚动事件
		this.$doms.tableContent.on('scroll', this.scrolling);

		this.$config.target.append(layout);

		// 绑定窗口改变大小事件
		$(window).resize(this.eventResize);
	},
	eventResize: function(ev){
		// 防止连续不断广播事件
		clearTimeout(this.$timeoutId);
		this.$timeoutId = setTimeout(function(){
			table.calculate(true);
		}, 150);
		return false;
	},
	buildTd: function(c){
		var td = con = $('<td></td>');

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
	buildTableCorner: function(){
		var c = this.$config;
		var cols = this.$config.cols;

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
		};
		dom.find('.gridCornerHook').append(td);
		return dom;
	},
	buildTableHeader: function(){
		var c = this.$config;
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
		};
		html.find('.gridHeaderTitle').append(title);

		// 总计模块
		if(c.hasAmount){
			html.find('.gridHeaderAmount').append(amount);
		}

		return html;
	},
	buildTableSidebar: function(){
		var datas = this.$data.items;
		var cols = this.$config.cols;

		var dom = $('<table cellspacing="0" cellpadding="0"/>');

		if(datas){
			var tr;
			var data, col;
			var html, width, isIndexCol, className, title, type;
			var className = '';

			for (var i = 0; i < datas.length; i++) {
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
				};
				dom.append(tr);
			};
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
		var cols = this.$config.indicator;

		var html = $('<table  cellspacing="0" cellpadding="0"/>');
		if(data){
			var tr;
			for (var i = 0; i < data.length; i++) {

				tr = this.buildTr({
					'class': (i===0 )? 'gridContentFirstTr even': ((i%2 === 0)?'even':'')
				});

				for (var ii = 0; ii < cols.length; ii++) {
					td = this.buildTd({
						text: data[i][cols[ii].name] || '-'
					});
					tr.append(td);
				};
				html.append(tr);
			}
		}else{
			html.append('<tr class="even"><td class="center" colspan="'+cols.length+'">无数据</td></tr>')
		}

		return html;
	},
	renderName: function(i, val, data, con){
		if(data.id%2 === 0){
			return $('<div class="uk-text-truncate left"><div>'+data.id+'</div><div>'+val+'</div></div>');
		}
		return $('<div class="uk-text-truncate left" title="'+val+'">'+val+'</div>').width(con.width);
	},
	calculate: function(isReset){
		var c = this.$config,
			wrap = c.target,
			data = this.$data;

		// 长度定义
		var datasLen = data.items && data.items.length || 0,
			indexLen = c.indicator.length,
			colsLen = c.cols.length;

		// DOM实例
		var header = wrap.find('.gridHeader'),
			content = wrap.find('.gridContent'),
			sidebar = wrap.find('.gridSidebar');

		var sum = 0,			// 总数
			max,			// 最大值
			space,			// 间距
			elT, elD, elL, elR;	// DOM对象


		// 同步宽度-左侧
		for (i = 0; i < colsLen; i++) {
			elT = wrap.find('.gridCornerTitle:eq('+i+')');
			elD = wrap.find('.gridSidebar td:eq('+i+')');
			max = this.max(elT.width(), elD.width());
			elT.width(max);
			elD.width(max);
		}

		// 设置主内容模块的左边距值
		var width = wrap.find('.gridLayoutLeft').width();
		wrap.find('.gridLayoutRight').css('margin-left', width);


		var hasAmount = c.hasAmount;
		var className = '';

		// 清零
		if(isReset){
			header.width(wrap.width() - width);
			content.width(wrap.width() - width);
			header.find('table').width(wrap.width() - width);
			content.find('table').width(wrap.width() - width);
		}
		// for (i = 0; i < indexLen; i++) {
		// 	// 总计模块
		// 	className = c.hasAmount ? 'gridHeaderAmount' : 'gridHeaderTitle';
		// 	elT = wrap.find('.'+className).find('td:eq('+i+')');
		// 	elD = wrap.find('.gridContentFirstTr td:eq('+i+')');
		// 	elT.css('width', 'none');
		// 	elD.css('width', 'none');
		// }

		// 同步宽度-右侧
		for (i = 0; i < indexLen; i++) {
			// 总计模块
			className = c.hasAmount ? 'gridHeaderAmount' : 'gridHeaderTitle';
			elT = wrap.find('.'+className).find('td:eq('+i+')');
			elD = wrap.find('.gridContentFirstTr td:eq('+i+')');
			space = elT.outerWidth() - elT.width();
			max = this.max(elT.width(), elD.width());
			sum = sum + max + space;
			elT.width(max);
			elD.width(max);
		}

		// 同步高度-汇总模块
		elL = wrap.find('.gridCornerAmount');
		elR = wrap.find('.gridHeaderAmount');
		elL.height(elR.height());

		// 同步高度-下侧
		for (i = 0; i < datasLen; i++) {
			elL = sidebar.find('tr:eq('+i+')');
			elR = content.find('tr:eq('+i+')');
			max = this.max(elL.height(), elR.height());
			elL.height(max);
			elR.height(max);
		}

		// 出现滚动条时，要减去滚动条的宽度
		var hasScollerV = (sidebar.height() > wrap.height()) ? true : false;
		var hasScollerH = (sum > content.width()) ? true : false;
		var scollerV = hasScollerV ? 17: 0;
		var scollerH = hasScollerH ? 17: 0;
		var border = 2;

		// 设置容器宽高
		// 固定下table的宽度，窗口变化时候使得不自适应，
		// 使得窗口过于小的时候，也有一个最小宽度
		header.find('table').width(sum);
		content.find('table').width(sum)

		if(hasScollerV){
			console.log('hasScollerV')
			header.width(header.width() - scollerV)
		}

		var height = wrap.height()
		sidebar.css('height', height-scollerH -border);
		content.css('height', height);
	},
	max: function(a, b){
		// return Math.round(a>b ? a : b);
		return a>b ? a : b;
	},
	scrolling: function(ev){
		var content = $(ev.target);
		var header = $('.gridHeader');
		var sidebar = $('.gridSidebar');

		var left = content.scrollLeft()
		var top = content.scrollTop()

		header.scrollLeft(left);
		sidebar.scrollTop(top);

		var el = $('.gridLayoutLeft');
		if(left){
			el.addClass('shadow');
		}else{
			el.removeClass('shadow');
		}
	}
};
