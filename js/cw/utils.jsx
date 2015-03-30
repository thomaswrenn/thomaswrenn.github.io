/** @jsx React.DOM */

var _ = require('./lodashmixins.js');
var moment = require('moment');

var utils = {};
utils.columnWidth = function(columnWidthWeight, columnWidthsArray, totalWidth) {
    if (typeof(totalWidth) === 'string') {
        return (((columnWidthWeight/_.sum(columnWidthsArray))*(parseFloat(totalWidth))) + ((totalWidth.slice(-1) === '%')?'%':''));
    } else {
        return (columnWidthWeight/_.sum(columnWidthsArray))*(totalWidth);
    }
};
utils.getRangeStrGivenTwoMomentDates = function(startOfRange, endOfRange, leaveInTheYearIfADateIsThisYear) {
    var isCurrYear = function(aMomDate) { return (aMomDate.year() === moment().year()); };
    var areSameMonth = startOfRange.month() === endOfRange.month();
    var areSameYear = startOfRange.year() === endOfRange.year();
    var preDashFormat = ((!isCurrYear(startOfRange))?("MMM"):("MMMM"))+" D" + ((!areSameYear && !isCurrYear(startOfRange) && !leaveInTheYearIfADateIsThisYear)?(", YYYY"):(""));
    var postDashFormat = ((areSameMonth)?(""):(((!isCurrYear(endOfRange))?("MMM"):("MMMM"))+" ")) + "D" + ((isCurrYear(endOfRange) && !leaveInTheYearIfADateIsThisYear)?(""):(", YYYY"));
    return startOfRange.format(preDashFormat) + " - " + endOfRange.format(postDashFormat);
};
utils.getWeekRangeStrGivenUnixUTCTimestamp = function(unixUTCTimestamp, leaveInTheYearIfADateIsThisYear) {
    var momDate = moment.unix(unixUTCTimestamp).utc();
    var startOfRange = moment(momDate).startOf('week');
    var endOfRange = moment(momDate).endOf('week');

    return utils.getRangeStrGivenTwoMomentDates(startOfRange, endOfRange, leaveInTheYearIfADateIsThisYear);
};

module.exports = utils;
