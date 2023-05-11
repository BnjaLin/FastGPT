import React, { useEffect, useMemo } from 'react';
import { Box, useColorMode, Flex } from '@chakra-ui/react';
import Navbar from './navbar';
import NavbarPhone from './navbarPhone';
import { useRouter } from 'next/router';
import { useScreen } from '@/hooks/useScreen';
import { useLoading } from '@/hooks/useLoading';
import Auth from './auth';
import { useGlobalStore } from '@/store/global';

const pcUnShowLayoutRoute: Record<string, boolean> = {
  '/login': true
};
const phoneUnShowLayoutRoute: Record<string, boolean> = {
  '/login': true
};

const navbarList = [
  {
    label: '介绍',
    icon: 'board',
    link: '/',
    activeLink: ['/']
  },
  {
    label: '共享',
    icon: 'shareMarket',
    link: '/model/share',
    activeLink: ['/model/share']
  },
  {
    label: '模型',
    icon: 'model',
    link: '/model/list',
    activeLink: ['/model/list', '/model/detail']
  },
  {
    label: '账号',
    icon: 'user',
    link: '/number/setting',
    activeLink: ['/number/setting']
  },
  // {
  //   label: '邀请',
  //   icon: 'promotion',
  //   link: '/promotion',
  //   activeLink: ['/promotion']
  // }
  {
    label: '开发',
    icon: 'develop',
    link: '/openapi',
    activeLink: ['/openapi']
  }
];

const Layout = ({ children }: { children: JSX.Element }) => {
  const { isPc } = useScreen();
  const router = useRouter();
  const { colorMode, setColorMode } = useColorMode();
  const { Loading } = useLoading({ defaultLoading: true });
  const { loading } = useGlobalStore();

  const isChatPage = useMemo(
    () => router.pathname === '/chat' && Object.values(router.query).join('').length !== 0,
    [router.pathname, router.query]
  );

  useEffect(() => {
    if (colorMode === 'dark' && router.pathname !== '/chat') {
      setColorMode('light');
    }
  }, [colorMode, router.pathname, setColorMode]);

  return (
    <>
      <Box h={'100%'} bg={'gray.100'}>
        {isPc ? (
          pcUnShowLayoutRoute[router.pathname] ? (
            <Auth>{children}</Auth>
          ) : (
            <>
              <Box h={'100%'} position={'fixed'} left={0} top={0} w={'60px'}>
                <Navbar />
              </Box>
              <Box h={'100%'} ml={'60px'} overflow={'overlay'}>
                <Auth>{children}</Auth>
              </Box>
            </>
          )
        ) : phoneUnShowLayoutRoute[router.pathname] || isChatPage ? (
          <Auth>{children}</Auth>
        ) : (
          <Flex h={'100%'} flexDirection={'column'}>
            <Box flex={'1 0 0'} h={0} overflow={'overlay'}>
              <Auth>{children}</Auth>
            </Box>
            <Box h={'50px'} borderTop={'1px solid rgba(0,0,0,0.1)'}>
              <NavbarPhone />
            </Box>
          </Flex>
        )}
      </Box>
      {loading && <Loading />}
    </>
  );
};

export default Layout;

Layout.getInitialProps = ({ req }: any) => {
  return {
    isPcDevice: !/Mobile/.test(req ? req.headers['user-agent'] : navigator.userAgent)
  };
};
