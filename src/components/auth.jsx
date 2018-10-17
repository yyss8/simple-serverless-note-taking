import React from 'react';
import { connect } from 'react-redux';
import qs from 'qs';
import { Spin } from 'antd';
import { withRouter } from 'react-router-dom';

import { userLogin } from '../actions/user';

class AuthView extends React.Component{


    componentWillMount(){

        const parsed = qs.parse( location.hash.replace('#','') );
        console.log(location.search);
        if ( !parsed.access_token ){
            this.props.history.push('/login');
            return;
        }

        const tokenInfo = {
            accessToken:parsed.access_token,
            expiresAt:parsed.expires_in,
            idToken:parsed.id_token
        };

        this.props.dispatch( userLogin( tokenInfo ) );
        this.props.auth.setSession(tokenInfo);
        this.props.history.push('/note');
    }

    render(){

        return (
            <div className='auth-wrapper'>
                <div className="auth-inner">
                    <Spin size="large"  spinning />
                    <h4 style={ {marginTop:30} }>Authorizing</h4>
                </div>
            </div>
        );
    }
}

export default connect( state => ({ user:state.user }) )( withRouter( AuthView ) );