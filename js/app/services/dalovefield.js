(function() {
    var dataaccess = function() {
        var db = null;
        var initialized = false;
        var schemaBuilder = null;
        var init = function() {
            return schemaBuilder.connect().then(function(database) {
                db = database;
                window.db = database;
            });
        };
        var get = function() {
            if (initialized) {
                return Promise.resolve(db);
            }
            return init().then(function() {
                return db;
            });
        };
        var main = function() {
            // Trigger DB initialization.
            init().then(function() {
                initialized = true;
            });
        }
        return {
            loadtables: function(tables) {
                var rs;
                var tmptable;
                // var dbtrans = schemaBuilder.connect();
                //for (var key in tables) {
                  angular.forEach(tables,function(table) {       
                     var name = table.name;
                     var data = table.data;

                    get().then(function(db) {
                        rs = db
                        tmptable = db.getSchema().table(name);
                        
                        db.delete().from(name).exec().then(function (results) {
                            console.log("deleted " + results.length);
                        });
                        var rows = _.map(data, function(item) {
                            return tmptable.createRow(item);
                        });
                        return db.insert().into(tmptable).values(rows).exec();
                    }).then(function() {
                        return rs.select().from(tmptable).exec();
                    }).then(function(results) {
                        console.log(results.length);
                    });
                });
            },
            createtables: function(tables) {
                schemaBuilder = lf.schema.create('taxidriver', 1);
                for (var key in tables) {
                    var name = tables[key].name;
                    var cols = tables[key].columns;
                    var table = schemaBuilder.createTable(name);
                    for (var i = 0; i < cols.length; ++i) {
                        var name = cols[i].name;
                        var type = cols[i].type;
                        table.addColumn(name, (cols[i].type == "NUMBER") ? lf.Type.INTEGER : lf.Type.STRING);
                        if (name == "Docket_Number" || name == "Affiliation" || name == "Date" || 
                            name == "TotalAmount_Outstanding" || name == "Company_Name" || name == "Address")
                             table.addIndex('idx' + name, [name], false, lf.Order.DESC);
                    }
                    table.addColumn('id', lf.Type.INTEGER);
                    //table.addPrimaryKey(['id']);
                }
                main();
            }
        }
    }
    angular.module('taxidriver').service('da', dataaccess);
})();