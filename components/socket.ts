import io, { Socket } from "socket.io-client";
import { API_BASE_URL } from "./app_constants";
import { LoggedInUserDetails } from "./user_form";

export class UtilSocket {
    public socket: Socket;
    private SOCKET_URI = `${API_BASE_URL}/chat`;

    constructor(socketFor: 'admin' | 'customer') {
        let loggedInUser: LoggedInUserDetails | null = null;
        const user = localStorage.getItem(socketFor == 'admin' ? 'admin_auth_user' : 'customer_auth_user');
        if(user) loggedInUser = JSON.parse(user);
        this.socket = io(this.SOCKET_URI, { 
            //transports: ['websocket'], 
            extraHeaders: { 
                user_name: loggedInUser?.user.name ?? '', 
                user_id: loggedInUser?.user?._id ?? '',
                type: socketFor
            } 
        });
    }
}