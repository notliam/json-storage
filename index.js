// Requires:
var fs = require('fs');

module.exports.init = function (db_location) {
	// Private vars
	let dbdir = db_location || 'dbs/';
	let currentdb = {ready:false, data:[]};
	let dbfiles = ['default.json'];
	let loglevel = 'NONE';

	let thisdb = this;

	this.get_status = function () {
		return currentdb.ready;
	}

	this.set_log_level = function (new_level = 'NONE') {
		loglevel = new_level;
	}

	this.drop_database = function () {
		// Drop it, debug only...
		currentdb = {ready:true, data:[]};
		return true;
	}

	// Save current db file
	this.save_db = function (backup) {
		fs.writeFile(dbdir + (backup?'_backup' : '') + dbfiles[0], JSON.stringify(currentdb.data), function (err) {
      if(err) this.log('CRITICAL! ERROR SAVING DATA FILE: '+err);
    });
	}

	this.insert = function (table_to_insert, data_to_insert) {
		if (data_to_insert.length!=undefined) {
			for(let i=0; i<data_to_insert.length; i++) {
				this.insert(table_to_insert, data_to_insert[i]);
			}
		} else {
			for(let i=0; i<currentdb.data.length; i++) {
				if(currentdb.data[i].table==table_to_insert.toLowerCase()) {
					if(this.compare_schema(data_to_insert, currentdb.data[i].schema)) {
						currentdb.data[i].data.push(data_to_insert);
						return true;
					}
					return false;
				}
			}
			currentdb.data.push({table:table_to_insert.toLowerCase(), data:[data_to_insert], schema:Object.keys(data_to_insert)});
		}
		return true;
	}

	this.compare_schema = function (table, schema) {
		let table_schema = Object.keys(table);
		for(let i=0; i<schema.length; i++) {
			if(table_schema.indexOf(schema[i]) == -1) {
				return false;
			}
		}
		return true;
	}

	this.select_data = function (table, fields, selectmax) {
		let matches = [];
		if(typeof fields == 'string') {
			fields = [fields];
		}
		for(let i=0; i<currentdb.data.length; i++) {
			if(currentdb.data[i].table==table.toLowerCase()) {
				if(selectmax==undefined || selectmax=='*') {
					matches = currentdb.data[i].data;
				} else {
					if(selectmax == 1) {
						matches = [currentdb.data[i].data[0]];
						break;
					}
					matches = currentdb.data[i].data.slice(0, parseInt(selectmax));
				}
			}
		}
		try {
			if(fields!=undefined && fields.length!=Object.keys(matches[0]).length && fields!='*') {
				let fieldmatches = [];
				for(match in matches) {
					let curmatch = {};
					for(field in fields) {
						curmatch[fields[field]] = matches[match][fields[field]];
					}
					fieldmatches.push(curmatch);
				}
				matches = fieldmatches;
			}
		} catch (e) {
			if(loglevel == 'ERROR') {
				this.log(e);
			}
			return [];
		}
		return matches;
	}

	this.select = function (table, check, selectmax, fields) {
		let matches = [];
		if(check[0]==undefined) {
			try {
				if(Object.keys(check).length > 0) {
					let tempcheck = [];
					for(let checkkey=0; checkkey<Object.keys(check).length; checkkey++) {
						tempcheck.push({key:Object.keys(check)[checkkey], comparison:'=', value:Object.values(check)[checkkey]});
					}
					check = tempcheck;
				}
			} catch (e) {
				if(loglevel == 'ERROR') {
					this.log(e);
				}
				check = [check];
			}
		}
		for(let i=0; i<currentdb.data.length; i++) {
			if(currentdb.data[i].table==table.toLowerCase() || table=='*') {
				let currenttable = currentdb.data[i].data;
				for(let k=0; k<check.length; k++) {
					if(k==0) {
						matches = this.check_match(currenttable, check[k].key, check[k].value, check[k].comparison);
					} else {
						matches = this.check_match(matches, check[k].key, check[k].value, check[k].comparison);
					}
				}
				try {
					if(fields!=undefined && fields.length!=Object.keys(matches[0]).length && fields!='*') {
						let fieldmatches = [];
						for(match in matches) {
							let curmatch = {};
							for(field in fields) {
								curmatch[fields[field]] = matches[match][fields[field]];
							}
							fieldmatches.push(curmatch);
						}
						matches = fieldmatches;
					}
				} catch (e) {
					if(loglevel == 'ERROR') {
						this.log(e);
					}
					return [];
				}
				if(selectmax==undefined || selectmax=='*') {
					return matches;
				} else {
					return selectmax==1?matches[0]:matches.slice(0, parseInt(selectmax));
				}
			}
		}
	}

	this.update = function (table, match, updates, selectcount) {
		//"users", [{key:"name", comparison:"=", value:"liam"}], [{key:"name", value:"Briam"}], 1)
		if(match[0]==undefined) {
			try {
				if(Object.keys(match).length > 0) {
					let tempmatch = [];
					for(let matchkey=0; matchkey<Object.keys(match).length; matchkey++) {
						tempmatch.push({key:Object.keys(match)[matchkey], comparison:'=', value:Object.values(match)[matchkey]});
					}
					match = tempmatch;
				}
			} catch (e) {
				if(loglevel == 'ERROR') {
					this.log(e);
				}
				match = [match];
			}
		}
		if(updates[0]==undefined) {
			try {
				if(Object.keys(updates).length > 0) {
					let tempupdates = [];
					for(let updateskey=0; updateskey<Object.keys(updates).length; updateskey++) {
						tempupdates.push({key:Object.keys(updates)[updateskey], value:Object.values(updates)[updateskey]});
					}
					updates = tempupdates;
				}
			} catch (e) {
				if(loglevel == 'ERROR') {
					this.log(e);
				}
				updates = [updates];
			}
		}
		for(var curtable=0; curtable<currentdb.data.length; curtable++) {
			if(currentdb.data[curtable].table == table) {
				break;
			}
		}
		let upd_count = 0;
		try {
			for(let i=0; i<currentdb.data[curtable].data.length; i++) {
				if(upd_count == selectcount) break;
				for(let j=0; j<match.length; j++) {
					if((match[j].comparison == '=' && currentdb.data[curtable].data[i][match[j].key].toLowerCase()==match[j].value) ||
					(match[j].comparison == '>' && currentdb.data[curtable].data[i][match[j].key]>match[j].value) ||
					(match[j].comparison == '<' && currentdb.data[curtable].data[i][match[j].key]<match[j].value) ||
					(match[j].comparison == '>=' && currentdb.data[curtable].data[i][match[j].key]>=match[j].value) ||
					(match[j].comparison == '<=' && currentdb.data[curtable].data[i][match[j].key]<=match[j].value)) {
						for(let k=0; k<updates.length; k++) {
							currentdb.data[curtable].data[i][updates[k].key] = updates[k].value;
						}
						upd_count++;
					}
				}
			}
			return true;
		} catch (e) {
			if(loglevel == "ERROR") {
				this.log(e);
			}
			return false;
		}
	}

	this.add_table = function (table_name, table_schema) {
		table_name = table_name.toLowerCase();
		table_schema = table_schema.map(t=>t.toLowerCase());
		if(this.get_table_names(currentdb.data).indexOf(table_name) == -1) {
			currentdb.data.push({data:[], table:table_name, schema:table_schema});
			return true;
		} else {
			this.log(`{table_name} definition already exists, not adding.`);
			return false;
		}
	}

	this.check_match = function (data, key, value, comparison) {
		let matching = [];
		switch(comparison) {
			case '>':
				return data.filter(d=> {return parseInt(d[key.toLowerCase()])>parseInt(value)});
			case '<':
				return data.filter(d=> {return parseInt(d[key.toLowerCase()])<parseInt(value)});
			case '>=':
				return data.filter(d=> {return parseInt(d[key.toLowerCase()])>=parseInt(value)});
			case '<=':
				return data.filter(d=> {return parseInt(d[key.toLowerCase()])<=parseInt(value)});
			case '!=':
				if(isNaN(value)) {
					return data.filter(d=> {return d[key.toLowerCase()].toLowerCase()!=value.toLowerCase()});
				} else {
					return data.filter(d=> {return d[key.toLowerCase()]!=value});
				}
			case '=':
			default:
				if(isNaN(value)) {
					return data.filter(d=> {return d[key.toLowerCase()].toLowerCase()==value.toLowerCase()});
				} else {
					return data.filter(d=> {return d[key.toLowerCase()]==value});
				}
		}
	}

	this.check_match_del = function (data, key, value, comparison, count) {
		let keeping = data;
		if(count == undefined) {
			count = data.length;
		}
		for(let i=0; i<data.length; i++) {
			if(isNaN(value)) {
				if((data[i][key.toLowerCase()]==value.toLowerCase() && comparison=='=') ||
								(data[i][key.toLowerCase()]!=value.toLowerCase() && comparison=='!=')) {
									keeping.splice(i--,1);
									count--;
				}
			} else if((data[i][key.toLowerCase()]>parseInt(value) && comparison=='>') ||
								(data[i][key.toLowerCase()]<parseInt(value) && comparison=='<') ||
								(data[i][key.toLowerCase()]<=parseInt(value) && comparison=='<=') ||
								(data[i][key.toLowerCase()]>=parseInt(value) && comparison=='>=') ||
								(data[i][key.toLowerCase()]==parseInt(value) && comparison=='=') ||
								(data[i][key.toLowerCase()]!=parseInt(value) && comparison=='!=')) {
									keeping.splice(i--,1);
									count--;
			}
			if(count == 0) return keeping;
		}
		return keeping;
	}

	this.delete = function (table, check, deletemax) {
		if(check[0]==undefined) {
			try {
				if(Object.keys(check).length > 0) {
					let tempcheck = [];
					for(let checkkey=0; checkkey<Object.keys(check).length; checkkey++) {
						tempcheck.push({key:Object.keys(check)[checkkey], comparison:'=', value:Object.values(check)[checkkey]});
					}
					check = tempcheck;
				}
			} catch (e) {
				if(loglevel == 'ERROR') {
					this.log(e);
				}
				check = [check];
			}
		}
		for(let i=0; i<currentdb.data.length; i++) {
			if(currentdb.data[i].table==table.toLowerCase() || table=='*') {
				let currenttable = currentdb.data[i];
				for(let j=0; j<check.length; j++) {
					currentdb.data[i].data = this.check_match_del(currenttable.data, check[j].key, check[j].value, check[j].comparison, deletemax);
				}
			}
		}
	}

	this.select_first = function (table, field, value) {
		return this.select_data(table, field, value, 1)[0];
	}

	this.select_table = function (table) {
		for(let i=0; i<currentdb.data.length; i++) {
			if(currentdb.data[i].table==table.toLowerCase()) {
				return currentdb.data[i].data;
			}
		}
		return [];
	}

	this.get_data = function () {
		return currentdb.data;
	}

	this.get_table_names = function (data_to_check) {
		return data_to_check.map(d=>d.table);
	}

	this.read_db_file = function (db_indx) {
		currentdbindx = db_indx;
		fs.readFile(dbdir + dbfiles[db_indx], function (err, data) {
			if(err) {
				currentdb = {ready:true, data:[]};
			} else {
				currentdb = {ready:true, data:JSON.parse(data)};
				currentdb.table_names = currentdb.data.map(d=>d.table);
			}
		});
	}

	this.log = function (...msg) {
		if(loglevel == 'DEBUG' || loglevel == 'ERROR') {
			msg.unshift(`${loglevel}:`);
			console.log(...msg);
		}
	}

	return this;
}
