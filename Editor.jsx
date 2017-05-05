"use strict";

// This component is where the user can create/edit their
// event pages. They can also set up google maps, a weather
// widget, and text messaging on this page.

var React = require('react');
var ReactRedux = require('react-redux');
var Actions = require('./actions');
var bindActionCreators = require('redux').bindActionCreators;
var connect = ReactRedux.connect;
var TextEditor = require('./TextEditor');
var EditMap = require('./EditMap');
var EditWeather = require('./EditWeather');
var SetTexting = require('./SetTexting');
var Location = require('./Location');
var Moment = require('moment');
var Modal = require('react-modal');
var DeleteModal = require('./DeleteModal');
var LeavePageModal = require('./LeavePageModal');
var browserHistory = require('react-router').browserHistory;


 var Editor = React.createClass({

	childContextTypes: {
		gFormsData: React.PropTypes.func.isRequired,
		hasChanged: React.PropTypes.func.isRequired,
		saveCheck: React.PropTypes.func.isRequired
	},
	getChildContext: function() {
		return { 
			gFormsData:  this.getFormData,
			hasChanged: this.setChange,
			saveCheck: this.leavePage
		};
	},
	getInitialState: function() {
		return { title: '', mainEvent: {}, FormKey: 1, LocationKey: 1, showMessage: true, unSaved: false };
	},
	
	// Before mounting the component, we need to know
	// what page is being loaded, /user/create or /user/edit, 
	// so we check the current route.
	
	componentWillMount: function() {
		if(this.props.location.pathname === '/user/create') {
			return this.setState({title: "Create Your Event", mainEvent: {}});
		}
		
		else if(this.props.mainEvent.mainEvent) {
				return this.setState({ title: "Edit Your Event", mainEvent: this.props.mainEvent.mainEvent });
		}
	},
	componentDidMount: function() {
		window.scrollTo(0, 0);
	},
	componentWillReceiveProps: function(nextProps) {
			return this.setState({ mainEvent: nextProps.mainEvent.mainEvent });
	},
	
	// getFormData first calls validateForSave in the EventForm component
	// to retrieve the form data. Then it calls the grabHTML function
	// in the CKEditor component. Then it constructs an object for an
	// AJAX call in the outer wrapper.
	
	getFormData: function() {
		var destination = this.props.location.pathname;
		if(this.props.location.pathname === '/user/edit' && typeof mainEvent === 'undefined') {
				destination = '/user/create';
			}
		var eventDat = this.refs.child.validateForSave();
		if(typeof eventDat === 'object') {
			var textDat = this.refs.keep.grabHTML();
			
			eventDat._id = this.state.mainEvent._id;
			eventDat.eventdoc = textDat;
			eventDat.eventlocation = this.state.mainEvent.eventlocation;
			eventDat.isMap = this.state.mainEvent.isMap;
			eventDat.isWeather = this.state.mainEvent.isWeather;
			eventDat.adminit = ""
			
			var d = {
					inputVars: {
						page: 'save',
						destination: destination,
						pack: eventDat
						},
					callback: function(response) {
						this.refs.child.serveMessage(response.message);
					}.bind(this)
				}
			this.props.actions.talkToServer(d);
			this.saveMessage();
		}
		else {
			return;
		}	
	},
	setChange: function() {
		if(this.state.showMessage === true) {
			this.setState({ unSaved: true });
			this.refs.child.serveMessage('You Have Unsaved Changes');
			this.refs.msg.serveMessage('You Have Unsaved Changes');
		}
		else {
			this.setState({ showMessage: true });
		}
	},
	saveMessage: function() {
		this.refs.child.serveMessage('Your Event Has Been Saved');
		this.refs.msg.serveMessage('Your Event Has Been Saved');
		setTimeout(this.clearMessage, 4000);
	},
	clearMessage: function() {
		this.setState({ unSaved: false });
		this.refs.child.serveMessage('');
		this.refs.msg.serveMessage('');
	},
	
	// Transition to the events page with an AJAX call in the 
	// outer wrapper.
	
	toEvents: function() {
		var d = {
				inputVars: {
					page: 'your-events',
					destination: 'user/events',
					pack: {
						
						}
					},
				callback: function() {
					}
				}
		this.props.actions.talkToServer(d);
	},
	
	// If the user chooses to create a new event, the page
	// needs to be cleared and the url changed.
	
	createNew: function() {
		this.props.actions.set_mainEvent({ mainEvent: {} });
		this.clearPage();
		browserHistory.push('/user/create');
	},
	clearPage: function() {
		this.setState({ 
			title: "Create Your Event",
			mainEvent: {},
			FormKey: this.state.FormKey + 1,
			LocationKey: this.state.LocationKey + 1,
			showMessage: false });
		this.refs.keep.clearEditor();
	},
	
	// leavePage calls LeavePageModal if user attempts to leave the
	// page without saving data
	
	leavePage: function(dest) {
		if(this.state.unSaved === true) {
			this.refs.leavepage.checkToSave(dest, this.shouldLeave);
		}
		else {
			this.refs.toggle.transito(dest);
		}
	}, 
	shouldLeave: function(dest, res) {
		if(res === true) {
			this.refs.toggle.transito(dest);
		}
		else {
			return;
		}
	},
	
	// deleteIt calls checkForDelete in the modal component and passes
	// the event id and a callback function. checkForDelete opens the modal
	// and sets the callback shouldDelete in its state.
	
	deleteIt: function(id) {
		this.refs.modalchild.checkForDelete(id,this.shouldDelete);
	},
	
	// If the user chooses to delete we call finishDelete.
	
	shouldDelete: function(id, res) {
		if(res === true) {
			this.finishDelete(id);
			}
		else {
			return;
		}
	},
	
	// deleteEvent in the outer wrapper will initiate an AJAX call.
	// The page is then cleared.
	
	finishDelete: function(id) {
		this.props.actions.deleteEvent(id);
		this.props.actions.set_mainEvent({ mainEvent: {} });
		this.clearPage();
		browserHistory.push('/user/create');
	},
	changeLocale: function(value) {
		var temp = this.state.mainEvent;
		temp.eventlocation = value;
		this.setState({
				mainEvent: temp
			});
	},
	mapSelected: function() {
		var temp = this.state.mainEvent;
		temp.isMap = true;
		this.setState({ mainEvent: temp });
		this.setChange();
		this.forceUpdate();
	},
	deselectMap: function() {
		var temp = this.state.mainEvent;
		temp.isMap = false;
		this.setState({ mainEvent: temp });
		this.setChange();
		this.forceUpdate();
	},
	weatherSelected: function() {
		var temp = this.state.mainEvent;
		temp.isWeather = true;
		this.setState({ mainEvent: temp });
		this.setChange();
		this.forceUpdate();
	},
	deselectWeather: function() {
		var temp = this.state.mainEvent;
		temp.isWeather = false;
		this.setState({ mainEvent: temp });
		this.setChange();
		this.forceUpdate();
	},
	getLocation: function() {
		return this.state.mainEvent.eventlocation;
	},
	closeDropdown: function() {
		this.refs.toggle.checkToggle();
	},
	
  render: function() {
	var id;
	if(this.state.mainEvent) {
		id = this.state.mainEvent._id;
	}
	
    return <div className="viewer" onClick={this.closeDropdown}>
				<div className="nav">
					<DeleteModal ref="modalchild" />
					<LeavePageModal ref="leavepage" />
					<EditorNav ref="toggle" toEvents={this.toEvents} createNew={this.createNew} deleteIt={this.deleteIt.bind(this,id)} />
				</div>
				<div className="row">
				   <div className="col-viewcontent">
						<div className="create">
							<h2>{this.state.title}</h2>
						</div>
					</div>
				</div>
				<div className="row">
				   <div className="col-viewcontent">
						<EventForm key={this.state.FormKey} ref="child" mainEvent={this.state.mainEvent} eventLocale={this.state.mainEvent.eventlocation} talkToServer={this.props.actions.talkToServer} changeLocale={this.changeLocale} />
					</div>
				</div>
				<div className="row">
					<div className="col-viewcontent">
						<TextEditor ref="keep" mainEvent={this.state.mainEvent} />
						<SaveEdit ref="msg" />
						<Location key={this.state.LocationKey} changeLocale={this.changeLocale} eventlocation={this.state.mainEvent.eventlocation} />
					</div>
				</div>
				<div className="row">
					<div className="col-viewcontent">
						<div className="edit_wrap">
							<EditMap getLocation={this.getLocation} mapSelected={this.mapSelected}
								deselectMap={this.deselectMap} eventLocale={this.state.mainEvent.eventlocation} isMap={this.state.mainEvent.isMap} />
							<EditWeather getLocation={this.getLocation} eventLocale={this.state.mainEvent.eventlocation}
								weatherSelected={this.weatherSelected} deselectWeather={this.deselectWeather} isWeather={this.state.mainEvent.isWeather} />
							<SetTexting />
						</div>
					</div>
				</div>
			</div>
  }
})


