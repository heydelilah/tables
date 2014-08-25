define(function(require, exports){
	var $ = require('jquery');
	var pubjs = require('@core/pub');
	var util = require('util');
	var view = require('@base/view');
	var mock = require('mock');

	// 模拟数据
	var data = Mock.mock(
		{
			'amount|7': {
				'cpc|100000000000-20000000000000': 100,
				'cpm|1-10000': 100,
				'cpa|100000-1000000000': 100,
				'clicks|1-10000': 100,
				'regs|1-1': 100,
				'rate|1-10000': 100,
				'price|1': 100
			},
			'items|8': [
				{
					'id|+1': 1,
					'name|0-10': 'test',
					'cpc|1-100': 100,
					'cpm|1-100': 100,
					'cpa|1-100': 100,
					'clicks|1-100': 100,
					'regs|1-100': 100,
					'rate|1-100': 100,
					'price|1-100': 100

					// ,'checkbox|1': '口',
					// 'op|1': '操作',
					,'test|10': 'test'
				}
			]
		}
	);

	var Main = view.container.extend({
		afterBuild: function(){
			var con = $('<div class="mt20 ml20"></div>');
			con.width(1000);
			// var con = this.$el;
			con.height(500);

			this.createAsync('grid2', 'common/grid.main', {
				target: con,
				data: data,
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
				hasAmount: true,
				hasSelect: true
			});

			this.append(con)
		}
	});
	exports.main = Main;


});
