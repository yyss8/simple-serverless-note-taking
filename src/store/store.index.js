import updater from 'immutability-helper';

const globalReducer  = ( global = {}, action ) =>{

    switch ( action.type ){
        case 'GLOBAL_LOADING_ON_ADD':
            const pageLoadingPerc = global.pageLoadingPerc ? action.perc:global.pageLoadingPerc + action.perc;
            
            if ( pageLoadingPerc >= 100 ){
                return updater(global, {
                    isPageLoaded:{$set: true},
                    pageLoadingPerc:{ $set: 100 }
                });
            }  

            return updater(global, {
                pageLoadingPerc:{$set:pageLoadingPerc }
            });
        case 'GLOBAL_LOADING_ON_CHANGE':
            if ( action.perc >= 100 ){
                return updater(global, {
                    isPageLoaded:{$set: true},
                    pageLoadingPerc:{ $set: 100 }
                });
            }
            return updater(global, {
                pageLoadingPerc:{$set:action.perc }
            });
        case 'GLOBAL_LOADING_ON_RESET':
            return updater(global, {
                isPageLoaded:{ $set:false },
                pageLoadingPerc:{ $set: 0 }
            });
    }

    return global;
};

const userReducer = (user = {}, action) =>{

    switch ( action.type ){
        case 'USER_LOGIN':
            return action.user;
        case 'USER_LOGOUT':
            return {
                idToken:null,
                accessToken:null,
                expiredAt:null
            };
    }

    return user;

}

const idToken = localStorage.getItem('id_token');
const accessToken = localStorage.getItem('access_token');
const expired_at = localStorage.getItem('expires_at');

const initialStates = {
    user:{
        idToken:idToken || null,
        accessToken:accessToken || null,
        expiredAt:expired_at || null
    },
    global:{
        isPageLoaded:false,
        pageLoadingPerc:0,
        onLoadFinished:false
    }
};

export default {
    reducers:{
        global:globalReducer,
        user:userReducer
    },
    initialStates
};