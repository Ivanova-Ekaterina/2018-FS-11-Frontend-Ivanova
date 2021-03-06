import React, { Component } from 'react';
import {connect} from 'react-redux';
import EmojiPanel from "../emojiPanel/emojiPanel";
import styles from './styles.module.css';
import * as actionTypes from '../../store/actions/actionTypes';
import {ChatConsumer} from '../../App';

 class InputForm extends Component {

     state = {
         showEmoji: true
     };
    handleAttach(event, chat) {
        const url = URL.createObjectURL(event.target.files[0]);
        const ext = event.target.value.split('.');
        if ((ext[ext.length - 1] === 'jpg')
            || (ext[ext.length - 1] === 'png')
            || (ext[ext.length - 1] === 'svg'))
        {
            this.props.SendImage(url, chat);
        }
        else
        {
            this.props.SendFile(url, chat);
        }
    }

    handleOpenEmoji(){
        this.setState({showEmoji: !this.state.showEmoji})
    }

    getPosition(option) {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, option);
        });
    }

    handleGetPosition(chat, emojiList) {
        if (navigator.geolocation) {
            const Promise = this.getPosition();
            Promise.then((position) => {
                this.props.SendMessage(`Latitude: ${ position.coords.latitude} Longitude: ${position.coords.longitude}`, chat, emojiList);
            });
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    render() {
        const props = this.props;
        return (
            <ChatConsumer>
                {context => {
                    return (
            <div>

                <EmojiPanel hidden={this.state.showEmoji} chat={context.chat} />

                <form  className={styles.forminput}  onSubmit={(event) => {event.preventDefault();
                                                        this.props.clearInput();
                                                        this.setState({showEmoji: true});
                                                        if (this.props.value !== ''){
                                                            context.socket.send(JSON.stringify({data: this.props.value, chat: context.chat, emojiList: this.props.emojiList}));
                                                            this.props.SendMessage(this.props.value, props.chat, this.props.emojiList)}}}>

                    <input type="text"  className={styles.input} value={this.props.value} onChange = {(event) => this.props.Input(event.target.value)}/>
                    <slot className={styles.icons}>
                        <div className={this.props.file !== '' ? `${styles.indicator_on} ${styles.pulse}` : `${styles.indicator_off} ${styles.pulse}`}/>
                        <label className={styles.filelabel}>
                           <div className={`${styles.icon} ${styles.attach} ${styles.pulse}`}/>
                            <input type="file" className={styles.file} onInput={(event) => this.handleAttach(event, context.chat)}/>
                        </label>
                        <div className={`${styles.icon} ${styles.position} ${styles.pulse}`} onClick={(event) => this.handleGetPosition(event, context.chat, this.props.emojiList)}/>
                        <div className={`${styles.icon} ${styles.emoji} ${styles.pulse}`} onClick={(event) => this.handleOpenEmoji(event)}/>
                    </slot>
                </form>
            </div>
                        );
                }}
            </ChatConsumer>
        );
    }
}

const mapStateToProps = state => {
    return {
        value: state.msg.content,
        emojiList: state.msg.emojiList,
        file: state.msg.file,
        id: state.msgs.id,
        messages: state.msgs.messages
    }
};

const mapDispatchToProps = dispatch => {
    return {
        SendMessage: (text, chat, emojiList) => dispatch({type: actionTypes.SEND_TEXT, text: text, chat, user: 'me', emojiList: emojiList}),
        clearInput: () => dispatch({type: actionTypes.CLEAR}),
        SendImage: (image, chat) => dispatch({type: actionTypes.SEND_IMAGE, image, chat, user: 'me'}),
        Input: (text) => dispatch({type: actionTypes.INPUT, text: text}),
        SendFile: (file, chat) => dispatch({type: actionTypes.SEND_FILE, file, chat, user: 'me'})
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(InputForm);