var EditorNav = React.createClass({
	contextTypes: {
		saveCheck: React.PropTypes.func.isRequired 
	},
	getInitialState: function() {
		return { 
			isOpen: false,
			classes: 'hidden'
	  };
	},
	checkToggle: function() {
		if(this.state.isOpen === true) {
			this.toggleNav();
		}
	},
	toggleNav: function(e) {
		if(this.state.isOpen === false) {
			return this.setState({ isOpen: true, classes: 'dropdown-content' });
		}
		else {
			return this.setState({ isOpen: false, classes: 'hidden' });
		}
	},
	navigate: function(dest) {
		this.context.saveCheck(dest);
	},
	transito: function(par) {
		if(par === 'view') {
			browserHistory.push('/user/view');
		}
		else if(par === 'delete') {
			this.props.deleteIt();
		}
		else if(par === 'add') {
			this.props.createNew();
		}
		else if(par === 'events') {
			this.props.toEvents();
		}
	},
  render: function() {
    return <div className="row">
				<div id="view_page" className="col-nav">
					<div className="sandwich_nav">
						<a href="javascript:void(0)">
							<div className="sand_box" onClick={this.toggleNav}>
								<div className="sand_btn"></div>
								<div className="sand_btn"></div>
								<div className="sand_btn"></div>
							</div>
						</a>
						<Dropdown classes={this.state.classes} navigate={this.navigate} />
					</div>
					<div className="view_nav">
						<button onClick={this.navigate.bind(null,'view')}>
							<p>View Event</p>
						</button>
						<button onClick={this.navigate.bind(null,'delete')}>
							<p>Delete</p>
						</button>
						<button onClick={this.navigate.bind(null,'add')}>
							<p>Add Event</p>
						</button>
						<button onClick={this.navigate.bind(null,'events')}>
							<p>Events</p>
						</button>
					</div>
				</div>
			</div>
  }
})

