"use strict";

var React = require('react');
var GoogleMap = require('./GoogleMap');

module.exports = React.createClass({
	
	getInitialState: function() {
		return {
			isMap: this.props.isMap,
			message: 'Show your event location using Google Maps.'
		};
	},
	selectMap: function() {
		var locale = this.props.getLocation();
		if(typeof locale !== 'undefined' && locale !== '') {
			this.props.mapSelected();
			}
			else {
				this.setState({ message: 'Please Enter an Event Location Before Adding the Map' });
			}
	},
	removeMap: function() {
		this.props.deselectMap();
		this.setState({ message: 'Show your event location using Google Maps.' });
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
			content = <AddMap message={this.state.message} selectMap={this.selectMap} />
		}
    return <div>
				{content}
			</div>
  }
})

var AddMap = React.createClass({
	
  render: function() {
    return <div className="row comp_col map_col">
				<div className="col-comptext">
					<div className="add_comp comp_text">
						<p>
							{this.props.message}
						</p>
					</div>
					
					<button className="comp_button" onClick={this.props.selectMap}>
						<p>Add Google Map</p>
					</button>
				</div>
			</div>
  }
})

var ShowMap = React.createClass({
	
  render: function() {
    return <div className="row comp_col map_col">
				<div className="col-comptext">
					
					<button className="comp_button" onClick={this.props.removeMap} >
						<p>Remove Map</p>
					</button>
				</div>
				
				<div className="col-compmap">
					<div className="comp_map">
						<GoogleMap getLocation={this.props.getLocation} eventLocale={this.props.eventLocale} />
					</div>
				</div>
			</div>
			
  }
})
