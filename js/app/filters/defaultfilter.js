(function() {
    angular.module('taxidriver').filter('defaultFilter', function() {
        return function(items, filter) {
            if (!filter) {
                return items;
            }
            var result = {};
           
            var filterVal = filter.toLowerCase();
            angular.forEach(items, function(item, key) {
                var fieldVal = item.hashcode();
                var splitinput = filterVal.split(' ');

                if (fieldVal && 
                    _.intersection(fieldVal, splitinput).length == splitinput.length) 
                        result[key] = item;
            });
            return result;
        };
    })
}());