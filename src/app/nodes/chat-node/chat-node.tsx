import { Component } from 'react';
import { useCallback } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { askGPT3Input } from '../../../openai-api';
import './chat-node.scss';

interface Chat {
  text: string;
  type: 'INPUT' | 'OUTPUT';
}

type ChatState = {
  input: string,
  chatHistory: Chat[], // TODO: instead of saving local history, save chathistory in global state
  response: string, // Singular response. more follow ups/responses belong in another chatnode
  responseIsLoading: boolean,
};

export default class ChatNode extends Component<NodeProps, ChatState> {
  constructor(props: any) {
    super(props);
    this.state = {
      input: '',
      chatHistory: [],
      response: '',
      responseIsLoading: false,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.generateResponse = this.generateResponse.bind(this);
  }

  async generateResponse(prompt: string) {
    if (!prompt) {
      return;
    }

    this.setState({responseIsLoading: true});
    const input: Chat = {
      text: prompt,
      type: 'INPUT',
    };

    const response = await askGPT3Input(
      this.state.chatHistory.map(chat => chat.text), prompt
    ) || 'Error: no response received';

    this.setState({response: response});
    this.state.chatHistory.push(input);
    this.state.chatHistory.push({
      text: response,
      type: 'OUTPUT',
    });
    this.setState({responseIsLoading: false});
  }

  handleInputChange(event: any) {
    this.setState({input: event.target.value});
  }

  render() {
    return (
      <div className='chat-node'>
        {!this.state.responseIsLoading || (<div>Loading</div>)}
          {/* <label htmlFor="text">GPT-3 Input</label> */}
        <form
          className='chat-input'
          onSubmit={(event) => {
            this.generateResponse(this.state.input.trim());
            event.preventDefault();
          }}
        >
          <input
            id="text"
            className="text-input"
            name="text"
            type="text"
            placeholder='Ask GPT3'
            autoComplete='off'
            value={this.state.input}
            onChange={this.handleInputChange}
          />
          <button
            onClick={() => this.generateResponse(this.state.input.trim())}
            type="button"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.58227 10.2376L10.2673 7.54512M5.54977 4.74012L11.9173 2.61762C14.7748 1.66512 16.3273 3.22512 15.3823 6.08262L13.2598 12.4501C11.8348 16.7326 9.49477 16.7326 8.06977 12.4501L7.43977 10.5601L5.54977 9.93012C1.26727 8.50512 1.26727 6.17262 5.54977 4.74012Z" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>
        <div className='chat-response'>
          {this.state.response ?? (<div>{this.state.response}</div>)}
        </div>
        <Handle type="source" position={Position.Bottom} id="a" />
      </div>
    )
  }
}
