$("#arrival-div").change(function(){

    if($("input[name='arrival_type']:checked").val() === "random"){
        $("#deterministic").hide();
        $("#distributions").show();
    }
    else{
        $("#deterministic").show();
        $("#distributions").hide();
    }

});

$("#distributions").change(function(){

    if($("input[name='distributions']:checked").val() === "uniform"){
        $("#uniform").show();
        $("#exponential").hide();
        $("#normal").hide();
        $("#custom").hide();
    }
    else if($("input[name='distributions']:checked").val() === "exponential"){
        $("#uniform").hide();
        $("#exponential").show();
        $("#normal").hide();
        $("#custom").hide();
    }
    else if($("input[name='distributions']:checked").val() === "normal"){
        $("#uniform").hide();
        $("#exponential").hide();
        $("#normal").show();
        $("#custom").hide();
    }
    else{
        $("#uniform").hide();
        $("#exponential").hide();
        $("#normal").hide();
        $("#custom").show();
    }

});

$("#deterministic").hide();
$("#distributions").show();
$("#arrival_type-1").click();
$("#uniform").hide();
$("#exponential").hide();
$("#normal").hide();
$("#custom").hide();

function addEntryDeterm(){

    row = document.createElement("TR");

    arrival = document.createElement("INPUT");
    arrival.setAttribute("id")

    attendance = document.createElement("INPUT");
}


// Slides
// var hidWidth;
// var scrollBarWidths = 40;
//
// var widthOfList = function(){
//   var itemsWidth = 0;
//   $('.list li').each(function(){
//     var itemWidth = $(this).outerWidth();
//     itemsWidth+=itemWidth;
//   });
//   return itemsWidth;
// };
//
// var widthOfHidden = function(){
//   return (($('.wrapper').outerWidth())-widthOfList()-getLeftPosi())-scrollBarWidths;
// };
//
// var getLeftPosi = function(){
//   return $('.list').position().left;
// };
//
// var reAdjust = function(){
//   if (($('.wrapper').outerWidth()) < widthOfList()) {
//     $('.scroller-right').show();
//   }
//   else {
//     $('.scroller-right').hide();
//   }
//
//   if (getLeftPosi()<0) {
//     $('.scroller-left').show();
//   }
//   else {
//     $('.item').animate({left:"-="+getLeftPosi()+"px"},'slow');
//   	$('.scroller-left').hide();
//   }
// }
//
// reAdjust();
//
// $(window).on('resize',function(e){
//   	reAdjust();
// });
//
// $('.scroller-right').click(function() {
//
//   $('.scroller-left').fadeIn('slow');
//   $('.scroller-right').fadeOut('slow');
//
//   $('.list').animate({left:"+="+widthOfHidden()+"px"},'slow',function(){
//
//   });
// });
//
// $('.scroller-left').click(function() {
//
// 	$('.scroller-right').fadeIn('slow');
// 	$('.scroller-left').fadeOut('slow');
//
//   	$('.list').animate({left:"-="+getLeftPosi()+"px"},'slow',function(){
//
//   	});
// });
