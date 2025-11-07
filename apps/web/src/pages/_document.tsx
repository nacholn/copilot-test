/**
 * Next.js Document Component
 * 
 * Custom document to augment the application's <html> and <body> tags
 * Includes PWA meta tags and accessibility features
 */

import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="application-name" content="Cycling Network Platform" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CyclingNet" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="description" content="The best cycling network application" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
