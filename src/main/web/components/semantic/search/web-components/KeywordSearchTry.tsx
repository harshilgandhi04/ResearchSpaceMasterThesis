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
import * as React from 'react';
import * as Maybe from 'data.maybe';
import * as Kefir from 'kefir';
import * as _ from 'lodash';
import { FormControl, FormGroup } from 'react-bootstrap';
import * as SparqlJs from 'sparqljs';

import { Rdf } from 'platform/api/rdf';
import { SparqlUtil, SparqlClient } from 'platform/api/sparql';
import { Component } from 'platform/api/components';
import { Action } from 'platform/components/utils';

import { setSearchDomain } from '../commons/Utils';
import { SemanticSimpleSearchBaseConfig } from '../../simple-search/Config';
import { SemanticSearchContext, InitialQueryContext } from './SemanticSearchApi';
import { HiddenInput } from 'platform/components/forms';

export interface BaseConfig<T> extends SemanticSimpleSearchBaseConfig {
  /**
   * Custom css styles for the input element
   */
  style?: T;

  /**
   * Custom css classes for the input element
   */
  className?: string;

  /**
   * Specify search domain category IRI (full IRI enclosed in <>).
   * Required, if component is used together with facets.
   */
  domain?: string;

  /**
   * Number of milliseconds to wait after the last keystroke before sending the query.
   *
   * @default 300
   */
  debounce?: number;
}

export interface SemanticSearchKeywordConfig extends BaseConfig<string> {}

interface KeywordSearchProps extends BaseConfig<React.CSSProperties> {}

class KeywordSearchTry extends Component<KeywordSearchProps, {}> {
  render() {
    return (
      <div>
        <SemanticSearchContext.Consumer>
          {(context) => <KeywordSearchInner {...this.props} context={context} />}
        </SemanticSearchContext.Consumer>
      </div>
    );
  }
}

interface InnerProps extends KeywordSearchProps {
  context: InitialQueryContext;
}

interface State {
  value: string;
}

class KeywordSearchInner extends React.Component<InnerProps, State> {
  static defaultProps: Partial<KeywordSearchProps> = {
    placeholder: 'Search all, minimum 3 characters',
    className: "input-keyword-search",
    searchTermVariable: '__token__',
    minSearchTermLength: 3,
    debounce: 300,
    escapeLuceneSyntax: true,
  };

  private keys = Action<string>();

  constructor(props: InnerProps) {
    super(props);
    this.state = {
      value: undefined,
    };
  }

  componentDidMount() {
    setSearchDomain(this.props.domain, this.props.context);
    this.initialize(this.props);
    
    
  }

  componentWillReceiveProps(props: InnerProps) {
    const { context } = props;
    if (context.searchProfileStore.isJust && context.domain.isNothing) {
      setSearchDomain(props.domain, context);
    }
  }

  render() {
    const { placeholder, style, className, query } = this.props;
    return (
      <p></p>
      // <FormGroup controlId="semantic-search-text-input">
      //   <FormControl
      //     className={className}
      //     style={style}
      //     value={this.state.value}
      //     placeholder={placeholder}
      //     onChange={this.onKeyPress}
      //     disabled={true}
      //     hidden ={true}
      //   />
      // </FormGroup>
    );
  }

  private initialize = (props: InnerProps) => {
    //props.query = window.querypassing

    const query = SparqlUtil.parseQuerySync<SparqlJs.SelectQuery>(props.query);
    console.log("Idhar Se: ",props.query)
    let defaultQuery;
    if(props.query.includes('has_note') || props.query.includes('rdfs:label')){
      console.log("idhar toh aaya")
      //props.defaultQuery = props.query
      defaultQuery = props.query
      ? Maybe.Just(SparqlUtil.parseQuerySync<SparqlJs.SelectQuery>(props.query))
      : Maybe.Nothing<SparqlJs.SelectQuery>();
      console.log("Default query1: ", defaultQuery)
    }
    else{
      defaultQuery = props.defaultQuery
      ? Maybe.Just(SparqlUtil.parseQuerySync<SparqlJs.SelectQuery>(props.defaultQuery))
      : Maybe.Nothing<SparqlJs.SelectQuery>();
      console.log("Default query2: ", defaultQuery)
    }
    const queryProp = this.keys.$property
      .filter((str) => str.length >= this.props.minSearchTermLength)
      .debounce(this.props.debounce)
      .map(this.buildQuery(query));

    const defaultQueryProp = this.keys.$property
      .filter((str) => props.defaultQuery && _.isEmpty(str))
      .map(() => defaultQuery.get());
    console.log("Kya yeh hai default: ", defaultQueryProp)
    const initializers = [queryProp];
    if (props.defaultQuery) {
      initializers.push(Kefir.constant(defaultQuery.get()), defaultQueryProp);
    }

    Kefir.merge(initializers).onValue((q) => this.props.context.setBaseQuery(Maybe.Just(q)));
  };

  private onKeyPress = (event: React.FormEvent<FormControl>) => this.keys((event.target as any).value);

  private buildQuery = (baseQuery: SparqlJs.SelectQuery) => (token: string): SparqlJs.SelectQuery => {
    const { searchTermVariable, escapeLuceneSyntax, tokenizeLuceneQuery } = this.props;
    const value = SparqlUtil.makeLuceneQuery(token, escapeLuceneSyntax, tokenizeLuceneQuery);
    return SparqlClient.setBindings(baseQuery, { [searchTermVariable]: value });
  };
}

export default KeywordSearchTry;
