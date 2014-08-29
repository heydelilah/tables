define(function(require, exports){
	var $ = require('jquery');
	var view = require('@base/view');

	var Main = view.container.extend({
		afterBuild: function(){
			var con = $('<div></div>');
			// con.width(1000);
			// var con = this.$el;
			// con.height(500);

			this.createAsync('highGrid', 'grid/highGrid-grid.main', {
				target: con
			});

			this.append(con);

			// var buttons = $('<div class="buttons"></div>').appendTo(this.$el);
			// $([
			// 	'<input type="button" value="setData"  class="setData"/>',
			// 	'<input type="button" value="getValue" class="getValue ml10"/>',
			// 	'<input type="button" value="setValue" class="setValue ml10"/>',
			// 	'<input type="button" value="highlight" class="highlight ml10"/>',
			// 	'<input type="button" value="resetValue" class="resetValue ml10"/>',
			// 	'<input type="button" value="reload" class="reload ml10"/>'
			// ].join('')).appendTo(buttons);

			// this.uiBind(buttons.find('.setData'), 'click', 'setData', 'eventButtonClick');
			// this.uiBind(buttons.find('.getValue'), 'click', 'getValue', 'eventButtonClick');
			// this.uiBind(buttons.find('.setValue'), 'click', 'setValue', 'eventButtonClick');
			// this.uiBind(buttons.find('.highlight'), 'click', 'highlight', 'eventButtonClick');
			// this.uiBind(buttons.find('.resetValue'), 'click', 'resetValue', 'eventButtonClick');
			// this.uiBind(buttons.find('.reload'), 'click', 'reload', 'eventButtonClick');
		},
		eventButtonClick: function(ev, dom){
			var data;
			var grid = this.$.highGrid;

			switch(ev.data){
				// 数据输入输出部分
				case 'setData':
					data = Mock.mock(
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
					grid.setData(data);
				break;
				case 'getValue':
					data = grid.getValue();
					console.log(data);
				break;
				case 'setValue':
					grid.setValue({selects:[1,3,4,5],highlights:[4,5]});
				break;
				case 'highlight':
					grid.setValue({highlights:[2]});
				break;
				case 'resetValue':
					grid.resetValue();
				break;
				// 数据远程加载部分
				case 'reload':
					grid.reload('/v3/tests/data/highGrid.json');
				break;
			}
			return false;
		}
	});
	exports.main = Main;
});
