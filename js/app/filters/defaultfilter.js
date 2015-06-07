(function() {
    angular.module('taxidriver').filter('defaultFilter', function() {
        return function(items, filter) {
            if (!filter) {
                return items;
            }
            var result = {};
            //angular.forEach(filter, function(filterVal, filterKey) {
            	 var filterVal = filter.toLowerCase();
                angular.forEach(items, function(item, key) {
                    var fieldVal = item.hashcode();
                    if (fieldVal && fieldVal.indexOf(filterVal.toLowerCase()) > -1) {
                        result[key] = item;
                    }
                });
            //});
            return result;
        };
    })
}());