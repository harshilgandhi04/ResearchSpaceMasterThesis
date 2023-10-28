/**
 * ResearchSpace
 * Copyright (C) 2020, © Trustees of the British Museum
 * Copyright (C) 2015-2019, metaphacts GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * @author Philip Polkovnikov
 */

import * as React from 'react';
import { Component, createElement } from 'react';
import * as maybe from 'data.maybe';
import { Just, Nothing } from 'data.maybe';
import * as _ from 'lodash';
import * as SparqlJs from 'sparqljs';
import * as Kefir from 'kefir';

import { SparqlClient, SparqlUtil, QueryContext } from 'platform/api/sparql';
import { getCurrentUrl } from 'platform/api/navigation';
import { ConfirmationDialog } from 'platform/components/ui/confirmation-dialog';
import { SaveSetDialog, createNewSetFromItems } from 'platform/components/sets';
import { ConfirmActionDialog } from 'platform/components/sets/ConfirmActionDialog';
import { getOverlaySystem } from 'platform/components/ui/overlay';
import { Alert, AlertConfig, AlertType } from 'platform/components/ui/alert';
import { Rdf } from 'platform/api/rdf';
import { MenuProps } from 'platform/components/ui/selection/SelectionActionProps';
import { AllTitleProps } from './TypedSelectionActionProps';
import TypedSelectionActionComponent, { closeDialog } from './TypedSelectionActionComponent';

type Props = MenuProps & AllTitleProps & { id: string, objectIri: string };

interface State {
  isExecuting?: boolean;
  alertState?: Data.Maybe<AlertConfig>;
  query?: string;
  repositoryStatus?: Immutable.Map<string, boolean>;
  selectedRepository?: string;
  transVariable: string;
}

export default class LinkImageWithCRMEntity extends Component<Props, State> {

  // private yasr: YasguiYasr.Yasr;

  constructor(props: Props, context: any) {
    super(props, context);
    this.state = {
      isExecuting: false,
      alertState: Nothing<AlertConfig>(),
      selectedRepository: getCurrentUrl().search(true)['repository'],
      query: null,
      transVariable: ''
      
    };

    // this.onSave = this.onSave.bind(this);
    //console.log("chiara");
    //console.log(this.state);
    //console.log(this.context);
    // context.queryEditorContext = new ;
    // context.queryEditorContext.setQuery(this.state.query, {silent: true});
    // console.log("Checking here: ", this.state.query)
  }

  static defaultProps = {
    menuTitle: 'Link Image',
    title: 'Link Image',
    objectIri: null
  };

  render() {
    const { selection, closeMenu, menuTitle, title, objectIri } = this.props;
    console.log("object hi:  ");
    console.log(objectIri);
    console.log("selection:  ");
    console.log(selection);
    return (
      
      <TypedSelectionActionComponent
        menuTitle={menuTitle}
        title={title}
        isDisabled={(s) => s.length === 0}
        renderRawDialog={(s) => (
          <ConfirmActionDialog
            title="Link Selected Images"
            onSave={() => this.onSave(s, objectIri)}
            onHide={() => {
              /**/
            }}
            maxSetSize={maybe.Nothing<number>()}
          />
        )}
        selection={selection}
        closeMenu={closeMenu}
      />
    );
  }

  onSave = (selection: string[], name: string) => {
    console.log("Name");
    console.log(name);
    console.log("Selexion");
    console.log(selection);
    // this.executeQuery(this.state.query)
    // {this.state.isExecuting ? 'Executing...' : 'Execute'}
    let sparqlQuery = `
      PREFIX crm: <http://www.cidoc-crm.org/cidoc-crm/>
      DELETE {
        <${name}> crm:P138i_has_representation <http://localhost:10214/digilib/img/digilib-notfound.png>
      }
      INSERT {
      GRAPH <http://user-made-rdfs.com/data/> {
        <${name}>`;

    for (let i = 0; i < selection.length; i++) {
          if (i === selection.length - 1) {
              sparqlQuery += `
                  crm:P138i_has_representation <${selection[i]}> .`;
          } else {
              sparqlQuery += `
                  crm:P138i_has_representation <${selection[i]}> ;`;
          }
    }
    
        sparqlQuery += `
      }
    }`;

    sparqlQuery += `
    WHERE{
      OPTIONAL{
        <${name}> crm:P138i_has_representation <http://localhost:10214/digilib/img/digilib-notfound.png>
      }
    }`
    
    console.log("sparqlQuery");
    console.log(sparqlQuery);
    this.executeQuery(sparqlQuery);
    {this.state.isExecuting ? 'Executing...' : 'Execute'}
    return Kefir.constant("Hello, Kefir!");
  };


