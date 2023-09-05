
function setGoTop() {
	var aTagList = document.getElementsByTagName('a');
	for (var i = 0; i < aTagList.length; i++) {
		if (aTagList[i].href.match(/#top/i)) {
			aTagList[i].onclick = goPageTop;
		}
	}
}
var goTopMove = 10;
var goTopPosi;
function goPageTop() {
	var yPos = document.body.scrollTop || document.documentElement.scrollTop;
	mObj(yPos);
	return false;
}
function mObj(y, s) {
	if (s) goTopMove = s;
	goTopPosi = parseInt(y - y * 2 / goTopMove);
	scrollTo(0, goTopPosi);
	if (goTopPosi > 0) setTimeout('mObj(goTopPosi, goTopMove)', 1);
}
if (window.addEventListener) window.addEventListener('load', setGoTop, false);
if (window.attachEvent) window.attachEvent('onload', setGoTop);
