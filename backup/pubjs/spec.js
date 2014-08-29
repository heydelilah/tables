define(function(require, exports, module) {
	var $ = require('jquery');
	var pubjs = require('@core/pub');
	var grid = require('@base/highGrid');
	var mock = require('mock');

	describe('HighGrid -固定头部行首布局表格', function () {
		describe('点击事件', function () {
			beforeEach(function () {
				this.fixture = $("<div>").attr("id","fixture").css("display","block").appendTo("body");

				var data = Mock.mock(
					{
						'amount|7': {
							'cpc|10000-200000000': 100
						},
						'items|10': [
							{
								'id|+1': 1,
								'name|0-10': 'test',
								'cpc|10-100000': 100
							}
						]
					}
				);

				this.grid = pubjs.core.create('grid', grid.base, {
					target: this.fixture,
					data: data,
					cols: [
						{name:'op',text:"操作", type: 'op'},
						{name:'id',text:"ID"},
						{name:'name',text:"名称", type:'index', width: 200}
					],
					indicator: [
						{name: 'cpc', text: 'CPC'}
					],
					hasAmount: true,
					hasSelect: true
				});
			});
			afterEach(function () {
				this.fixture.remove();
				this.grid.destroy();
			});
			it('eventCheckboxClick() -选中单行事件', function () {
				this.fixture.find('.M-HighGridListSidebar tr:eq(0) input').click();
				var data = this.grid.getValue();
				data.selects.length.should.equal(1);
				data.selects[0].should.equal('1');
			});
			it('eventSelectAll() -全选框点击事件', function () {
				this.fixture.find('.M-HighGridListCorner input[type="checkbox"]').click();
				var data = this.grid.getValue();
				data.selects.length.should.equal(10);
			});
		});
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

				this.grid = pubjs.core.create('grid', grid.base, {
					target: this.fixture,
					data: data,
					cols: [
						{name:'op',text:"操作", type: 'op'},
						{name:'id',text:"ID"},
						{name:'name',text:"名称", type:'index', width: 200}
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
			it('getData() -获取表格总数据', function () {
				var data = this.grid.getData();
				data.items.length.should.equal(10);
				var tr = this.fixture.find('.M-HighGridListSidebar tr');
				tr.length.should.equal(10);
			});
			it('setData(data) -设置表格总数据', function () {
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
				var tr = this.fixture.find('.M-HighGridListSidebar tr');
				tr.length.should.equal(5);
			});
			it('getValue() -empty -@todo', function () {
				// @todo
				// var data = this.grid.getValue();
				// data.selects.not.exist;
				// data.selects.should.equal('undefined');
				// data.highlights.should.equal('undefined');
			});
			it('getValue() -selects', function () {
				var dom = this.fixture.find('.M-HighGridListSidebar tr[data-id="3"] input[type="checkbox"]');
				if(dom){
					dom.click();
				}
				var data = this.grid.getValue();
				data.selects.length.should.equal(1);
				data.selects[0].should.equal('3');
			});
			it('setValue(value) -设置选中行 selects', function () {
				var data = this.grid.setValue({selects:[3]});
				var tr = this.fixture.find('.M-HighGridListSidebar tr[data-id="3"]');
				tr.length.should.equal(1);
				tr.hasClass('M-HighGridListRowSelected').should.to.true;
			});
			it('setValue(value) -设置高亮行 highlights', function () {
				var data = this.grid.setValue({highlights:[2]});
				var tr = this.fixture.find('.M-HighGridListSidebar tr[data-id="2"]');
				tr.length.should.equal(1);
				tr.hasClass('M-HighGridListRowHighlight').should.to.true;
			});
		});
		describe('数据远程加载', function () {
			beforeEach(function () {
				this.fixture = $("<div>").attr("id","fixture").css("display","block").appendTo("body");
				this.grid = pubjs.core.create('grid', grid.base, {
					target: this.fixture,
					url: '/v3/tests/data/highGrid.json',
					cols: [
						{name:'op',text:"操作", type: 'op'},
						{name:'id',text:"ID"},
						{name:'name',text:"名称", type:'index', width: 200}
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
					hasSelect: true,
					eventDataLoad: true
				});
			});
			afterEach(function () {
				this.fixture.remove();
				this.grid.destroy();
			});
			it('load() -加载远程数据', function (done) {
				var fixture = this.fixture;
				this.grid.onData = function(err, data){
					this.setData(data);
					var data = this.getData();
					data.items.length.should.equal(28);
					var tr = fixture.find('.M-HighGridListSidebar tr');
					tr.length.should.equal(28);
					done();
				}
			});
			it('reload(url) -重新加载数据 -@todo', function (done) {
				var fixture = this.fixture;
				this.grid.onGridDataLoad = function(ev){
					// 先测reload之前的数据
					var data = ev.param;
					data.items.length.should.equal(28);
					var tr = fixture.find('.M-HighGridListSidebar tr');
					tr.length.should.equal(28);

					// 要监听第二次的onData？ 不好做
					this.reload();
					done();
				}
			});
		});
	});
});