var Dropdown = React.createClass({
	
  render: function() {
    return <div className={this.props.classes}>
				<button onClick={this.props.navigate.bind(null,'view')}>
					<p>View Event</p>
				</button>
				<button onClick={this.props.navigate.bind(null,'delete')}>
					<p>Delete</p>
				</button>
				<button onClick={this.props.navigate.bind(null,'add')}>
					<p>Add Event</p>
				</button>
				<button onClick={this.props.navigate.bind(null,'events')}>
					<p>Events</p>
				</button>
			 </div>		
  }
})		
		
var EventForm = React.createClass({
	contextTypes: {
		gFormsData: React.PropTypes.func.isRequired,
		hasChanged: React.PropTypes.func.isRequired
	},
	getInitialState: function() {
		return {
			Eventname: '',
			Eventlocation: '',
			Startdate: '',
			Enddate: '',
			Fields: [],
			ServerMessage: '',
			DateMessage: '',
			EventUrl: ''
		};
	},
	componentWillMount: function() {
		return this.setState({ Eventname: this.props.mainEvent.eventname, Eventlocation: this.props.mainEvent.eventlocation, Startdate: this.props.mainEvent.startdate, Enddate: this.props.mainEvent.enddate, EventUrl: this.props.mainEvent.eventurl });
	},
	componentDidMount: function() {
			var pickerStart = new Pikaday({ field: document.getElementById('pickerstart'),
												format: 'MM DD YYYY',
												onSelect: function() {
													this.handleStartdateChange(pickerStart.getDate());	
												}.bind(this)});
			var pickerEnd = new Pikaday({ field: document.getElementById('pickerend'),
												format: 'MM DD YYYY',
												onSelect: function() {
													this.handleEnddateChange(pickerEnd.getDate());	
												}.bind(this)});
	},
	componentWillReceiveProps: function(nextProps) {
		if(this.props.eventLocale !== nextProps.eventLocale) {
			this.setState({ Eventlocation: nextProps.eventLocale });
		}	
	  }, 
	
	// This handler is called when the user clicks to save inputed data.
	// gFormsData (getFormData) is called in parent which then calls 
	// validateForSave to retrieve form data.
	
	handleSave: function(e) {
		e.preventDefault();
		this.context.gFormsData();
	},
	
	// This function calls isValid in the EventInput component on each
	// registered input field. Now that I have included date picker modules
	// for startdate and enddate, there is only one registered field, eventname.
	// The function returns all of the form data including the date fields
	// to the parent for saving.
	
	validateForSave: function() {
		var enddate = '';
		// validate entire form here
		var validForm = true;
		this.state.Fields.forEach(function(field) {
			if (typeof field.isValid === "function") {
				var validField = field.isValid(field.refs[field.props.name]);
				validForm = validForm && validField;
			}
		});
		if(typeof this.state.Startdate === 'undefined' || this.state.Startdate === '') {
			this.setState({ DateMessage: 'A Startdate is Required'});
			return 'invalid';
		}
		if(typeof this.state.Enddate === 'undefined') {
			enddate = '';
		}
		else {
			enddate = this.state.Enddate;
			}
		if (validForm) {
			this.setState({ ServerMessage: '' });
			return {
				eventname: this.state.Eventname,
				startdate: this.state.Startdate,
				enddate: enddate,
				eventurl: this.state.EventUrl
				};
			}
		},
		
		
		// Store the eventname value when it changes in
		// the EventInput component.
		
		onChangeEventname: function(value) {
			this.setState({
				Eventname: value
			});
		},
		
		// Register input controls.
		
		register: function(field) {
			var s = this.state.Fields;
			s.push(field);
			this.setState({
				Fields: s
			});
		},
		
		// Store the eventname as it will appear in the url
		// of the user's public page ie. with no spaces. 
		// setEventUrl is called from EventInput as the eventname changes.
		
		setEventUrl: function(url) {
			return this.setState({ EventUrl: url });
		},
		
		// Store startdate and enddate.
		handleStartdateChange: function(date) {
			var start = Moment(date).format('MM-DD-YYYY');
			this.setState({ Startdate: start, DateMessage: '' });
			this.context.hasChanged();
		},
		handleEnddateChange: function(date) {
			var end = Moment(date).format('MM-DD-YYYY');
			this.setState({ Enddate: end });
			this.context.hasChanged();
		},
		handleLocationChange: function(e) {
			this.setState({ Eventlocation: e.target.value });
			this.context.hasChanged();
		},
		handleLocationBlur: function(e) {
			this.props.changeLocale(this.state.Eventlocation);
		},
		
		// Show validation errors to user when saving data.
		
		serveMessage: function(mess) {
			return this.setState({ServerMessage: mess});
		},
			
	  render: function() {
		// render form
	
		return(
				<form name="EventForm" noValidate >
					
					<div className="event_info">
						<div className="input_meta_1">
							<div className="name_event">
								<EventInput type={'eventname'} value={this.state.Eventname} label={'Enter Event Name'} name={'Eventname'} htmlFor={'Eventname'}
									origValue={this.state.Eventname} isrequired={true} onChange={this.onChangeEventname} setEventUrl={this.setEventUrl} onComponentMounted={this.register}
									talkToServer={this.props.talkToServer} messageRequired={'Invalid Event Name'} />
							</div>
							<div className="event_url">
								<h4 className="url_label">This is the URL for your public page:</h4>
								<h4 className="url">fastevent.com/{this.state.EventUrl}</h4>
							</div>
						</div>
						<div className="input_meta_2">
							<div className="date_event">
								<div className="date_box">
									<label><h5>Startdate</h5></label>
									<input id="pickerstart" readOnly="true" defaultValue={this.state.Startdate} />
									<div className="start_message">{this.state.DateMessage}</div>
								</div>
								
								<div className="date_box">
									<label><h5>Enddate</h5></label>
									<input className="end_input" id="pickerend" readOnly="true" defaultValue={this.state.Enddate} />
								</div>
							</div>
						</div>
						<div className="input_meta_3">
							<div className="location_event">
								<label><h5>Add An Event Location</h5></label>
								<input value={this.state.Eventlocation}  onBlur={this.handleLocationBlur} onChange={this.handleLocationChange} />
							</div>
							<div className="top_save">
								<button className="save_button" onClick={this.handleSave}>SAVE CHANGES</button>
							</div>
						</div>
						<div className="servermessage">
							<h3>{this.state.ServerMessage}</h3>
						</div>
					</div>
				</form>
			);
		}
})

