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

function getdb(name) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', name+'.db', true);
	xhr.responseType = 'arraybuffer';
	xhr.onload = function(e) {
		var uInt8Array = new Uint8Array(this.response);
		db = new SQL.Database(uInt8Array);
		var s = document.getElementById("search");
		var inps = s.getElementsByTagName("input");
		for (i in inps) {
			if (inps[i].type == 'text') {
				autocomp(inps[i].id);
			}
		}
		console.log(name);
	};
	xhr.send();
}


var termreq = new XMLHttpRequest();
var terms = document.getElementById('term');
termreq.open('GET', 'terms.json', true);
termreq.responseType = 'json';
var termdict = null;
termreq.onload = function(e) {
	termdict = this.response;
	var hstr = "<p>Last Updated: "+termdict['updated']+"</p><select>";
	for (const [value, name] of Object.entries(termdict)) {
		if (value != 'updated') {
			hstr += '<option value='+value+'>'+name+'</option>';
		}
	}
	hstr += "</select>";
	hstr += "<div class='submit'><input type='submit' value='Load Term' /></div>";
	terms.innerHTML = hstr;
};
termreq.send();


terms.addEventListener('submit', function (e) {
	e.preventDefault();
	var v = terms.getElementsByTagName('select')[0];
	getdb(v.value);
	document.getElementById('termname').innerHTML = termdict[v.value];
});


document.getElementById("search").addEventListener('submit', function (e) {
	e.preventDefault();
	var searchql = "SELECT * FROM courses WHERE ";
	var search = document.getElementById('search');
	var inps = search.getElementsByTagName('input');
	var terms = 0;
	for (i in inps) {
		if (inps[i].type == 'checkbox') {
			continue;
		}
		if (inps[i].type == 'text' && inps[i].value != '') {
			if (terms > 0) {
				searchql += " AND "
			}
			if (inps[i].id == 'start') {
				searchql += inps[i].id +' >= '+inps[i].value;
			} else if (inps[i].id == 'end') {
				searchql += inps[i].id +' <= '+inps[i].value;
			} else {
				searchql += inps[i].id+" LIKE '%"+inps[i].value+"%'";
			}
			terms++;
		}
	}
	var days = document.getElementById('days').getElementsByTagName('input');
	dstr = "";
	for (d in days) {
		if (days[d].type == 'checkbox') {
			if (days[d].checked) {
				dstr += '%'+days[d].value;
			}
		}
	}
	if (dstr != "") {
		if (terms > 0) {
			searchql += " AND ";
		}
		searchql += "days LIKE '"+dstr+"%'";
		terms++;
	}
	var oc = document.getElementById('status');
	if (oc.value != '') {
		if (terms > 0) {
				searchql += " AND "
		}
		searchql += oc.id+" LIKE "+oc.value;
	}
	console.log(searchql);
	var results = document.getElementById('results');
	var r = db.exec(searchql);
	if (r.length == 0) {
		results.innerHTML = "NO RESULTS";
		results.scrollIntoView();
		return;
	}
	var d = r[0];
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
	results.scrollIntoView();
}, false);
