$(document).ready(function(){
	fnAdjustTable();
});


fnAdjustTable = function(){
	var colCount = $('#firstTr>td').length; //get total number of column
	var m = 0;
	var n = 0;

	var a = 0;
	var aCount = $('#firstTd .tableHeaderTitle').length;
	console.log(aCount)


	$('.tableHeaderTitle').each(function(i){
		if (a < aCount){
			// $('#firstTd').css("width",$('.tableFirstCol').width());
			$(this).css('width',$('#firstcol td:eq('+a+')').width());
			// $(this).css('width',$('#table_div td:eq('+m+')').innerWidth());
		}
		a++;
	});

	$('.tableHeader').each(function(i){
		if (m < colCount){
			$('#firstTd').css("width",$('.tableFirstCol').width());
			$(this).css('width',$('#table_div td:eq('+m+')').width());
			// $(this).css('width',$('#table_div td:eq('+m+')').innerWidth());
		}
		m++;
	});

	$('.tableFirstColTr').each(function(i){
		// var h = $('#table_div td:eq('+colCount*n+')').height();
		var h = $('#table_div tr:eq('+n+')').height();
		console.log(h)
		$(this).css('height', h);
		n++;
	});

};


//function to support scrolling of title and first column
fnScroll = function(){
	$('#divHeader').scrollLeft($('#table_div').scrollLeft());
	$('#firstcol').scrollTop($('#table_div').scrollTop());
};
