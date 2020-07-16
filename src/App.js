import React, { useEffect, useState, useCallback, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import { Client, Message } from '@stomp/stompjs';
import moment from 'moment';



const App = props => {
  const [msg, setMsg] = useState("Type message here...");
  const [chat, setChat] = useState("");
  const client = useRef(new Client({
    brokerURL: "ws://ab5784079193.ngrok.io/ws",
    connectHeaders: {
      login: "user",
      passcode: "password"
    },
    debug: function (str) {
      console.log(str);
    },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: function(frame) {
      // Do something, all subscribes must be done is this callback
      // This is needed because this will be executed after a (re)connect
      client.current.subscribe('/topic/general', onReceive)
    },
    onStompError: function (frame) {
      // Will be invoked in case of error encountered at Broker
      // Bad login/passcode typically will cause an error
      // Complaint brokers will set `message` header with a brief message. Body may contain details.
      // Compliant brokers will terminate the connection after any error
      console.log('Broker reported error: ' + frame.headers['message']);
      console.log('Additional details: ' + frame.body);
    },

  }));

  const prevChatRef = useRef();
  useEffect(() => {
    prevChatRef.current = chat;
  });
  const prevChat = prevChatRef.current;

  const sendMsg = () => {
    client.current.publish({destination: '/topic/general', body: msg});
    setMsg('');
  }

  const onReceive = (msg) => {
    console.log('RECEIVED', msg);
    let m = '[' + new Date().toLocaleString() + '] '+ msg.body; 
    setChat(prevChatRef.current + '\r\n' +m);
  }

  useEffect(() => {
    client.current.activate();
  }, [0]);


  const handleChange = (event) => {
    this.setState({value: event.target.value});
  }

  return (
    <div className="App">
      <p>
          stomp-client
        </p>
      <header className="App-header">
        <textarea cols="80" rows="15"  value={chat}/>
        <textarea cols="50" rows="5" value={msg} onChange={e => setMsg(e.target.value)}/>
        <input type="button" value="Send msg" onClick={sendMsg}/>
      </header>
    </div>
  );
}

export default App;
