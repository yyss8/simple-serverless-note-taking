import React from 'react';
import updater from 'immutability-helper';
import { Card, Dropdown, List, message, Avatar, Menu, Modal, Icon, Table, Button, Checkbox, Input } from 'antd';
import { connect } from 'react-redux';
import moment from 'moment';

import { getJson, putJson, postJson, deleteJson } from '../utilities/request';
import { userLogout } from '../actions/user';
import { finished } from 'stream';

class DashboardView extends React.Component{

    constructor( props ){
        super(props);

        this.state = {
            notes:[],
            isLoading:true,
            isAllSelected:false,
            isEditingNote:false,
            editingNote:'',
            isSubmitting:false,
            editingIndex:-1,
            username:''
        };
    }

    componentWillMount(){

        const { user } = this.props;

        if ( user.idToken === null ){
            this.props.history.push('/login');
        }

    }

    componentDidMount(){

        const { user } = this.props; 

        this.fetchNotes();

        if ( user.accessToken ){
            this.props.auth.auth0.client.userInfo( user.accessToken, (err, profile) =>{
                if ( err ){
                    return;
                }

                this.setState({ username:profile.sub });
            });
        }
    }

    fetchNotes(){
        const { user } = this.props; 

        const params = {
            headers:{
                Authorization:`Bearer ${user.accessToken}`
            }
        };

        getJson( {}, `${API_URL}/notes`, params )
        .then( res =>{
            if ( res.status === 'ok' ){
                this.setState({
                    notes:res.result.notes.map( (note, index) => ({...note, key:`note-${index}`}) ),
                    isLoading:false
                });
            }else{
                message.error(res.errorMessage, 1.5);
                this.setState({ isLoading:false });
            }
        })
        .catch( rejected =>{
            if ( !rejected ){
                return;
            }

            message.error('Error happened', 1.5);
            this.setState({ isLoading:false });
        });
    }

    noteContentOnchange( value, field, index){

        const notes = updater( this.state.notes , {
            [index]:{
                [field]:{ $set:value }
            }
        });

        this.setState({ notes });
    }

    onAddNote( ){
        
        const { user } = this.props; 

        const params = {
            headers:{
                Authorization:`Bearer ${user.accessToken}`
            }
        };

        const isNew = this.state.editingIndex === -1;
        const url = `${API_URL}/notes` + (isNew ? '':`/${this.state.notes[this.state.editingIndex].note_id}`) ;
        const data = {note:this.state.editingNote};

        const succesAction = res =>{
            if ( res.status === 'ok' ){

                let notes;

                if ( isNew ){
                    notes = updater( this.state.notes , {
                        $push:[ {...res.result.note, key:`note-${this.state.notes.length + 1}`} ]
                    });
                }else{
                    notes = updater( this.state.notes , {
                        [this.state.editingIndex]:{
                            note_content:{ $set:this.state.editingNote }
                        }
                    });
                }
                message.success('Note ' + (isNew ? 'Inserted':'Updated'), 1.5);
                this.setState({ notes, isSubmitting:false, isEditingNote:false, editingNote:'' });

            }else{
                message.error(res.errorMessage, 1.5);
                this.setState({ isSubmitting:false });
            }
        };

        const catching = rejected =>{
            if ( !rejected ){
                return;
            }

            message.error('Error happened', 1.5);
            this.setState({ isSubmitting:false });
        };

    
        this.setState({ isSubmitting:true }, () =>{

            if ( isNew ){
                postJson( data, url, params ).then( succesAction ).catch( catching );
            }else{
                putJson( data, url, params ).then( succesAction ).catch( catching );
            }
        });
    }

    onDeleteNote(){

    }

    onLogout(){

        Modal.confirm({
            title:'Confirm to logout from the system?',
            onOk:() =>{
                this.props.dispatch( userLogout() );
                this.props.auth.logout();
                this.props.history.push('/');
            }
        });

    }

    onAllSelected( checked ){

        const notes = this.state.notes.map( note =>{
            return updater( note , {
                isSelected:{ $set:checked } 
            });
        });

        this.setState({ notes, isAllSelected:checked });

    }

