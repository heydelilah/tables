
window.Grid = function(config){
	this.$config = $.extend({
		cols: [
			{name:'checkbox',text:"口"},
			{name:'op',text:"操作"},
			{name:'id',text:"ID"},
			{name:'name',text:"名称", type:'index', render: 'renderName', width: 200, align: 'center'}
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
				'<div>',
					'<div class="gridCorner fl"></div>',
					'<div class="gridHeader fl"></div>',
				'</div>',
				'<div class="cl">',
					'<div class="gridSidebar fl"></div>',
					'<div class="gridContent fl" onscroll="fnScroll()" ></div>',
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

		this.$config.target.append(layout);
	},
	buildTd: function(c){
		var td = $('<td></td>');
		var con = $('<div/>').appendTo(td);

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
			td.html(c.html)
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
		var cols = this.$config.cols;
		var html = $([
			'<table cellspacing="0" cellpadding="0">',
				'<tr class="gridCornerHook"></tr>',
				'<tr>',
					'<td class="gridCornerAmount" colspan="'+cols.length+'">汇总</td>',
				'</tr>',
			'</table>'
		].join(''));

		var td = [];
		var el;
		for (var i = 0; i < cols.length; i++) {
			el = this.buildTd({
				'class': 'gridCornerTitle',
				'text': cols[i].text
			})
			td.push(el);
		};
		html.find('.gridCornerHook').append(td);
		return html;
	},
	buildTableHeader: function(){
		var indicator = this.$config.indicator;
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
			elAmount = this.buildTd({
				'text': data[indicator[i].name] || '-'
			});
			title.push(elTitle);
			amount.push(elAmount);
		};
		html.find('.gridHeaderTitle').append(title);
		html.find('.gridHeaderAmount').append(amount);
		return html;
	},
	buildTableSidebar: function(){
		var datas = this.$data.items;
		var cols = this.$config.cols;

		var dom = $('<table cellspacing="0" cellpadding="0"/>');

		var tr;
		var data, col;
		var html, width, isIndexCol, className, title;
		// var render;
		for (var i = 0; i < datas.length; i++) {
			data = datas[i];

			tr = this.buildTr({
				'class': (i%2!==0) ? 'gridSidebarName odd' : 'gridSidebarName'
			});

			for (var ii = 0; ii < cols.length; ii++) {
				column = cols[ii];

				className = '';

				isIndexCol = column.type == 'index'

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
					title = data[column.name]
				}
				td = this.buildTd({
					'text': data[column.name],
					'html': html,
					'width': width,
					'class': className,
					'title': title
				});
				tr.append(td);

				html = width = className = '';
			};
			dom.append(tr);
		};

		return dom;
	},
	buildTableContent: function(){
		var data = this.$data.items;
		var cols = this.$config.indicator;

		var html = $('<table  cellspacing="0" cellpadding="0"/>');
		var tr;
		for (var i = 0; i < data.length; i++) {

			tr = this.buildTr({
				'class': (i===0 )? 'gridContentFirstTr': ((i%2 !== 0)?'odd':'')
			});

			for (var ii = 0; ii < cols.length; ii++) {
				td = this.buildTd({
					text: data[i][cols[ii].name] || '-'
				});
				tr.append(td);
			};
			html.append(tr);
		};
		return html;
	},
	renderName: function(i, val, data, con){
		return $('<div class="uk-text-truncate left" title="'+val+'">'+val+'</div>').width(con.width);
	},
	calculate: function(){
		var wrap = this.$config.target;

		var colCount = wrap.find('.gridContentFirstTr>td').length; //get total number of column
		var aCount = wrap.find('.gridCorner .gridCornerTitle').length;

		var header = wrap.find('.gridHeader');
		var content = wrap.find('.gridContent');
		var sidebar = wrap.find('.gridSidebar');

		var width = wrap.width()-sidebar.width();
		var height = wrap.height();
		var scoller = 17;
		var border = 2;
		header.css('width', width-scoller-border);
		content.css('width', width-border);
		sidebar.css('height', height-scoller-border);
		content.css('height', height);


		wrap.find('.gridSidebarName').each(function(i){
			$(this).css('height', wrap.find('.gridContent tr:eq('+i+')').height());
		});

		wrap.find('.gridCornerTitle').each(function(i){
			$(this).css('width', wrap.find('.gridSidebar td:eq('+i+')').width());
		});

		var n = 0;
		var max, elHeader;
		var sum = 0;
		var self = this;
		var el;
		wrap.find('.gridContentFirstTr td').each(function(i){
			el = $(this);

			if (n < colCount){
				elHeader = wrap.find('.gridHeaderAmount td:eq('+i+')');

				max = self.max(elHeader.width(), el.width())
				sum += max;

				el.width(max);
				elHeader.width(max);
			}
			n++;
		});

		sum+= 8*25; // @todo

		wrap.find('.gridHeader table').width(sum);
		wrap.find('.gridContent table').width(sum);

		wrap.find('.gridCornerAmount').css('height',wrap.find('.gridHeader .gridHeaderAmount td:eq(1)').outerHeight()-border);
		// outerHeight把border也算上了
	},
	max: function(a, b){
		return a>b ? a : b;
	}
};



//function to support scrolling of title and first column
fnScroll = function(){
	$('.gridHeader').scrollLeft($('.gridContent').scrollLeft());
	$('.gridSidebar').scrollTop($('.gridContent').scrollTop());

	var left = $('.gridHeader').scrollLeft();
	var el = $('.gridSidebar');
	if(left){
		el.addClass('act');
	}else{
		el.removeClass('act');
	}
	// console.log($('.gridHeader').scrollLeft())
};
