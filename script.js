var db = null;
var acompsql = null;

function getvals(v) {
	arr = [];
	if (!v || v.length == 0) {
		return arr;
	}
	for (let a of v[0].values) {
		arr.push(a[0]);
	}
	return arr;
}

var xhr = new XMLHttpRequest();
xhr.open('GET', '202010.db', true);
xhr.responseType = 'arraybuffer';
xhr.onload = function(e) {
	var uInt8Array = new Uint8Array(this.response);
	db = new SQL.Database(uInt8Array);
	autocomp("Title", 'Title');
	autocomp("Instr", 'Instr');
	autocomp("days", 'days');
	autocomp("start", 'start');
	autocomp("Subj", 'Subj');
};
xhr.send();
console.log('begin');

document.getElementsByTagName("form")[0].addEventListener('submit', function (e) {
	e.preventDefault();
	var searchql = "SELECT * FROM courses WHERE "
	var search = document.getElementById('search');
	var inps = search.getElementsByTagName('input');
	var terms = 0;
	for (i in inps) {
		console.log(inps[i].id+": "+inps[i].value);
		if (inps[i].id != undefined && inps[i].value != '') {
			if (terms > 0) {
				searchql += " AND "
			}
			searchql += inps[i].id+" LIKE '%"+inps[i].value+"%'";
			terms++;
		}
	}
	console.log(searchql);
	var r = db.exec(searchql);
	console.log(r);
}, false);
