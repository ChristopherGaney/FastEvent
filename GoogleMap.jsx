 "use strict";

var React = require('react');
var ReactDOM = require('react-dom');

module.exports = React.createClass({
	
	getInitialState: function() {
		return {
			
		};
	},
	getLocale: function(locale) {
		locale = locale.trim().split(' ').join('+');
			this.setState({ locale: locale });
	},
	componentDidMount: function() {
		if(typeof window !== 'undefined'){
			var locale = this.props.eventLocale;
			this.getLocale(locale);
		}
	},
	componentWillReceiveProps: function(nextProps) {
		if(this.props.eventLocale !== nextProps.eventLocale) {
			var locale = nextProps.eventLocale;
			this.getLocale(locale);
		}	
	  }, 
	
  render() {

    return (
      <iframe
		  width="600"
		  height="450"
		  frameBorder="0" 
		  src={"https://www.google.com/maps/embed/v1/place?key=YOURAPIKEY=" + this.state.locale + "&zoom=17"} allowFullScreen>
		</iframe>
    );
  }

});


