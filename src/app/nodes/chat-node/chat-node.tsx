import { Component } from 'react';
import { useCallback } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { askGPT3Input } from '../../../openai-api';

interface Chat {
  text: string;
  type: 'INPUT' | 'OUTPUT';
}

type ChatState = {
  input: string,
  chatHistory: Chat[],
  responseIsLoading: boolean,
};

export default class ChatNode extends Component<NodeProps, ChatState> {
  constructor(props: any) {
    super(props);
    this.state = {
      input: '',
      chatHistory: [],
      responseIsLoading: false,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
  }

  generateResponse(prompt: string) {
    return new Promise(async (resolve, reject) => {
      this.setState({responseIsLoading: true});
      const input: Chat = {
        text: prompt.trim(),
        type: 'INPUT',
      };

      const response = await askGPT3Input(
        this.state.chatHistory.map(chat => chat.text), input.text
      ) || 'Error: no response received';

      this.state.chatHistory.push(input);
      this.state.chatHistory.push({
        text: response,
        type: 'OUTPUT',
      });
      this.setState({responseIsLoading: false});
      resolve(response);
    }).then((response) => {
      console.log('response', response);
    })
  }

  handleInputChange(event: any) {
    this.setState({input: event.target.value});
  }

  render() {
    return (
      <div className='chat-node'>
        {this.state.responseIsLoading ? (<div>Loading</div>) : <></>}
        <label htmlFor="text">GPT-3 Input</label>
        <input
          id="text"
          className="text-input"
          name="text"
          value={this.state.input}
          onChange={this.handleInputChange}
        />
        <button onClick={() => this.generateResponse(this.state.input)}>Submit</button>
        <Handle type="source" position={Position.Bottom} id="a" />
      </div>
    )
  }
}
