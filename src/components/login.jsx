import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Button, Layout, Row, Icon } from 'antd';


class LoginView extends React.Component{

    onLogin(){

        this.props.auth.login();
    }

    render(){


        return(
            <Layout className="login-wrapper">
                <Layout.Content>
                     <div className="login-inner">
                        <Row type="flex" justify="center" align="middle" className="inner-header">
                             <h2>Simple Serverless Note Taking App</h2>
                        </Row>
                        <div className="login-form">
                            <h3 style={ {marginBottom:30} }>Login With</h3>
                            <p><Button onClick={ this.onLogin.bind(this) } type="primary" style={ {width:'90%'} }>Auth0</Button></p>
                        </div>
                     </div>
                </Layout.Content>
            </Layout>
        );
    }
}

export default connect( state => ({user:state.user}) )( withRouter( LoginView ) );