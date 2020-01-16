import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import update from 'immutability-helper';
import arrayMove from 'array-move';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
	CardDragHandle,
	EntryCard, 
	ModalConfirm,
	Button,
	Form,
	TextInput,
	Textarea,
	TextField,
	Icon } from '@contentful/forma-36-react-components';
import '@contentful/forma-36-react-components/dist/styles.css';
import FontIconPicker from '@fonticonpicker/react-fonticonpicker';
import '@fonticonpicker/react-fonticonpicker/dist/fonticonpicker.base-theme.react.css';
import '@fonticonpicker/react-fonticonpicker/dist/fonticonpicker.material-theme.react.css';
import './index.css'; 
//No modal, edit in main interface. 
//make these square/stacked
const initFormat = {
    items: [{
            id: "item1",
            body: {
                content: "<p></p>",
                headline: "Default Item"
            },
            index: 0
        }],
    modal: {
        shown: false
    },
    target: {
        id: "",
        body: {
            content: "",
            headline: ""
        },
        index: null
    }
}
//TODO: remove modal for edit due to sizing issues. replace card with fields on edit
//renderFunc={(svg)=>this.renderSVG(svg, settings.icon.icon)}
const DragHandle = SortableHandle(() => {
	return(
		<div className="CardDragHandle__CardDragHandle___2rqnO">
			<svg data-test-id="cf-ui-icon" 
				className="Icon__Icon___38Epv Icon__Icon--small___1yGZK Icon__Icon--muted___3egnD" 
				xmlns="http://www.w3.org/2000/svg" 
				width="24" 
				height="24" 
				viewBox="0 0 24 24"
			>
				<path 
					fill="none" 
					d="M0 0h24v24H0V0z">
				</path>
				<path 
					d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z">
				</path>
			</svg>
		</div>
	)
});

const SortableItem = SortableElement((props) => {
	
	return (

		<div className="Item" >
			<DragHandle/>
			<div>
				<FontIconPicker
					icons={['alarm','city','crime','home','police']}
					value=''
					onChange={(val)=>props.onIconChange(val)}
					iconsPerPage={5}
					showSearch={false}
					showCategory={false}
					closeOnSelect={true}
					
					/>
				<ReactQuill 
			  		name="tagline" 
			  		value=''
			  		onChange={(value)=>props.onTextChange(value,true)} 
			  		modules={props.modules}
			  		/>
			</div>

			<div className="buttonArea">				
			    <button onClick={()=>props.onChildRemove(props)}
			    	className="removeButton">
			    	<Icon icon="Close"/>
				</button>
			</div>				
		</div>

	)
});

const SortableList = SortableContainer((props) => {
console.log(props)
	return (
		<div className="sortableList">
		<h3>Section Items</h3>
		  {props.items.map((item, index) => (
			    <SortableItem
			    	key={item.id} 	 
			    	index={index} 
			    	value={item}
			    	modules={props.modules} 
			    	onTextChange={props.onTextEdit}
			    	onIconChange = {props.onIconChange}
			    	onChildRemove={props.onRemove}
			    	id={item.id}
			    	childIndex={index}
			    	child={item}
			    	/>
			    )   	
		  )}
		 
	</div>
	);
});



export default class Repeater extends React.Component {
	constructor(props) {
		super(props);
		this.handleRTEchange = this.handleRTEchange.bind(this)
		this.clearAndSave = this.clearAndSave.bind(this)
			
	}
	
	componentWillMount(){
	  //this.props.sdk.window.updateHeight();
	  //this.props.sdk.window.startAutoResizer();
	  let initObj = this.props;
	  //initObj.modal.shown = false;
	  //if this is a new page, there is no field value, so set to a default structure to avoid object errors
	  if(!this.props.items)initObj=initFormat;
	  this.setState(initObj)
	}
	
	onSortEnd = ({oldIndex, newIndex}) => {	  
		this.setState(({items}) => ({
	      items: arrayMove(items, oldIndex, newIndex),
	    }))
////change to a props call
		this.props.sdk.field.setValue(this.state);
	};
  
