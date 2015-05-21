(function() {
    var dataaccess = function() {
        var schemaBuilder = lf.schema.create('taxidriver', 1);
        return {
            execute: function(query) {
                dm.executeQuery(query).then(function(data) {
                    return data.results;
                }).
                catch (function(e) {
                    alert(e);
                })
            },
            loadtable: function(name, data) {
                var rs;
                var table;

                schemaBuilder.connect().then(function(db) {
                    rs = db;
                    table = db.getSchema().table(name);
                    db.delete().from(table).exec().then(function(results) {
                        console.log("deleted " + results.length);
                    });
                    var rows = _.map(data, function(item) {
                        return table.createRow(item);
                    });
                    return db.insertOrReplace().into(table).values(rows).exec();
                }).then(function() {
                    return rs.select().from(table).exec();
                }).then(function(results) {
                    console.log(results.length);
                });
            },
            createtable: function(name, cols) {
                var table = schemaBuilder.createTable(name);
                for (var i = 0; i < cols.length; ++i) {
                    var name = cols[i].name;
                    var type = cols[i].type;
                    table.addColumn(name, (cols[i].type == "NUMBER") ? lf.Type.INTEGER : lf.Type.STRING);
                }
                table.addColumn('id', lf.Type.INTEGER);
                table.addPrimaryKey(['id'], true);
            }
        }
    }
    angular.module('taxidriver').service('da', dataaccess);
})();