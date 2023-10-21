import * as React from 'react';
import {Component} from 'platform/api/components';
import AutogenSparqlQueryEditor from 'platform/components/sparql-editor/AutogenSparqlQueryEditor';
import KeywordSearchTry from 'platform/components/semantic/search/web-components/KeywordSearchTry';
import OverlayComponent from 'platform/components/ui/overlay/OverlayDialog';
import OverlayContent from 'platform/components/ui/overlay/OverlayDialogContent';
import OverlayTrigger from 'platform/components/ui/overlay/OverlayDialogTrigger';
import { addNotification, ErrorPresenter } from 'platform/components/ui/notification';
import { Cancellation } from 'platform/api/async';
import performOperations from './tryapi2';
import { Spinner } from 'platform/components/ui/spinner';
import {SemanticSearch} from "platform/components/semantic/search/web-components/SemanticSearch"
import { useEffect, useState } from "react";
import { addInsertIntoGraph } from '../forms';
import { delay, size } from 'lodash';
import { KeywordSearch } from '../sets/Defaults';
import SimpleSearch from '../semantic/simple-search/SimpleSearch';

interface GreetingComponentProps {
  name: string
}

interface GreetingComponentState {
  isLoading: boolean,
  addition: string,
  updated: string,
  manipulatedData: string,
  errorquery: string;
}



export class GreetingComponent extends Component<GreetingComponentProps, GreetingComponentState> {

  // private editor: SparqlQueryEditor;
  private readonly cancellation = new Cancellation();
  constructor(props: GreetingComponentProps, context: any) {
    super(props, context);
    this.state = {
      isLoading: false,
      addition: '',
      updated: '',
      manipulatedData: '',
      errorquery: ''
    };
    this.onAdditionChange = this.onAdditionChange.bind(this);
    this.resetOptions = this.resetOptions.bind(this);
    //this.changeQueryText2 = this.changeQueryText2.bind(this);
  }
  handleButtonClick = async () => {
    try {

      const translationregex = /['"]([^'"]+)['"]/g;
      const matches = this.state.addition.match(translationregex);
      let translation2 = null;
      let leftPart = this.state.addition;
      let rightPart = null;
      if(matches==null){
        addNotification({
          message: "Did you really include quotes(\", ') ?",
          level: 'error',
        });
      }

      
      else{
        //console.log(window.globalCategory)
        this.setState({isLoading:true})
        const result = await performOperations(this.state.addition);
        this.setState({isLoading:false, manipulatedData: result});

        //console.log(result);

        if (this.state.manipulatedData === "We had some trouble generating the query. Click on Show Guidelines for information"){
          addNotification({
            message: "We had some trouble generating the query. Click on Show Guidelines for information",
            level: 'error',
          });
          this.setState({manipulatedData : ""})
        }
        else if (this.state.manipulatedData === "Did you really add quotes?"){
          addNotification({
            message: "Did you really add quotes?",
            level: 'error',
          });
          this.setState({manipulatedData : ""})
        }
        else if (this.state.manipulatedData === "Did you miss an 'and'?"){
          addNotification({
            message: "Did you miss an 'and'?",
            level: 'error',
          });
          this.setState({manipulatedData : ""})
        }
      }
        //console.log(YASQE.defaults.value)
      } catch (error) {
        console.error('Error occurred:', error);
      }
  };
  resetOptions(): void {
    this.setState({isLoading:true});
    setTimeout(() => {
      console.log('This will be executed after 5 seconds.');
      let resetquery = "PREFIX ns1: <http://www.cidoc-crm.org/cidoc-crm/> SELECT ?Term  WHERE { ?Term a ns1:E1_CRM_Entity . } Limit 10"
    this.setState({isLoading:false, manipulatedData: resetquery});
    console.log(this.state.manipulatedData)
    }, 3000);
    console.log("Dekhte hai")
    
  }



  render() {

    //console.log(this.state.addition)
    //console.log(this.state.updated)
    const { manipulatedData, isLoading} = this.state;
    const { errorquery } = this.state;

    /*if (isLoading) {
      return <Spinner />;
    } else {*/
      return (<div>
        <div style={{marginTop:30, textAlign: 'center'}}><h1>What would you like to search?</h1>       
        
        <input type="text" placeholder='Enter your text here' className="form-control" style={{marginLeft: 550, marginTop: 30, width: 700, textAlign: 'center'}} id="queryInputBox" onChange={this.onAdditionChange} />
        <OverlayComponent title="Guidelines" type="modal" bs-size="large">
          <OverlayTrigger><button className="btn btn-default" >Show Guidelines</button></OverlayTrigger>
            <OverlayContent>
              <ul>
                <li>There are several categories in which you can search for your data. These include:
                  <ul>
                    <li><b>Annotation</b></li>
                    <li><b>Author and Fragment</b></li>
                    <li><b>Literature</b></li>
                    <li><b>English Translation</b></li>
                    <li><b>German Translation</b></li>
                    <li><b>Italian Translation</b></li>
                    <li><b>Volume</b></li>
                    <li><b>Category</b></li>
                  </ul>
                  </li>
                <li>When entering specific data using double/single quotes(" '). For example "25", 'statue', "geld", etc.</li>
                <li>Example Queries:</li>
                  <ul>
                    <li>Find all objects with english tranlsation "statue"</li>
                  </ul>
              </ul>
            </OverlayContent>
        </OverlayComponent>
        <button type="button" className="btn btn-primary" style={{marginLeft: 20, marginTop: 50, marginBottom: 50}} onClick={this.handleButtonClick}>Submit Query</button>
        <button type="button" className="btn btn-primary" style={{marginLeft: 20, marginTop: 50, marginBottom: 50}} onClick={this.resetOptions}>Reset Query</button>
        </div>
        {isLoading ? (<Spinner />) : (
          <div>
            <KeywordSearchTry defaultQuery='PREFIX ns1: <http://www.cidoc-crm.org/cidoc-crm/> SELECT ?Term  WHERE { ?Term a ns1:E1_CRM_Entity . } Limit 10' query={manipulatedData} domain='<http://www.cidoc-crm.org/cidoc-crm/E1_CRM_Entity>' > 
            </KeywordSearchTry>
          </div>)}
        
      </div>);
      //}
  }

  
  
  private onAdditionChange(event) {
    this.setState({
      addition: event.target.value,
      isLoading: false
    });
  }

  subComponent() {
    return (<div>He World</div>);
  };

  componentWillUnmount() {
    this.cancellation.cancelAll();
  }



}



interface ManioComponentProps {
  name: string
}

interface ManioComponentState {
  addition: string
}

// register GreetingComponent as the default export for this source file
export default GreetingComponent;