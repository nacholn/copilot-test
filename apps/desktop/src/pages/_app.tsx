/**
 * Next.js App Component - Desktop
 * 
 * Root component that wraps all pages in the desktop app
 */

import type { AppProps } from 'next/app';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Cycling Network Platform - Desktop</title>
      </Head>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
            'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
            'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background-color: #f8fafc;
          color: #1e293b;
          overflow-x: hidden;
        }

        #__next {
          min-height: 100vh;
        }
      `}</style>
      <Component {...pageProps} />
    </>
  );
}
