(function() {
    var wtf = function() {
        var schemaBuilder;
        var emFactory = function() {
            schemaBuilder = lf.schema.create('taxidriver', 1);
            var todoDb;
            var item;
            /*
            schemaBuilder.connect().then(function(db) {
                todoDb = db;
                item = db.getSchema().table('Item');
                var row = item.createRow({
                    'id': 1,
                    'description': 'Get a cup of coffee',
                    'deadline': new Date(),
                    'done': false
                });
                return db.insertOrReplace().into(item).values([row]).exec();
            }).then(function() {
                return todoDb.select().from(item).where(item.done.eq(false)).exec();
            }).then(function(results) {
                results.forEach(function(row) {
                    console.log(row['description'], 'before', row['deadline']);
                });
            });
*/
        }
        dm = emFactory();
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
                schemaBuilder.connect().then(function(db) {
                    rs = db;
                    table = db.getSchema().table(name);
                    db.delete().from(table).exec().then(function(results) {
                        console.log("deleted " + results.length);
                    });
                    rows = _.map(data, function(item) {
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
    angular.module('taxidriver').service('da', wtf);
})();