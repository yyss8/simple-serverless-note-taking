import React from 'react';
import ReactDOM from 'react-dom';
import App from '../src/components/App.jsx';
import { Provider } from 'react-redux';
import storeObj from '../src/store/store.index';
import { createStore, combineReducers} from "redux";
import { BrowserRouter } from 'react-router-dom';

const store = createStore(
  combineReducers(storeObj.reducers),
  storeObj.initialStates
);


describe('Main', () =>{
    it('renders without crashing', () => {
        const div = document.createElement('div');
        ReactDOM.render(
          <Provider store={ store }>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </Provider>
          , div);
    });
});