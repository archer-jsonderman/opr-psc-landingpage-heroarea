import React from "react"
import PropTypes from "prop-types"
import ReactDOM from "react-dom"
import { init } from "contentful-ui-extensions-sdk"
import "@contentful/forma-36-react-components/dist/styles.css"
import update from 'immutability-helper';

import { Spinner, TextField, Textarea } from "@contentful/forma-36-react-components"
import Uploader from "./components/imageUploader"
import Headline from "./components/headline"
import Repeater from "./components/repeater"
import {ReactComponent as SvgSymbols} from './components/icons/icon-alarm.svg';//defs/svg-defs.svg'
import "./index.css"

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

//load stateless components to make up the Hero Area Manager.
//this version includes headline, icon repeater, and bg image picker
//TODO: add preview option in dialog
const initialData = {
	isDraggingOver: false,
		headline:'',
		image:'',
		
	
}
class App extends React.Component {
  static propTypes = {
    sdk: PropTypes.object.isRequired
  }
constructor(props){
	super(props)
	let pagevalue = this.props.sdk.field.getValue();
	
	if(pagevalue===null){
		pagevalue = initialData
	}
	if(!pagevalue.image)pagevalue.image={};
	//console.log(pagevalue)
	this.state = pagevalue
}
  

  componentDidMount() {
    this.props.sdk.window.startAutoResizer()
	// Handler for external field value changes (e.g. when multiple authors are working on the same entry).
    this.detachExternalChangeHandler = this.props.sdk.field.onValueChanged(this.onExternalChange)

  }
  componentWillUnmount() {
    this.detachExternalChangeHandler()
  }
  
   handleStateChange =(target,newState)=>{
	   const updatedState = update(
		   this.state,{
			   [target]:{$set:newState}
		   }
	   )	  
	   this.setState(updatedState,this.saveValues)
	   
   }
  saveValues=()=>{
	  //console.log(this.state,' saving')
	  this.props.sdk.field.setValue(this.state)
  }
   onExternalChange = value => {
    this.setState({ value })
  }
 
  render = () => {
      return ( 
	      <>
	      <SvgSymbols/>
		    <Headline 
		    	onStateChange={this.handleStateChange}
		    	{...this.state}/>
		    <Repeater
		    	sdk={this.props.sdk}
		    	{...this.state}
		    />
		  	<Uploader 
		  		sdk={this.props.sdk} 
		  		onStateChange={this.handleStateChange}
		  		{...this.state} />

		  	</>
  		)
  }
}

init(sdk => {
  ReactDOM.render(<App sdk={sdk} />, document.getElementById("root"))
})

if (module.hot) {
  module.hot.accept()
}
