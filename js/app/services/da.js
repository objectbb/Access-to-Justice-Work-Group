(function () {
    var dataaccess = function () {
        var schemaBuilder = lf.schema.create('taxidriver', 1);
      
        return {
            execute: function () {
                schemaBuilder.connect().then(function (db) {
                    var dfin = schemaBuilder.getSchema.table('dfin');
                    schemaBuilder.select(dfin.Docket_Number, lf.fn.count(dfin.Violation)).
                    from(dfin).
                    groupBy(dfin.Docket_Number).exec();
                }).then(function (results) {
                    console.log(results.length);
                });
            },
            loadtable: function (name, data) {
                var rs;
                var table;
                 // var dbtrans = schemaBuilder.connect();

                schemaBuilder.connect().then(function (db) {
                    rs = db
                    table = db.getSchema().table(name);

                    db.delete().from(name).exec().then(function (results) {
                        console.log("deleted " + results.length);
                    });
                    
                    var rows = _.map(data, function (item) {
                        return table.createRow(item);
                    });
                    return db.insert().into(table).values(rows).exec();
                }).then(function () {
                    return rs.select().from(table).exec();
                }).then(function (results) {
                    console.log(results.length);
                });

            },
            createtable: function (name, cols) {
                var table = schemaBuilder.createTable(name);
                for (var i = 0; i < cols.length; ++i) {
                    var name = cols[i].name;
                    var type = cols[i].type;
                    table.addColumn(name, (cols[i].type == "NUMBER") ? lf.Type.INTEGER : lf.Type.STRING);
                    if (name == "Docket_Number" || name == "Affiliation" || name == "Date" || name == "TotalAmount_Outstanding" || name == "Company_Name" || name == "Address") table.addIndex('idx' + name, [name], false, lf.Order.DESC);
                }
                table.addColumn('id', lf.Type.INTEGER);
               // table.addPrimaryKey(['id'], true);
            }
        }
    }
    angular.module('taxidriver').service('da', dataaccess);
})();