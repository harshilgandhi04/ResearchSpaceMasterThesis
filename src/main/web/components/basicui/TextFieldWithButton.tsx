import * as React from 'react';
import { useEffect, useState } from "react";
import { Component, MouseEvent } from 'react';
import performOperations from './tryapi2'; // Import the operations function
import yasqe = require('yasgui-yasqe');
//import {SparqlQueryEditorContext} from '../sparql-editor/SparqlQueryEditorContext'
import {ResourceLinkContainer} from '../../api/navigation/components/ResourceLinkContainer'
//import { SparqlEditor } from '../sparql-editor';
import {SparqlEditor} from '../sparql-editor/SparqlEditor';
import SparqlQueryEditorContext from '../sparql-editor/SparqlQueryEditorContext';
import { Editor } from 'codemirror';
var $ = require("jquery"), YASQE = require('../../../../../node_modules/yasgui-yasqe/src/main.js'), CodeMirror = require("codemirror");

interface TextFieldWithButtonProps {}

interface TextFieldWithButtonState {
  inputData: string;
  manipulatedData: string;
}

class TextFieldWithButton extends Component<
  TextFieldWithButtonProps,
  TextFieldWithButtonState
> {

  constructor(props: TextFieldWithButtonProps) {
    super(props);
    this.state = {
      inputData: '',
      manipulatedData: '',
    };
  }
  

  handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ inputData: e.target.value });
  };

  handleButtonClick = async () => {
    try {
      YASQE.defaults = $.extend(true, {}, YASQE.defaults, {
        value : ''
      });
      const result = await performOperations(this.state.inputData);
      this.setState({ manipulatedData: result });
      console.log(result);
      const graphURI = 'http://www.harshil.org/pythonscriptdata/graph';
      let modifiedQuery = result.replace('WHERE', `FROM <${graphURI}> WHERE`);

      console.log("Final Query: " + modifiedQuery);

      //var $ = require("jquery"), YASQE = require("yasgui-yasqe");
      YASQE.defaults = $.extend(true, {}, YASQE.defaults, {
        value : '' + modifiedQuery
      });
      

      //console.log(YASQE.defaults.value)
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };

  render() {
    const { inputData, manipulatedData } = this.state;
    return (
      <div>
        <input
          type="text"
          value={inputData}
          onChange={this.handleInputChange}
          placeholder="Type something..."
        />
        
        <button onClick={this.handleButtonClick}>Manipulate Data</button>
        <p>Manipulated Data: {manipulatedData}</p>

        <p><ResourceLinkContainer uri="http://www.researchspace.org/resource/trynew">
         <button >Click here to Redirect</button>
        </ResourceLinkContainer></p>
        
      </div>
      
      
    );
  }
}

export default TextFieldWithButton;
