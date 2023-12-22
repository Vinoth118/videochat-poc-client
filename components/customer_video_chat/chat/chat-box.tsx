import { Avatar, Flex, Icon, IconButton, Input, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { MdEmojiEmotions } from "react-icons/md";
import { IoPaperPlane } from "react-icons/io5";
import { UtilSocket } from "../../socket";

export interface ChatMessageType {
    sentBy: string,
    userName: string,
    text: string,
    createdAt: string
}

interface User {
    id: string,
    userName: string,
}

interface Message {
    message: string,
    user: User
    createdAt?: string,
}

interface ChatBoxProps {
    eventId: string,
    user: User,
    isAdmin?: boolean,
}

let connection: UtilSocket;
 
const ChatBox = ({ eventId, user, isAdmin = false }: ChatBoxProps) => {
    const [message, setMessage] = useState('');
    const [messageList, setMessageList] = useState<Message[]>([
        // {
        //     message: 'Buying the product 👍',
        //     user: { id: '1233', userName: 'Jack' }
        // },
        // {
        //     message: 'Buying the product',
        //     user: { id: '1234', userName: 'Zax' }
        // },
        // {
        //     message: '1st product',
        //     user: { id: '123456', userName: 'Vinay' }
        // },
        // {
        //     message: 'Buying the product 👍',
        //     user: { id: '1233', userName: 'Jack' }
        // },
        // {
        //     message: '🤗 💯',
        //     user: { id: '123456123', userName: 'John' }
        // },
        // {
        //     message: 'Cool product. buying.',
        //     user: { id: '123123321', userName: 'Kayal' }
        // },
        // {
        //     message: '1st product',
        //     user: { id: '123456', userName: 'Vinay' }
        // },
    ]);

    useEffect(() => {
        connection = new UtilSocket(isAdmin ? 'admin' : 'customer');
        connection.socket.emit('join-room', eventId);
        connection.socket.on('admin-connected', (e) => console.log('admin connected'));
        connection.socket.on('admin-disconnected', (e) => console.log('admin connected'));
        connection.socket.on('prev-chats', (chats: ChatMessageType[]) => {
            setMessageList(prevList => chats.map(e => ({ message: e.text, user: { userName: e.userName, id: e.sentBy } })))
        });
        connection.socket.on('newMessage', onMessageReceived);

        return () => {
            connection.socket.disconnect()
        }
    }, [])

    const onMessageReceived = (data: { user: User, message: string }) => {
        setMessageList(prevList => [...prevList, { user: data.user, message: data.message }])
    }

    const onClickSendMessage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        if(message == '') return ;
        setMessageList((prevList) => [...messageList, {
            message: message,
            user: { id: user.id, userName: user.userName ?? '' }
        }]);
        connection.socket.emit("message", { message: message, room: eventId });
        setMessage('');
    }

    const onChnageMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
    }

    return (
        <Flex flexGrow={1} position={'relative'} w = '100%' h = '100%' bg = '#F2F2F2' borderRadius={'10px'} direction={"column"}>

            {/* Chat messages list */}
            <Flex p = '10px' pt = '20px' h = '100%' overflow={'scroll'} direction={'column-reverse'} gridGap = '10px'>
                {
                    Array.from(messageList).reverse().map((message, index) => {
                        const isYourMessage = message.user.id == user.id;
                        return <Flex key = {message.message + index} direction = {isYourMessage ? 'row-reverse': 'row'} alignSelf = {isYourMessage ? 'flex-end' : 'flex-start'} gridGap = '10px' alignItems = 'flex-start' w = '85%'>
                            <Avatar size = "sm" name = {message.user.userName} />
                            <Flex gridGap = '5px' direction={'column'} align = {isYourMessage ? 'flex-end' : 'flex-start'}>
                                <Text fontWeight={'bold'}>{message.user.userName}</Text>
                                <Text 
                                    p = '5px' px = '10px' 
                                    //wordBreak={'break-all'}
                                    bg = {isYourMessage ? '#E4E8F1' : 'white'} 
                                    borderLeftRadius={isYourMessage ? '10px' : '0px'}
                                    borderRightRadius={isYourMessage ? '0px' : '10px'}
                                    borderBottomRadius = '10px'
                                    data-testid = {`live_chat_message_${index}`}
                                >
                                    {message.message}
                                </Text>
                            </Flex>
                        </Flex>
                    })
                }
            </Flex>

            {/* Chat input */}
            <form>
                <Flex  p = '10px' bg = '#F2F2F2' w = '100%' borderRadius={'10px'}>   
                    <Flex position={'relative'} gridGap = '10px' bg = 'white' alignItems={'center'} borderRadius={'10px'} w = '100%'>
                        <Input ml = '5px' value = {message} onChange = {onChnageMessage} variant = 'ghost' maxW = {['70%', '70%', '65%', '65%', '70%']} h = {['50px', '60px', '60px', '60px', '60px']} placeholder = 'Chat' data-testid = 'live_chat_message_input' />
                        <Flex h = '50%' w = '1px' bg = '#D8D8D8' />
                        <Flex flex = '1' pr = '10px' justifyContent={'flex-end'} alignItems={'center'} gridGap = '10px'>
                            <IconButton aria-label = 'heart_button' _hover = {{filter: 'opacity(0.7)'}} _focus = {{}} _focusWithin = {{}} bg = 'black' color = 'white' size = 'xs' isRound icon = {<Icon w = '70%' h = '70%' as = {MdEmojiEmotions} />} />
                            <IconButton aria-label = 'send_message_button' type = 'submit' onClick = {onClickSendMessage} _hover = {{filter: 'opacity(0.7)'}} _focus = {{}} _focusWithin = {{}} bg = 'black' color = 'white' icon = {<Icon w = '50%' h = '50%' as = {IoPaperPlane} />} data-testid = 'live_chat_send_message_button' />
                        </Flex>
                    </Flex>        
                </Flex>
            </form>
            
        </Flex>
    );
}
 
export default ChatBox;