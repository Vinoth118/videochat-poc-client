import { Button, Drawer, DrawerBody, DrawerCloseButton, DrawerContent, Flex, Icon, IconButton, Menu, MenuButton, MenuList, useDisclosure, useMediaQuery } from "@chakra-ui/react";
import { useState } from "react";
import { FcVideoCall } from "react-icons/fc";
import { MdChat, MdClose, MdVideocam } from "react-icons/md";
import ChatContainer from "../chat/chat_container";
import VideoContainer from "../video/video_continer";


const VideoChatPopupWindow = () => {
    const [openedWindow, setOpenedWindow] = useState<'CHAT' | 'VIDEO' | null>(null);
    const onClickChat = () => setOpenedWindow('CHAT');
    const onClickVideo = () => setOpenedWindow('VIDEO');
    return (
        <Flex w = '100%' h = '100%' p = '10px' alignItems = 'center' overflow={'hidden'}>
            {
                openedWindow == null &&
                <Flex w = '100%' justifyContent={'center'} gap = '20px'>
                    <Button onClick = {onClickChat} variant={'outline'} leftIcon = {<Icon as = {MdChat} w = '23px' h = '23px' />}>Chat</Button>
                    <Button onClick = {onClickVideo} variant={'outline'} leftIcon = {<Icon as = {MdVideocam} w = '25px' h = '25px' />}>Video Call</Button>
                </Flex>
            }
            {openedWindow == 'CHAT' && <ChatContainer />}
            {openedWindow == 'VIDEO' && <VideoContainer />}
        </Flex>
    );
}

export default VideoChatPopupWindow;