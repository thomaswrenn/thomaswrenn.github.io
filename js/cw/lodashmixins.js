var _ = require('lodash');

_.mixin({'mask': function(collection, maskArr) {
    var obj = {};
    _.each(_.keys(collection), function(key) {
        if (!_.contains(maskArr, key)) {
            obj[key] = collection[key];
        }
    });
    return obj;
}});

/*
_.objectify([{'date': 1, 'project': 'one'},{'date': 2, 'project': 'two'}], 'project');
// { 'one': {'date': 1}, 'two': {'date': 2} }
 */
_.mixin({'objectify': function (collection, key) {
    return _.object(_.map(collection, function (item) {
        return [item[key], _.mask(item, key)];
    }));
}}, { 'chain': true });

_.mixin({'objectifyWithoutMasking': function (collection, key) {
    return _.object(_.map(collection, function (item) {
        return [item[key], item];
    }));
}}, { 'chain': true });

_.mixin({'arrayify': function (collection, keyName) {
    return _.map(collection, function (item, keyValue) {
        var returnObj = (item?item:{});
        returnObj[keyName] = keyValue;
        return returnObj;
    });
}}, { 'chain': true });

_.mixin({'sortDictionary': function (collection, mapper, reverse) {
    if (!_.isFunction(mapper)) {
        var tempMapper = mapper;
        mapper = tempMapper.mapper;
        reverse = tempMapper.reverse;
    }
    return _(collection)
        .pairs()
        .sortBy(function (arr) {
            return  _.isFunction(mapper) ?
                        mapper(arr[1], arr[0]) :
                        _.isString(mapper) ?
                            arr[1][mapper] :
                            arr[1];
        })
        .tap(function(arr){
            return reverse ? arr.reverse() : arr;
        })
        .reduce(function (result, arr) {
            result[arr[0]] = arr[1];
            return result;
        }, {});
}}, { 'chain': true });

_.mixin({'sortDictionaryByKeysOptionallyGivenExplicitOrder': function (collection, fixedIndexArray, reverse) {
    return _(collection)
        .pairs()
        .sortBy(function (arr) {
            if (fixedIndexArray) {
                return fixedIndexArray.indexOf(arr[0]);
            } else {
                return arr[0];
            }
        })
        .tap(function(arr){
            return reverse ? arr.reverse() : arr;
        })
        .reduce(function (result, arr) {
            result[arr[0]] = arr[1];
            return result;
        }, {});
}}, { 'chain': true });

// _.mixin({'flatMap': function (collection, mapperThatReturnsArray) {
//     return _.flatten(_.map(collection, function(item, itemkey, reduceCollection) {
//         return mapperThatReturnsArray(item, itemkey, reduceCollection);
//     }));
// }}, { 'chain': true });

_.mixin({'flatMap': function (collection, mapperThatReturnsArray) {
    return _.reduce(collection, function(array, item, itemkey, reduceCollection) {
        return array.concat(mapperThatReturnsArray(item, itemkey, reduceCollection));
    }, []);
}}, { 'chain': true });

_.mixin({'doubleFlatMap': function (collection, mapperThatReturnsArray) {
    return _.reduce(collection, function(array, item, itemkey, reduceCollection) {
        return array.concat(_.flatten(mapperThatReturnsArray(item, itemkey, reduceCollection)));
    }, []);
}}, { 'chain': true });

_.mixin({'groupByAndMask': function (collection, groupByAndMaskKey) {
    return _(collection).chain()
        .groupBy(groupByAndMaskKey)
        .mapValues(function(group) {
            return _.map(group, function(item) {
                return _.mask(item, [groupByAndMaskKey]);
            });
        })
        .value();
}}, { 'chain': true });

_.mixin({'groupByIntoObjects': function (collection, groupByIntoObjectsKey) {
    var tempKeyKey = 'fsfsfsdfsfdsfsdfsfCRAZYTEMPKEYNAMEfsdfsakfjskfsjfafdlfadsfsf';
    return _(collection)
        .arrayify(tempKeyKey)
        .groupBy(groupByIntoObjectsKey)
        .map(function(group, groupKey) {
            return [groupKey, _.objectify(group, tempKeyKey)];
        })
        .object()
        .value();
}}, {'chain':true});

_.mixin({'sum' : function (arrayOfNumbers) {
    return _.reduce(arrayOfNumbers, function(sum, value) {
        return sum + value;
    });
}}, { 'chain': true });

_.mixin({'log' : function (collection, message) {
    console.log(message, collection);
    return collection;
}}, { 'chain': true });

_.mixin({'logPluck' : function (collection, message, pluckKey) {
  console.log(message, _.pluck(collection, pluckKey));
  return collection;
}}, { 'chain': true });

module.exports = _;
