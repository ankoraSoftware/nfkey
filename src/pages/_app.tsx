import Sidebar from '@/components/Sidebar';
import { api } from '@/lib/api';
import '@/styles/globals.css';
import type { AppContext, AppProps } from 'next/app';
import { Toaster } from 'react-hot-toast';
export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="flex flex-wrap w-full min-w-full">
      <Sidebar user={pageProps.user} />
      <div className="w-full flex-1">
        <Component {...pageProps} />
        <Toaster position="bottom-right" />
      </div>
    </div>
  );
}

App.getInitialProps = async (appContext: AppContext) => {
  if (appContext.ctx.req) {
    api.updateHeaders('cookie', appContext.ctx.req.headers.cookie as string);
  }
  let user = null;
  try {
    user = await api.me();
  } catch (e) {}

  return {
    pageProps: {
      user,
    },
  };
};
