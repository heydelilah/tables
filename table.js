
window.Grid = function(config){
	this.$config = $.extend({
		cols: [
			{name:'checkbox',text:"口"},
			{name:'op',text:"操作"},
			{name:'id',text:"ID"},
			{name:'name',text:"名称", type:'index', render: 'renderName'}
		],
		indicator: [
			{name: 'cpc', text: 'CPC'},
			{name: 'cpm', text: 'CPM'},
			{name: 'cpa', text: 'CPA'},
			{name: 'clicks', text: '点击量'},
			{name: 'regs', text: '注册量'},
			{name: 'rate', text: '比率'},
			{name: 'price', text: '价格'}
		]
	}, config);

	this.$data = this.$config.data;

	this.build();
	// this.calculate();
}
Grid.prototype = {
	$el: null,
	build: function(data){
		var layout = this.$el = $([
			'<table cellspacing="0" cellpadding="0" border="0" >',
				'<tr>',
					'<td>',
						'<div class="gridCorner"></div>',
					'</td>',
					'<td>',
						'<div class="gridHeader"></div>',
					'</td>',
				'</tr>',
				'<tr>',
					'<td valign="top">',
						'<div class="gridSidebar"></div>',
					'</td>',
					'<td>',
						'<div class="gridContent" onscroll="fnScroll()" ></div>',
					'</td>',
				'</tr>',
			'</table>'
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
	},
	buildTd: function(c){
		var td = $('<td></td>');
		if(c.class){
			td.addClass(c.class);
		}
		if(c.text){
			td.text(c.text);
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
			'<table cellspacing="0" cellpadding="0" border="1">',
				'<tr class="gridCornerHook"></tr>',
				'<tr>',
					'<td class="gridCornerAmout" colspan="'+cols.length+'">汇总</td>',
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
			'<table width="1500px" cellspacing="0" cellpadding="0" border="1">',
				'<tr class="gridHeaderTitle"></tr>',
				'<tr class="gridHeaderAmount"></tr>',
			'</table>'
		].join(''));

		var title = [];
		var amount = [];
		var elTitle, elAmount;
		for (var i = 0; i < indicator.length; i++) {
			elTitle = this.buildTd({
				'text': indicator[i].text
			});
			elAmount = this.buildTd({
				'text': data[indicator[i].name]
			});
			title.push(elTitle);
			amount.push(elAmount);
		};
		html.find('.gridHeaderTitle').append(title);
		html.find('.gridHeaderAmount').append(amount);
		return html;
	},
	buildTableSidebar: function(){
		var datas = this.$data.items; // [{},{}]
		var cols = this.$config.cols;

		var dom = $('<table width="230px" cellspacing="0" cellpadding="0" border="1"/>');

		var tr;
		var data, col;
		var html;
		var render;
		for (var i = 0; i < datas.length; i++) {
			data = datas[i];
			tr = this.buildTr({
				'class': 'gridSidebarName'
			});

			for (var ii = 0; ii < cols.length; ii++) {
				col = cols[ii];
				render = cols[ii].render
				if(render){
					html = this[render](ii, data[col.name], data);
				}
				td = this.buildTd({
					text: data[col.name],
					html: html
				});
				tr.append(td)
				html = '';
			};
			dom.append(tr);
		};

		return dom;
	},
	buildTableContent: function(){
		var data = this.$data.items;
		var cols = this.$config.indicator;

		var html = $('<table width="1500px" cellspacing="0" cellpadding="0" border="1"/>');
		var tr;
		for (var i = 0; i < data.length; i++) {
			tr = this.buildTr({
				'class': (i===0 )? 'gridContentFirstTr': ''
			});

			for (var ii = 0; ii < cols.length; ii++) {
				td = this.buildTd({
					text: data[i][cols[ii].name]
				});
				tr.append(td)
			};
			html.append(tr);
		};
		return html;
	},
	renderName: function(i, val, data){
		return val+'~';
	},
	calculate: function(){
		// var el = this.$el;
		var el = $('body');

		var colCount = el.find('.gridContentFirstTr>td').length; //get total number of column
		var aCount = el.find('.gridCorner .gridCornerTitle').length;

		var i = 0;
		el.find('.gridHeaderTitle td').each(function(i){
			if (i < colCount){
				$(this).css('width',el.find('.gridContentFirstTr td:eq('+i+')').width());
			}
			i++;
		});

		i = 0;
		el.find('.gridSidebarName').each(function(i){
			var h = el.find('.gridContent tr:eq('+i+')').height();
			$(this).css('height', h);
			i++;
		});

		i = 0;
		el.find('.gridCornerTitle').each(function(i){
			if (i < aCount){
				$(this).css('width',el.find('.gridSidebar td:eq('+i+')').width());
				$(this).css('height',el.find('.gridHeader td:eq('+i+')').height());
			}
			i++;
		});
		el.find('.gridCornerAmout').css('height',el.find('.gridHeader .gridHeaderAmount td:eq(1)').height());
	}
};



//function to support scrolling of title and first column
fnScroll = function(){
	$('.gridHeader').scrollLeft($('.gridContent').scrollLeft());
	$('.gridSidebar').scrollTop($('.gridContent').scrollTop());
};
