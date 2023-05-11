import React, { useEffect } from 'react';
import { Card, Box, Link } from '@chakra-ui/react';
import Markdown from '@/components/Markdown';
import { useMarkdown } from '@/hooks/useMarkdown';
import { useRouter } from 'next/router';

const Home = () => {
  const { inviterId } = useRouter().query as { inviterId: string };
  const { data } = useMarkdown({ url: '/intro.md' });

  useEffect(() => {
    if (inviterId) {
      localStorage.setItem('inviterId', inviterId);
    }
  }, [inviterId]);

  return (
    <Box p={[5, 10]}>
      <Card p={5} lineHeight={2}>
        <Markdown source={data} isChatting={false} />
      </Card>

      <Card p={5} mt={4} textAlign={'center'}>
        <Box>
          {/* <Link href="https://asano.com.cn/" target="_blank">
            朝野科技官网
          </Link> */}
        </Box>
        <Box>由 朝野技术部 提供技术支持</Box>
      </Card>
    </Box>
  );
};

export default Home;
