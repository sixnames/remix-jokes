import * as React from 'react';
import {
  LinksFunction,
  MetaFunction,
  Scripts,
  Links,
  LiveReload,
  Outlet,
  useCatch,
  Meta,
  LoaderFunction,
  useLoaderData,
} from 'remix';
import stylesLink from './styles/tailwind.min.css';
import { NonFlashOfWrongThemeEls, Theme, ThemeProvider, useTheme } from './context/theme-provider';
import { getThemeSession } from './utils/theme.server';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: stylesLink,
    },
  ];
};

export const meta: MetaFunction = () => {
  const description = `Learn Remix and laugh at the same time!`;
  return {
    description,
    keywords: 'Remix,jokes',
    'twitter:image': 'https://remix-jokes.lol/social.png',
    'twitter:card': 'summary_large_image',
    'twitter:creator': '@remix_run',
    'twitter:site': '@remix_run',
    'twitter:title': 'Remix Jokes',
    'twitter:description': description,
  };
};

type LoaderData = {
  theme: Theme | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const themeSession = await getThemeSession(request);

  const data: LoaderData = {
    theme: themeSession.getTheme(),
  };

  return data;
};

interface DocumentInterface {
  title?: string;
}

const Document: React.FC<DocumentInterface> = ({
  children,
  title = `Remix: So great, it's funny!`,
}) => {
  const data = useLoaderData<LoaderData>();
  const [theme] = useTheme();
  return (
    <html lang='en' className={theme ? theme : undefined}>
      <head>
        <meta charSet='utf-8' />
        <Meta />
        <title>{title}</title>
        <Links />
        <NonFlashOfWrongThemeEls ssrTheme={Boolean(data?.theme)} />
      </head>
      <body>
        {children}
        <Scripts />
        {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
      </body>
    </html>
  );
};

export default function App() {
  const data = useLoaderData<LoaderData>();
  return (
    <ThemeProvider specifiedTheme={data?.theme}>
      <Document>
        <Outlet />
      </Document>
    </ThemeProvider>
  );
}

const errorClassName = 'bg-red text-white';

export function CatchBoundary() {
  const caught = useCatch();
  const data = useLoaderData<LoaderData>();
  return (
    <ThemeProvider specifiedTheme={data?.theme}>
      <Document title={`${caught.status} ${caught.statusText}`}>
        <div className={errorClassName}>
          <h1>
            {caught.status} {caught.statusText}
          </h1>
        </div>
      </Document>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  const data = useLoaderData<LoaderData>();

  return (
    <ThemeProvider specifiedTheme={data?.theme}>
      <Document title='Uh-oh!'>
        <div className={errorClassName}>
          <h1>App Error</h1>
          <pre>{error.message}</pre>
        </div>
      </Document>
    </ThemeProvider>
  );
}
