import React from 'react';
import { Switch, Route, withRouter, Redirect } from 'react-router-dom';
import Progress from 'antd/lib/progress';
import Layout from 'antd/lib/layout';
import { connect } from 'react-redux';
import Auth from '../utilities/auth';
import asyncComponent from './async-component';

import 'antd/dist/antd.css';
import '../styles/main.scss';

const Dashboard = asyncComponent( () => import( './dashboard.jsx' ).then( module => module.default ));
const LoginView = asyncComponent( () => import( './login.jsx' ).then( module => module.default ));
const AuthView = asyncComponent( () => import( './auth.jsx' ).then( module => module.default ));

const auth = new Auth();

class App extends React.Component{


    componentDidMount(){
        const cover = document.getElementById('pre-loading-cover');

        if ( cover ){
            cover.style.display = 'none';
        }
    }

    componentDidUpdate( prevProps ){

        if ( this.props.global.isPageLoaded && !prevProps.global.isPageLoaded ){

            const { user } = this.props;
            const isLogged = user.idToken !== null;

            if ( this.props.location.pathname.startsWith('/auth') ){
                return;
            }

            if ( isLogged ){

                if ( this.props.location.pathname.startsWith('/login') ){
                    this.props.history.push('/note');
                }

            }else if (!this.props.location.pathname.startsWith('/login')){
                this.props.history.push('/login');
            }

        }

    }

    render(){

        const { global, user } = this.props;
  
        return(
            <Layout className='app-wrapper'>
                { global.pageLoadingPerc > 0 && <Progress className='global-loader-progress' showInfo={false} status="active" strokeLinecap="square" percent={global.pageLoadingPerc} />}
                { !global.isPageLoaded && global.pageLoadingPerc < 100 && <div className='red-loading-view fixed'></div> }
                <Switch>
                    <Route path="/login" render={ props => <LoginView {...props} auth={ auth } /> } />
                    <Route path='/note' render={ props => <Dashboard {...props} auth={ auth } /> } />
                    <Route paht="/auth" render={ props => <AuthView {...props} auth={ auth } /> } />
                </Switch>
            </Layout>
        );
    }
}


export default connect( state => ({global:state.global, user:state.user}))( withRouter( App ) );