  private executeQuery = (query: string) => {
    this.setState({ isExecuting: true });

    try {
      console.log("ooo");
      console.log(query);
      const parsedQuery = SparqlUtil.parseQuery(query);
      console.log(JSON.stringify(parsedQuery, null, 2));
      switch (parsedQuery.type) {
        case 'query':
          this.sendSparqlQuery(parsedQuery, parsedQuery.queryType);
          break;
        case 'update':
          this.confirmAndExecuteSparqlUpdate(parsedQuery);
          break;
      }
    } catch (e) {
      const message = _.startsWith(e.message, 'Parse error') ? 'Query Syntax Error. ' + e.message : e.message;
      this.setState({
        isExecuting: false,
        alertState: Just<AlertConfig>({
          alert: AlertType.DANGER,
          message: message,
        }),
      });
    }
  };

  private sendSparqlQuery = (query: SparqlJs.SparqlQuery, queryType: string) => {
    SparqlClient.sparqlQuery(query, SparqlClient.stringToSparqlQueryForm[queryType], this.getQueryContext()).onAny(
      (event) => {
        console.log("hoi");
        console.log(JSON.stringify(event, null, 2));
        if (event.type === 'value') {
          // this.yasr.setResponse(event.value);
          if(this.state.transVariable == '' && event.value.includes('Categories')){
            this.setState({transVariable: event.value})
            //console.log(this.state.transVariable)
            window.globalCategory = this.state.transVariable;
            //this.props.varipass = window.globalCategory
            console.log(window.globalCategory)
          }
          this.setState({
            alertState: Nothing<AlertConfig>(),
            isExecuting: false,
          });
        } else if (event.type === 'error') {
          // seems typings are wrong in kefir
          const e: any = event as any;
          this.setState({
            isExecuting: false,
            alertState: Just<AlertConfig>({
              alert: AlertType.DANGER,
              message: e.value['statusText'] ? e.value['statusText'] : e.value['message'],
            }),
          });
        }
      }
    );
    
  };

  private confirmAndExecuteSparqlUpdate(query: SparqlJs.SparqlQuery) {
    const dialogRef = 'update-confirmation';
    const { context } = this.getQueryContext();
    const hideDialog = () => getOverlaySystem().hide(dialogRef);
    const props = {
      message: `Do you want to execute the UPDATE operations on the "${context.repository}" repository?`,
      onHide: () => {
        hideDialog();
        this.setState({ isExecuting: false });
      },
      onConfirm: (confirm) => {
        hideDialog();
        if (confirm) {
          this.executeSparqlUpdate(query);
        } else {
          this.setState({ isExecuting: false });
        }
      },
    };
    getOverlaySystem().show(dialogRef, createElement(ConfirmationDialog, props));
  }

  private executeSparqlUpdate = (query: SparqlJs.SparqlQuery) => {
    SparqlClient.executeSparqlUpdate(query as SparqlJs.Update, this.getQueryContext())
      .onValue((v) => {
        this.setState({
          alertState: Nothing<AlertConfig>(),
          isExecuting: false,
        });
        // this.yasr.setResponse('SPARQL Update Operation executed!');
      })
      .onError((e: Error) => {
        this.setState({
          isExecuting: false,
          alertState: Just<AlertConfig>({
            alert: AlertType.DANGER,
            message: e.message,
          }),
        });
      });
  };
  
  private getQueryContext = () => {
    const contextOverride: Partial<QueryContext> = this.state.selectedRepository
      ? { repository: this.state.selectedRepository }
      : undefined;
    return { context: { ...this.context.semanticContext, ...contextOverride } };
  };

}
