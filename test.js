var assert = require('assert');

var jsonstorage = require('./storage-json').init();

describe('storage-json', function() {
  describe('#drop_database()', function() {
    it('should return true (so the test starts off from a clean slate)', function() {
      assert.equal(true, jsonstorage.drop_database());
    });
  });
	describe('#insert() user "Liam", 26', function() {
    it('should return true', function() {
      assert.equal(true, jsonstorage.insert("Users", {name:"Liam", age:26}));
    });
  });
	describe('#get_data() access non-existing data', function() {
    it('should error', function() {
      assert.throws(()=>{return jsonstorage.get_data()[6].name}, TypeError);
    });
  });
	describe('#insert() user "Steve", 26', function() {
		it('should return true', function() {
			assert.equal(true, jsonstorage.insert("Users", {name:"Steve", age:25}));
		});
	});
	describe('#insert() user "Dave", 21', function() {
		it('should return true', function() {
			assert.equal(true, jsonstorage.insert("Users", {name:"Dave", age:21}));
		});
	});
	describe('#insert() user "Cat", 28', function() {
		it('should return true', function() {
			assert.equal(true, jsonstorage.insert("Users", {name:"Cat", age:28}));
		});
	});
	describe('#insert() user "Reece", 13', function() {
		it('should return true', function() {
			assert.equal(true, jsonstorage.insert("Users", {name:"Reece", age:13}));
		});
	});
  describe('#insert() role "Developer" with salary (30000) and short code ("DEV")', function() {
		it('should return true', function() {
			assert.equal(true, jsonstorage.insert("Roles", {role_name:"Developer", base_salary:30000, code:"DEV"}));
		});
	});
  describe('#insert() role "Project Manager" with salary (28000) and short code ("PM")', function() {
		it('should return true', function() {
			assert.equal(true, jsonstorage.insert("Roles", {role_name:"Project Manager", base_salary:28000, code:"PM"}));
		});
	});
  describe('#insert() an array in to roles table (3 new entries)', function() {
		it('should return true', function() {
			assert.equal(true, jsonstorage.insert("Roles", [{role_name:"Sales", base_salary:22000, code:"SAL"}, {role_name:"Lead Developer", base_salary:45000, code:"LDV"}, {role_name:"Junior Developer", base_salary:22000, code:"JDV"}]));
		});
	});
  describe('#add_table() users as new table', function() {
		it('should return false (table exists)', function() {
			assert.equal(false, jsonstorage.add_table("users", ["age", "name"]));
		});
	});
  describe('#add_table() tasks as new table, with schema {id,worktobedone}', function() {
		it('should return true, empty table tasks created', function() {
			assert.equal(true, jsonstorage.add_table("tasks", ["ID", "WoRkTobedone"]));
		});
	});
  describe('#insert() to tasks with wrong schema {name,age}', function() {
		it('should return false', function() {
			assert.equal(false, jsonstorage.insert("tasks", {name: "twelve", age: 12}));
		});
	});
  describe('#insert() to tasks with correct schema', function() {
		it('should return true', function() {
			assert.equal(true, jsonstorage.insert("tasks", {id: 122510, worktobedone: "reset password for Mary"}));
		});
	});
	describe('#select() user by name "Liam" using array[{key,comparison,value}] format', function() {
    it('should find Liam', function() {
      assert.equal("Liam", jsonstorage.select("users", [{key:"name", comparison:"=", value:"Liam"}], 1).name);
    });
  });
  describe('#select() user by name "Liam" using {key:value} format', function() {
    it('should find Liam', function() {
      assert.equal("Liam", jsonstorage.select("users", {name:"Liam"}, 1).name);
    });
  });
  describe('#update() 1 user "Liam" name field to "Briam" using array[{key,comparison,value}] format', function() {
    it('should update Liam to Briam', function() {
      assert.equal(true, jsonstorage.update("users", [{key:"name", comparison:"=", value:"liam"}], [{key:"name", value:"Briam"}], 1));
    });
  });
  describe('#select() user by name "Briam" using {key:value} format', function() {
    it('should find Briam', function() {
      assert.equal("Briam", jsonstorage.select("users", {age:26}, 1).name);
    });
  });
  describe('#update() 1 user "Briam" name field to "Qiam" using {key:value} format', function() {
    it('should update Briam to Qiam', function() {
      assert.equal(true, jsonstorage.update("users", {name:"briam"}, {name:"Qiam"}, 1));
    });
  });
  describe('#select() user by name "Qiam" and age 26 using {key:value} format', function() {
    it('should find Qiam', function() {
      assert.equal("Qiam", jsonstorage.select("users", {age:26, name:"qiam"}, 1).name);
    });
  });
  describe('#delete() all users with age under 22', function() {
    it('should delete users under 22', function() {
      assert.equal(undefined, jsonstorage.delete("users", [{key:"age", comparison:"<", value:22}]));
    });
  });
  describe('#save_db()', function() {
    it('should not error', function() {
      assert.equal(undefined, jsonstorage.save_db());
    });
  });
  describe('#select() all users of age 26 using {key:value} format', function() {
    it('should find 1 result', function() {
      assert.equal(1, jsonstorage.select("users", {age:26}).length);
    });
  });
});
