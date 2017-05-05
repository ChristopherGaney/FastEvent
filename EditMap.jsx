"use strict";

var React = require('react');
var GoogleMap = require('./GoogleMap');

module.exports = React.createClass({
	
	getInitialState: function() {
		return {
			isMap: this.props.isMap,
			message: 'Show your event location using Google Maps.',
			classes: 'map_text'
		};
	},
	selectMap: function() {
		var locale = this.props.getLocation();
		if(typeof locale !== 'undefined' && locale !== '') {
			this.props.mapSelected();
			}
			else {
				this.setState({ message: 'Please Enter an Event Location Before Adding the Map', classes: 'red_text' });
			}
	},
	removeMap: function() {
		this.props.deselectMap();
		this.setState({ message: 'Show your event location using Google Maps.', classes: 'map_text' });
	},
	
  render: function() {
		var content = null;
		if(typeof window !== 'undefined') {
			var google = window.google;
		}
		if(this.props.isMap === true) {
			content = <ShowMap removeMap={this.removeMap} getLocation={this.props.getLocation} eventLocale={this.props.eventLocale} />
		}
		else {
			content = <AddMap message={this.state.message} classes={this.state.classes} selectMap={this.selectMap} />
		}
    return <div>
				{content}
			</div>
  }
})

var AddMap = React.createClass({
	
  render: function() {
    return <div className="map_box">
				<div className={this.props.classes}>
					<p>
						{this.props.message}
					</p>
				</div>
				
				<button className="comp_button" onClick={this.props.selectMap}>
					<p>Add Google Map</p>
				</button>
			</div>
  }
})

var ShowMap = React.createClass({
	
  render: function() {
    return <div className="map_box">
				<div className="map_button">
					<button className="comp_button" onClick={this.props.removeMap} >
						<p>Remove Map</p>
					</button>
				</div>
				<div className="show_map">
					<GoogleMap getLocation={this.props.getLocation} eventLocale={this.props.eventLocale} />	
				</div>
			</div>
			
  }
})