    onToggleEditing( index = -1 ){
        
        this.setState( state =>({
            editingNote: index !== -1 ? this.state.notes[index].note_content:'' ,
            editingIndex:index,
            isEditingNote:!state.isEditingNote
        }))

    }

    onDeleteNote( index ){

        const { user } = this.props; 

        const params = {
            headers:{
                Authorization:`Bearer ${user.accessToken}`
            }
        };

        Modal.confirm({
            title:'Confirm to delete note',
            onOk:() =>{
                return new Promise( finished =>{
                    deleteJson( {}, `${API_URL}/notes/${this.state.notes[index].note_id}`, params )
                    .then( res =>{
                        
                        if ( res.status === 'ok' ){
                            const notes = updater( this.state.notes , {
                                $splice:[ [index, 1] ]
                            });
                            
                            this.setState({ notes }, () =>{
                                message.success('Note Deleted', 1.5);
                                finished();
                            });
                        }else{
                            message.error(res.errorMessage, 1.5);
                            finished();
                        }

                        

                    }).catch( rejected =>{
                        if ( !rejected ){
                            return;
                        }
            
                        message.error('Error happened', 1.5);
                        finished();
                    });
                });
            }
        });

    }

    render(){

        const { user } = this.props;
        const dropdownContent = (
            <Menu style={ {width:180} }>
                <Menu.Item style={ {cursor:'default',color:'rgba(0, 0, 0, 0.65)'} } disabled={true} >
                    <span>Welcome { this.state.username !== '' ? this.state.username:'' }</span>
                </Menu.Item>      
                <Menu.Divider />
                <Menu.Item>
                    <a onClick={ this.onLogout.bind(this) }><Icon type="logout" />&nbsp;&nbsp;Logout</a>
                </Menu.Item>     
            </Menu>
        );

        const tableColumn = [
            {
                key:'selected',
                title:<Checkbox checked={ this.state.isAllSelected } onChange={ this.onAllSelected.bind(this) }  />,
                render:( text, note ) => <Checkbox  checked={ note.isSelected } onChange={ checked => this.noteContentOnchange( checked, 'isSelected', index ) } />
            },
            {
                key:'note_id',
                dataIndex:'note_id',
                title:'ID'
            } ,
            {
                key:'note_content',
                dataIndex:'note_content',
                title:'Content'
            },
            {
                key:'created_at',
                render:(text, note) =>{
                    return moment( note.created_at ).format('MM/DD/YYYY');
                },
                title:'Created Time'
            },
            {
                key:'actions',
                title:'',
                render:(text, note, index) =>{
                    return (
                        <span>
                            <Button icon="edit" type="primary" onClick={ ()=> this.onToggleEditing( index ) } />&nbsp;&nbsp;
                            <Button icon="delete" type="danger" onClick={ ( ) => this.onDeleteNote( index ) } />
                        </span>
                    );
                }
            }
        ];

        return(
            <div className="dahsboard-wrapper">
                <Card className="dashboard-inner" title='Simple Serverless Note Taking Application' 
                      extra={ <Dropdown placement="bottomRight" overlay={ dropdownContent } >
                          <Avatar size="large" icon="user" />
                      </Dropdown> } >
                    <p style={ {textAlign:'right'} }>
                        <Button size="small" 
                                icon="plus-circle" 
                                title="New Note" 
                                onClick={ () => this.onToggleEditing( -1 ) } />
                    </p>
                    <Table loading={ this.state.isLoading } columns={ tableColumn } pagination={false} dataSource={ this.state.notes } bordered={true} />
                </Card>
                <Modal confirmLoading={ this.state.isSubmitting } width={ 300 }  visible={ this.state.isEditingNote } onCancel={ () => this.onToggleEditing( -1 ) }  onOk={ this.onAddNote.bind(this) }>
                    <h3>Enter new note below:</h3>
                    <Input.TextArea style={ {margin:'20px 0'} } value={ this.state.editingNote } onChange={ e => this.setState({ editingNote:e.target.value }) } />
                </Modal>
            </div>
        );
    }
}

export default connect( state => ({ user:state.user }) )( DashboardView );