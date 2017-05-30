# storage-json
NodeJS module to store data in a local json file using a simple table structure with insert, delete, update and select statements.

A simple database like storage system for saving data to a local file using defined tables.

Install:
`npm install storage-json`

Use `init()` to create a database - pass in a string as an optional argument to override the default db location of 'default.json'. This will return the database object from which you can insert, select etc.

## `add_table(<Table Name>, [<Table Schema>]);`
Usage:
Creates a new empty table named `<Table Name>`, with `<Table Schema>` as fields
Example:
`storage-json.add_table("Users", ["name", "age"]);`
Returns:
True if table was created, false if table was not created (i.e., already exists)
## `insert(<Table Name>, <Data>);`
Usage:
Inserts a new entry in to `<Table Name>` with value of `<Data>`. `<Data>` can be a single object or an array of objects. If `<Table Name>` does not exist, it will be created with the schema defined by the `<Data>` object.
Example:
`storage-json.insert("Users", {name:"Liam", age:26});`
`storage-json.insert("Users", [{name:"Steve", age:32},{name:"Dave", age:24});`
Returns:
True if data is entered succesfully, false on error i.e., schema does not match the existing defined schema.
## `select(<Table Name>, <Lookup Data>, optional:<Count>);`
Usage:
Returns data from `<Table Name>` that matches `<Lookup Data>`, if `<Count>` is defined it will be up to that number of matches. Two formats are accepted for `<Lookup Data>` - {key:value,...} or [{key:`<key>`, comparison:`<comparison>`, value:`<value>`}]. Simple vs verbose, the verbose format allows you to do comparisons such as not equal (!=), etc. More than one comparison can be made, with either format.
Example:
`storage-json.select("users", [{key:"name", comparison:"!=", value:"Liam"}], 1);`
`storage-json.select("users", {name:"Liam", age:26});`
Returns:
Depending on the amount of results this will return either the matching object or an array of matching objects. An empty array will be returned if nothing matches.
## `update(<Table Name>, <Lookup Data>, <Update Data>, optional:<Count>);`
Usage:
Updates the entries that match `<Lookup Data>` in <Table Name> with the fields defined in `<Update Data>`, again if `<Count>` is defined this will be a maximum of `<Count>` updates. This follows the same format as `select()` so can use {key:value,...} or [{key:`<key>`, comparison:`<comparison>`, value:`<value>`}] depending on your needs.
Example:
`storage-json.update("users", [{key:"name", comparison:"=", value:"liam"}], [{key:"name", value:"Briam"}], 1)`
Returns:
True if successful, false if not.
## `delete(<Table Name>, <Lookup Data>, optional:<Count>);`
Usage:
Deletes the entries in `<Table Name>` that match `<Lookup Data>`, up to a maximum of `<Count>` if specified. Also follows the same format as `insert()` in allowing {key:value,...} or [{key:`<key>`, comparison:`<comparison>`, value:`<value>`}].
Example:
`storage-json.delete("users", [{key:"age", comparison:"<", value:22}]));`
Returns:
Nothing currently
## `save_db();`
Usage:
Writes the current database to the specified (or default) file. Must be done often or at the very least before app is closed. There is no built in saving, this must be called manually.
Example:
`storage-json.save_db();`
Returns:
Nothing currently
## `set_log_level(<Log Level>);`
Usage:
Set the logging level to either `DEBUG` or `ERROR`, this will enable the console logging of debug messages or error messages (`ERROR` level will also include debug messages).
Example:
`storage-json.set_log_level("ERROR");`
Returns:
Nothing
## `drop_database();`
Usage:
Completely wipe the database - does not save, so if file exists with data and `save_db()` is not called then no data will be lost but be careful.
Example:
`storage-json.drop_database();`
Returns:
True, always
## `get_table_names();`
Usage:
Return a list of the current existing table names
Example:
`storage-json.get_table_names();`
Returns:
An array of existing table names

------

Features to add:
This is an early version, I will be adding features to this, check back soon or send me a message.
