/** @jsx React.DOM */

var $ = require('jquery');

var React = require('react/addons');
var moment = require('moment');
var Promise = require('bluebird');

var _ = require('./cw/lodashmixins.js');
var utils = require('./cw/cw.jsx').utils;

var ready = new Promise(function (resolve) { $(resolve); });

var TwitterTimeline = React.createClass({
    render: function () {
        var js,
            id="twitter-wjs",
            fjs=document.getElementById("main");
        if(!document.getElementById(id)){
            js=document.createElement("script");
            js.id=id;
            js.src="http://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js,fjs);
        }
        return (
            <a className="twitter-timeline" dataDnt="true" href="https://twitter.com/ttfe" dataWidgetId="582388528971014144">
                Tweets by @ttfe
            </a>
        );
    }
});

var Main = React.createClass({
    getInitialState: function() {
        return {
            main: 'Tom Wrenn',
            titles: [
                <span>Full Stack Engineer, Nava PBC</span>,
                <span>@ttfe</span>,
                <span>LinkedIn</span>
            ],
            moreInfos: [
                <a href="http://navahq.com/" target="_blank">Nava PBC</a>,
                <TwitterTimeline/>,
                <a href="https://www.linkedin.com/in/thomaswrenn" target="_blank">LinkedIn</a>
            ],
            moreInfoClass: 'hide',
            currentTitleNdx: 0
        };
    },
    incrementCurrentTitleNdx: function () {
        this.setState({
            currentTitleNdx: (this.state.currentTitleNdx + 1)%this.state.titles.length
        });
    },
    handleShowMoreInfo: function () {
        this.setState({
            moreInfoClass: ''
        });
    },
    handleHideMoreInfo: function () {
        this.setState({
            moreInfoClass: 'hide'
        });
    },
    render: function() {
        return (
            <div className='name-and-title'>
                <h1>Tom Wrenn</h1>
                <h3
                    onClick={this.incrementCurrentTitleNdx}
                    onMouseEnter={this.handleShowMoreInfo}
                    onMouseLeave={this.handleHideMoreInfo}>
                    {this.state.titles[this.state.currentTitleNdx]}
                </h3>
                <div
                    className={'more-info '+this.state.moreInfoClass}
                    onMouseEnter={this.handleShowMoreInfo}
                    onMouseLeave={this.handleHideMoreInfo}>
                    {this.state.moreInfos[this.state.currentTitleNdx]}
                </div>
            </div>
        );
    }
});

ready.then(function () {
    React.render(
        <Main/>,
        document.getElementById("main")
    );
});
