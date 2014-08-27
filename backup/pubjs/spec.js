define(function(require, exports, module) {
	var $ = require('jquery');
	var pubjs = require('@core/pub');
	var grid = require('@base/testGrid');
	var mock = require('mock');

	describe('表格', function () {
		describe('数据输入输出', function () {
			beforeEach(function () {
				this.fixture = $("<div>").attr("id","fixture").css("display","block").appendTo("body");

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
						'items|10': [
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
								'test|13': 'test'
							}
						]
					}
				);

				this.grid = pubjs.core.create('grid', grid.main, {
					target: this.fixture,
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
			});

			afterEach(function () {
				this.fixture.remove();
				this.grid.destroy();
			});

			it('getData', function () {
				var data = this.grid.getData();
				data.items.length.should.equal(10);
			});
			it('setData', function () {
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
						'items|5': [
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
								'test|13': 'test'
							}
						]
					}
				);
				this.grid.setData(data);
				this.grid.$data.items.length.should.equal(5);
			});
			it('getValue - empty', function () {
				// @todo
				// var data = this.grid.getValue();
				// data.selects.not.exist;
				// data.selects.should.equal('undefined');
				// data.highlights.should.equal('undefined');
			});
			it('setValue - selects', function () {
				var data = this.grid.setValue({selects:[3]});
				var tr = this.fixture.find('.M-HighGridSidebar tr[data-id="3"]');
				tr.length.should.equal(1);
				tr.hasClass('M-HighGridRowSelected').should.to.true;
			});
			it('setValue - highlights', function () {
				var data = this.grid.setValue({highlights:[2]});
				var tr = this.fixture.find('.M-HighGridSidebar tr[data-id="2"]');
				tr.length.should.equal(1);
				tr.hasClass('M-HighGridRowHighlight').should.to.true;
			});
		});
	});
});