import { api } from "@/lib/api";
import "@/styles/globals.css";
import type { AppContext, AppProps } from "next/app";
console.log("test");
export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

App.getInitialProps = async (appContext: AppContext) => {
  if (appContext.ctx.req) {
    api.updateHeaders("cookie", appContext.ctx.req.headers.cookie as string);
  }
  let user = null;
  try {
    user = await api.me();
  } catch (e) {}

  console.log(user);
  return {
    pageProps: {
      user,
    },
  };
};
