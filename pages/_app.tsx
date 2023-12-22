import type { AppProps } from 'next/app'
import { ChakraProvider } from '@chakra-ui/react'
import axios, { AxiosRequestHeaders } from 'axios';
import { API_BASE_URL } from '../components/app_constants';

axios.defaults.baseURL = API_BASE_URL;

function MyApp({ Component, pageProps }: AppProps) {
  axios.interceptors.request.use(async (request) => {
    request.headers = { ...request.headers, "Content-Type": "text/plain" } as AxiosRequestHeaders;
    return request
  })
  return (
    <ChakraProvider>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
export default MyApp
