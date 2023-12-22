import { Button, Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import useLocalStorage from "./hooks/use_localstorage";
import { MyOneSignal } from "./one_signal";
import { LoggedInUserDetails } from "./user_form";

let OneSingalInstance: MyOneSignal;

const Header = ({ onDidLogout }: { onDidLogout: () => void }) => {
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [loggedInUser, setLoggedInUser] = useLocalStorage<LoggedInUserDetails>('customer_auth_user');

    const router = useRouter();

    useEffect(() => {
        OneSingalInstance = new MyOneSignal();
    }, [])

    const onLogout = async () => {
        setLogoutLoading(true);
        await OneSingalInstance.logout(loggedInUser!.oneSignalAppId)
        setLogoutLoading(false);
        setLoggedInUser(null);
        onDidLogout();
    }
    
    return (
        <Flex zIndex={99} w = '100%' position={'sticky'} top = {0} height = '70px' bg = 'gray.200' justifyContent={'flex-end'} alignItems = 'center' px = '20px'>
            <Button isLoading = {logoutLoading} colorScheme={'red'} w = 'fit-content' onClick = {onLogout}>Logout</Button>
        </Flex>
    );
}

export default Header;