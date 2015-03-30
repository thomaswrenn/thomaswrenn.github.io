/** @jsx React.DOM */

var React = require('react/addons');
var moment = require('moment');
var Promise = require('bluebird');

var _ = require('./cw/lodashmixins.js');
var utils = require('./cw/cw.jsx').utils;


var Main = React.createClass({
    render: function() {
        return (
            <div>
                <h1>Tom Wrenn</h1>
                <h3>Software Developer, CreativeWorx</h3>
            </div>
        );
    }
});
