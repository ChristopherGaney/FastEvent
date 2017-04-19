"use strict";

var React = require('react');

var TextEditor = React.createClass({
	contextTypes: {
		hasChanged: React.PropTypes.func.isRequired
	},
	
	// Set shouldComponentUpdate to false so that CKEditor
	// instance isn't destroyed.
	
	shouldComponentUpdate: function() {
		return false;
	},
	
	// Create CKEditor
	
	componentDidMount: function() {
		if (typeof window !== 'undefined') {
		
			CKEDITOR.replace( 'editor1' );
			this.addText();
		}
	},
	
	// Here we set initial text editor data from props
	
	addText: function() {
		var d = this.props.mainEvent.eventdoc;
		CKEDITOR.instances.editor1.setData(d);
		CKEDITOR.instances.editor1.on( 'change', function( evt ) {
				this.context.hasChanged();	
			}.bind(this));
	},
	
	// grabHTML returns the editor data for the parent component
	// when the user clicks save.
	
	grabHTML: function() {
		var data = CKEDITOR.instances.editor1.getData();
		console.log(data);
		return data;
	},
	
	// Clear the editor when the user deletes or 
	// chooses to create a new event.
	
	clearEditor: function() {
		CKEDITOR.instances.editor1.setData('');
		this.forceUpdate();
		},
	
  render: function() {
    return <div id="ck" className="text_edit">
				<textarea name="editor1"></textarea>
			</div>
  }
})

module.exports = TextEditor;
