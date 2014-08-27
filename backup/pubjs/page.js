define(function(require, exports){
	var $ = require('jquery');
	var view = require('@base/view');

	// 模拟数据
	require('mock');
	var data = Mock.mock(
		{
			'amount|7': {
				'cpc|10000-200000000': 100,
				'cpm|1-1000': 100,
				'cpa|1-100': 100,
				'clicks|1-10': 100,
				'regs|1-10': 100,
				'rate|1-10': 100,
				'price|1-10': 100
			},
			'items|28': [
				{
					'id|+1': 1,
					'name|0-10': 'test',
					'cpc|10-100000': 100,
					'cpm|10-100000': 100,
					'cpa|10-100000': 100,
					'clicks|1-1000': 100,
					'regs|1-100': 100,
					'rate|1-100': 100,
					'price|1-100': 100

					// ,'checkbox|1': '口',
					// 'op|1': '操作',
					,'test|13': 'test'
				}
			]
		}
	);

	var Main = view.container.extend({
		afterBuild: function(){
			var con = $('<div></div>');
			// con.width(1000);
			// var con = this.$el;
			// con.height(500);


			this.createAsync('highGrid', '@base/testGrid.main', {
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

			this.append(con);

			var setData = $('<input type="button" value="setData"/>').appendTo(this.$el);
			this.uiBind(setData, 'click', 'eventSetdata');
			var getIds = $('<input type="button" value="getValue" class="ml10"/>').appendTo(this.$el);
			this.uiBind(getIds, 'click', 'eventGetValue');
			var setValue = $('<input type="button" value="setValue" class="ml10"/>').appendTo(this.$el);
			this.uiBind(setValue, 'click', 'eventSetValue');
			var highlight = $('<input type="button" value="highlight" class="ml10"/>').appendTo(this.$el);
			this.uiBind(highlight, 'click', 'eventHighlight');
		},
		eventSetdata: function(ev){
			var data = Mock.mock(
				{
					'amount|7': {
						'cpc|10000-200000000': 100,
						'cpm|1-1000': 100,
						'cpa|1-100': 100,
						'clicks|1-10': 100,
						'regs|1-10': 100,
						'rate|1-10': 100,
						'price|1-10': 100
					},
					'items|1-18': [
						{
							'id|+1': 1,
							'name|0-10': 'test',
							'cpc|10-100000': 100,
							'cpm|10-100000': 100,
							'cpa|10-100000': 100,
							'clicks|1-1000': 100,
							'regs|1-100': 100,
							'rate|1-100': 100,
							'price|1-100': 100,
							'test|1-23': 'test'
						}
					]
				}
			);
			this.$.highGrid.setData(data);
			return false;
		},
		eventGetValue: function(ev){
			var data = this.$.highGrid.getValue();
			console.log(data)
			return false;
		},
		eventSetValue: function(ev){
			this.$.highGrid.setValue({selects:[1,3,4,5]});
			return false;
		},
		eventHighlight: function(ev){
			this.$.highGrid.setValue({highlights:[2]});
			return false;
		}
	});
	exports.main = Main;


});
