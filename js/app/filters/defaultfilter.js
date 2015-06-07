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
                if (fieldVal && _.intersection(fieldVal, filterVal.split(' ')).length == filterVal.split(' ').length) result[key] = item;
            });
            return result;
        };
    })
}());