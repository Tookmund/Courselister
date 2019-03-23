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

document.getElementById("search").addEventListener('submit', function (e) {
	e.preventDefault();
	var searchql = "SELECT * FROM courses WHERE "
	var search = document.getElementById('search');
	var inps = search.getElementsByTagName('input');
	var terms = 0;
	for (i in inps) {
		if (inps[i].id != undefined && inps[i].value != '') {
			if (terms > 0) {
				searchql += " AND "
			}
			searchql += inps[i].id+" LIKE '%"+inps[i].value+"%'";
			terms++;
		}
	}
	var oc = document.getElementById('status');
	if (oc.value != '') {
		if (terms > 0) {
				searchql += " AND "
		}
		searchql += oc.id+" LIKE "+oc.value;
	}
	console.log(searchql);
	var r = db.exec(searchql);
	var d = r[0];
	var results = document.getElementById('results');
	results.innerHTML = '';
	var fin = '<table><tr>';
	for (c in d.columns) {
		fin += '<th>'+d.columns[c]+'</th>';
	}
	fin += '</tr>';
	for (c in d.values) {
		fin += '<tr>';
		for (row in d.values[c]) {
			fin += '<td>'+d.values[c][row]+'</td>';
		}
		fin += '</tr>';
	}
	fin += '</table>';
	results.innerHTML = fin;
}, false);
