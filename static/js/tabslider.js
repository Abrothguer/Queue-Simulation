var hidWidth;
var scrollBarWidths = 40;

var widthOfList = function(){
    var itemsWidth = 0;
    $('.list a').each(function(){
        var itemWidth = $(this).outerWidth();
        itemsWidth+=itemWidth;
    });
    return itemsWidth;
};

var widthOfHidden = function(){
    var ww = 0 - $('.wrapper').outerWidth();
    var hw = (($('.wrapper').outerWidth())-widthOfList()-getLeftPosi())-scrollBarWidths;
    var rp = $(document).width() - ($('.nav-item.nav-link').last().offset().left + $('.nav-item.nav-link').last().outerWidth());

    if (ww>hw) {
        //return ww;
        return (rp>ww?rp:ww);
    }
    else {
        //return hw;
        return (rp>hw?rp:hw);
    }
};

var getLeftPosi = function(){
    var ww = 0 - $('.wrapper').outerWidth();
    var lp = $('.list').position().left;

    if (ww>lp) {
        return ww;
    }
    else {
        return lp;
    }
};

var reAdjust = function(){
    // check right pos of last nav item
    var rp = $(document).width() - ($('.nav-item.nav-link').last().offset().left + $('.nav-item.nav-link').last().outerWidth());
    if (($('.wrapper').outerWidth()) < widthOfList() && (rp<0)) {
        $('.scroller-right').show().css('display', 'flex');
    }
    else {
        $('.scroller-right').hide();
    }

    if (getLeftPosi()<0) {
        $('.scroller-left').show().css('display', 'flex');
    }
    else {
        $('.item').animate({left:"-="+getLeftPosi()+"px"},'slow');
    	$('.scroller-left').hide();
    }
}

reAdjust();
$(window).on('resize',function(e){
  	reAdjust();
});

$('.scroller-right').click(function() {

    $('.scroller-left').fadeIn('slow');
    $('.scroller-right').fadeOut('slow');

    var pace = widthOfHidden();
    pace = pace > -500 ? pace-100 : -500;

    $('.list').animate({left:"+="+pace+"px"},'slow',function(){
        reAdjust();
    });
});

$('.scroller-left').click(function() {

	$('.scroller-right').fadeIn('slow');
    $('.scroller-left').fadeOut('slow');

    console.log(getLeftPosi());
  	$('.list').animate({left:"-="+getLeftPosi()+"px"},'slow',function(){
  	    reAdjust();
  	});
});
