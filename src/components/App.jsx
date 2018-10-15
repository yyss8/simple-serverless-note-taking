import React from 'react';
import { Switch, Route, withRouter } from 'react-router-dom';
import Progress from 'antd/lib/progress';
import Layout from 'antd/lib/layout';
import { connect } from 'react-redux';
import asyncComponent from './async-component';

import 'antd/dist/antd.css';
import '../styles/main.scss';

const Dashboard = asyncComponent( () => import( './dashboard.jsx' ).then( module => module.default ));

class App extends React.Component{


    componentDidMount(){
        document.getElementById('pre-loading-cover').style.display = 'none';
    }

    componentDidUpdate( prevProps ){

        if ( this.props.global.isPageLoaded && !prevProps.global.isPageLoaded ){

            if ( this.props.location.pathname === '/t' || this.props.location.pathname.startsWith('/t/') ){
                return;
            }

            const { user } = this.props;

            if ( user !== null && !!user.token ){

                if ( this.props.location.pathname.startsWith('/u') ){
                    this.props.history.push('/');
                }

            }else if (!this.props.location.pathname.startsWith('/u')){
                this.props.history.push('/u');
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
                    <Route paht='/' component={ Dashboard } />
                </Switch>
            </Layout>
        );
    }
}


export default connect( state => ({global:state.global, user:state.user}))( withRouter( App ) );