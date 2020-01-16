import React from "react";
import { init } from "contentful-ui-extensions-sdk";
import "@contentful/forma-36-react-components/dist/styles.css"
import {TextField, Textarea } from "@contentful/forma-36-react-components"
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default class Headline extends React.Component{
	constructor(props){
		super(props)
		//if(!this.props.value) console.log('no value - headline')
		this.handleEditorChange = this.handleEditorChange.bind(this)
	}
	handleEditorChange=(value)=>{
		this.props.onStateChange('headline',value)
	}
	 modules = {
		toolbar: [
			['bold', 'italic', {'script':'super'}],
			['clean']
		    ],
	  }
	render(){
		
		const {headline} = (typeof this.props!== 'undefined' && this.props)||'';
		//headline must be empty string and n ot undefined object or Quill has an issue
		return(
			<>
				<label className="FormLabel__FormLabel___3d6zQ" data-test-id="cf-ui-form-label" htmlFor="hero-headline">Hero Headline</label>
				<ReactQuill 
			  		name="hero-headline"
			  		id="hero-headline" 
			  		value={headline||''}
			  		onChange={(value)=>this.handleEditorChange(value)} 
			  		modules={this.modules}
			  		/>
	  		</>
		)
	}
}