  	handleAddItem=()=>{
		const {items} = this.state;//destructure, pull items object out
		const newId = 'item-'+[...Array(5)].map(_=>(Math.random()*36|0).toString(36)).join('');
		const newObj = {"id":newId	,"body":{"content":"","headline":"..."}}
		const AddState = [...items, newObj]//add new item to items object
		this.setState({items:AddState},this.handleEditModal({id:newObj.id, childIndex:(items.length), child:newObj}));

  	}
  	handleEdit=(props)=>{
	  	const {fieldChange,items, target} = {...this.state}
  		const updateTarget = update(
  			this.state,
  			{
		  		modal:{
			  		shown:{$set:false},
			  		},
		  		items:{
			  		[props.index]:
			  		{body:
				  		{
				  		content:{$set:target.body.content},
				  		headline:{$set:target.body.headline}
				  		}
				  	}
		  		}
	  		})
  		this.setState(updateTarget,()=>{this.clearAndSave(true)})
	}
	//TODO: combine this and handleRemoveModal, since both are just setting states
	handleEditModal=(props)=>{
		const modalSet = update(
			this.state,{
				modal:{
				  	shown:{$set:true},
				  	type:{$set:'edit'},
				  	title: {$set:"Edit Entry"},
				  	intent:{$set:"primary"},
				  	confirm:{$set:"Change Entry"},
			  	
			  	},
				target:{
					index:{$set:props.childIndex},
					id:{$set:props.id},
					body:{
						headline:{$set:props.child.body.headline},
						content:{$set:props.child.body.content}
					}
				}
			
		  	})
	  	this.setState(modalSet)		  	
	}
	handleFieldChange=(event, isModal)=>{
		const {name, value} = event.target
			const updates = update(this.state,{
				target:{
					body:{
						[name]:{$set:value}
					}
				}
			})
			this.setState(updates)
		
	}
	handleRTEchange=(value,isModal)=>{
			let target = {...this.state.target}
			const changed = update(this.state,{
				target:{
					body:{
						content:{
							$set:value
						}
					}
				}
			})
			this.setState(changed);
		
	}	
	handleIconChange =(val)=>{
		console.log(val, ' icon change')
		//const changeObj = {icon:this.props.settings.icon.icon,color:this.props.settings.icon.color}
		/*if(!val){
			changeObj.color = color.hex
		}else{
			changeObj.icon = val;
		}*/
		//this.props.onChange({icon:changeObj})
	}

  	handleRemoveModal=(props)=>{
	  	const modalSet = update(this.state,{
		  	modal:{
			  	shown:{$set:true},
			  	type:{$set:'delete'},
			  	title: {$set:"Confirm Entry Removal"},
			  	intent:{$set:"negative"},
			  	confirm:{$set:"Confirm Entry Removal"},
			  	}, 
		  	target:{
			  	index:{$set:props.childIndex},
			  	id:{$set:''},
			  	body:{
				  	content:{$set:''},
				  	headline:{$set:''}
				  	}
			  	}
			 }
	  	)
	  	this.setState(modalSet)
	}	
  	handleRemove=(props)=>{
	  	const removal = update(this.state,{
	  		items:{$splice:[[props.index,1]]}	
	  		} )
	  	this.setState(removal,()=>{this.clearAndSave(true)})
	  	 	
  	} 	
  	onConfirm(props){
	  	if(this.state.modal.type==="delete"){
		  	
		  	this.handleRemove(props)
	  	}else{
		  	this.handleEdit(props)
	  	}
  	}
  	clearAndSave(save){
	  	const clear = update(this.state,{
		  	modal:{shown:{$set:false}},
		  	target:{
			  	id:{$set:''},
			  	index:{$set:''},
			  	body:{
				  	content:{$set:''},
				  	headline:{$set:''}
			  	}}
	  	})
	  	this.setState(clear)
////change to a props call
	  	if(save===true)this.props.sdk.field.setValue(this.state)
  	}
  	renderSwitch(param) {
	  	//create the form as an external object for better customization
	  	//need an icon picker and a RTE for Landing pages
	  switch(param) {
	    case 'edit':
	  		return(
		  		<Form onSubmit={this.onHandleEdit}>
			  		<TextInput 
			  		name="headline" 
			  		id="headline" 
			  		value={this.state.target.body.headline||''}
			  		onChange={(e)=>this.handleFieldChange(e,true)}
			  		/>
			  		
			  		
			  		
		  		</Form>
		  		)
		break;
		case 'delete':
			return 'You are about to delete this entry.'
		break;
		default:
		break;	  
		}
	}
	 modules = {
		toolbar: [
			['bold', 'italic', {'script':'super'}],
	      ['clean']
		    ],
	  }
	btnShow = () => {
		///set the limit from the index. 
		const btnState = (this.state.items.length >= this.props.sdk.parameters.instance.maxSteps) ? "none" : "block";
		return btnState;
	}
  	render() {
	    return (
		    <>
		    <SortableList 
			    items={this.state.items} 
			    onSortEnd={this.onSortEnd} 
			    onAddItem={this.handleAddItem}
			    onTextEdit = {this.handleRTEchange}
			    onIconChange = {this.handleIconChange}
			    onRemove = {this.handleRemoveModal}
			    modules = {this.modules}
		    /> 
			<Button 
		      buttonType="naked" 
		      isFullWidth={true} 
		      icon="Plus" 
		      id="add-new-item"
		      onClick={this.handleAddItem}
		      style={{display: this.btnShow()}}
			  />
		    
		    <ModalConfirm
		        isShown={this.state.modal.shown||false}
		        size="fullWidth"
		        allowHeightOverflow={true}
		        title={this.state.modal.title||"Modal"}
		        intent={this.state.modal.intent||"positive"}
		        confirmLabel={this.state.modal.confirm||"Confirm"}
		        cancelLabel="Cancel" 										
		        onCancel={()=>{
			        this.clearAndSave(false)
			        }
		        }
		        onConfirm={() => {	
					this.onConfirm(this.state.target)
		        }}
		      >
      	        {this.renderSwitch(this.state.modal.type)}
      	        {this.props.children}
	      </ModalConfirm>
		 
	      </>
		);
	  }
}