var EventInput = React.createClass({

	contextTypes: {
		hasChanged: React.PropTypes.func.isRequired,
	},
	
	getInitialState: function() {
		return {
			origEventname: ''
			};
	},
	componentWillMount: function() {
		return this.setState({ origEventname: this.props.origValue });
	},
	
	// This function sets state as input values change and it 
	// calls isValid to check validity of input fields
	
	handleChange: function(e) {
		this.props.onChange(e.target.value);
		var isValidField = this.isValid(e.target);
	},
	
	// This function adds a border and reveals an error
	// message if the field is invalid. It saves eventUrl to the
	// parent component, alerts the parent that data has changed, and then calls checkForUnique
	// on the eventname.
	
	handleBlur: function(e) {
		var name = '';
		if(e.target.nextSibling.textContent != '') {
			e.target.classList.add('borderline');
			e.target.nextSibling.classList.remove('invisible');
		}
		else {
				
			this.checkForUnique(e.target);
		}
	},
	
	// This function checks in db to see if a chosen eventname is unique,
	// and then uses a callback to alert user if the eventname is taken.
	
	checkForUnique: function(input) {
		if(this.state.origEventname !== 'undefined' && this.state.origEventname !== '') {
		
			if(this.state.origEventname === input.value) {
				return;
			}
		}
		var d = {
				inputVars: {
					page: 'check-event',
					destination: '',
					pack: {
						eventname: input.value
						}
					},
				callback: function(myBool) {
					if(myBool === true) {
						input.classList.add('error'); // add class error
						input.nextSibling.textContent = 'Unavailable Name';
						input.classList.add('borderline');
						input.nextSibling.classList.remove('invisible');
						}
					else {
						var urlState = input.value.trim().split(' ').join('-');
						this.props.setEventUrl(urlState);
						this.context.hasChanged();
					}
				}.bind(this)
			}
		this.props.talkToServer(d);
	},
	
	// This function removes the error message when the field gains focus.
	
	handleFocus: function(e) {
		e.target.classList.remove('borderline');
		e.target.nextSibling.classList.add('invisible');
	},
	
	// This function checks for the type of input field, calls its 
	// respective validation function, sets the error message, if
	// required, and returns a boolean. The only field is the eventname.
	
	isValid: function(input) {
		
		//check required field
		if (input.getAttribute('required') != null && input.value ==="") {
			input.classList.add('error'); // add class error
			input.nextSibling.textContent = this.props.messageRequired;
			return false;
		}
		else {
			input.classList.remove('error');
			input.nextSibling.textContent = "";
		}
		// check data type
		if(input.getAttribute('type') === "eventname" && input.value != "") {
			if(!this.validateEventname(input.value)) {
				input.classList.add('error'); // add class error
				input.nextSibling.textContent = this.props.messageRequired;
				return false;
			}
			else {
				input.classList.remove('error');
				input.nextSibling.textContent = "";
				}
		}
		
		return true;
	},
	
	// Eventname validation function
	
	validateEventname: function(value) {
		if(value.length > 2 && !(/[^-\w+( \w+)*$]/.test(value))) {
			if(value !== 'sign-in' && value !== 'sign-up' && value !== 'about' && value !== 'user') {
				return true;
			}
		}
		else {
			return false;
			}
	},
	
	componentDidMount: function() {
		if(this.props.onComponentMounted) {
			this.props.onComponentMounted(this); // register this input in the form
			}
		},
		
	render: function() {
		var inputField;
		inputField = <input type={this.props.type} value={this.props.value} ref={this.props.name} name={this.props.name}
		className='formInput' required={this.props.isrequired} onChange={this.handleChange} onBlur={this.handleBlur} onFocus={this.handleFocus} />
		
		return (
				<div className="input_box">
					<label htmlFor={this.props.htmlFor}><h5>{this.props.label}</h5></label>
					{inputField}
					<div className="error invisible"></div>
				</div>
			);
	}
})



// This is the component for the save button in the sidebar.

var SaveEdit = React.createClass({
	getInitialState: function() {
		return { Servermessage: '' }
	},
	contextTypes: {
		gFormsData: React.PropTypes.func.isRequired
	},
	handleSave: function(e) {
		e.preventDefault();
		this.context.gFormsData();
	},
	serveMessage: function(mess) {
			return this.setState({ServerMessage: mess});
		},
  render: function() {
    return <div className="save_edit">
				<button className="save_button" onClick={this.handleSave}>
					<p>Save</p>
				</button>
				<div className="servermessage">
					<h3>{this.state.ServerMessage}</h3>
				</div>
			</div>
  }
})

var mapStateToProps = function(state) {
  return { 
	mainEvent: state.mainEvent
  }
}

var mapDispatchToProps = function(dispatch) {
	return {actions: bindActionCreators(Actions, dispatch)}
}

Editor = connect(
  mapStateToProps,
  mapDispatchToProps
)(Editor)

module.exports = Editor;













