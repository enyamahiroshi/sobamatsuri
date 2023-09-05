/* sample01
======================================== */
$(function() {
	var nav = $('.box_img');
	nav.hover(
		function(){
			$(this).fadeTo(500,0.5);
		},
		function () {
			$(this).fadeTo(500,1);
		}
	);
});
