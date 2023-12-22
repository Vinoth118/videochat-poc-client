import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerHeader, Flex, Icon, IconButton, Menu, MenuButton, MenuList, useDisclosure, useMediaQuery } from "@chakra-ui/react";
import { FcVideoCall } from "react-icons/fc";
import { MdClose } from "react-icons/md";
import VideoChatPopupWindow from "./video_chat_window";


const VideoChatContainer = () => {
    const { isOpen, onToggle, onClose } = useDisclosure();
    const [isMobile] = useMediaQuery('(max-width: 600px)')
    return (
        <Flex zIndex={9999} position={'fixed'} bottom = {'20px'} right = {'20px'}>
            {
                isMobile ? 
                <>
                    <Drawer blockScrollOnMount  = {false} isOpen = {isOpen} onClose = {onClose} size = 'full'>
                        <DrawerContent p = '0px'>
                            <DrawerHeader>
                                <DrawerCloseButton />
                            </DrawerHeader>
                            <DrawerBody p = '0px'>
                                <VideoChatPopupWindow />
                            </DrawerBody>
                        </DrawerContent>
                    </Drawer>
                    <IconButton 
                        onClick = {onToggle} 
                        display = {isOpen ? 'none' : 'intial'}
                        aria-label = 'video_call_trigger_button'
                        isRound 
                        w = '60px' h = '60px' 
                        bg = {'blue.100'}
                        _focus = {{}}
                        _expanded = {{ bg: 'red.100' }}
                        color = 'red'
                        icon = {<Icon as = {isOpen ? MdClose : FcVideoCall} w = '30px' h = '30px' />}
                    />
                </> :
                <Menu isLazy isOpen = {isOpen} placement = 'top-end' offset={[0, 20]}>
                    <MenuButton 
                        as = {IconButton} 
                        onClick = {onToggle} 
                        isRound 
                        w = '60px' h = '60px' 
                        bg = {'blue.100'}
                        _focus = {{}}
                        _expanded = {{ bg: 'red.100' }}
                        color = 'red'
                        icon = {<Icon as = {isOpen ? MdClose : FcVideoCall} w = '30px' h = '30px' />}
                        boxShadow = 'rgba(0, 0, 0, 0.16) 0px 5px 40px'
                    />
                    <MenuList 
                        h = 'calc(100vh - 150px)' w = {['450px', '350px', '350px', '30vw', '30vw']} 
                        maxH = '700px' maxW = '450px' p = '0px' 
                        borderRadius={'15px'} border = '0px'
                        boxShadow = 'rgba(0, 0, 0, 0.16) 0px 5px 40px'
                    >
                        <VideoChatPopupWindow />
                    </MenuList>
                </Menu>
            }
        </Flex>
    );
}

export default VideoChatContainer;
