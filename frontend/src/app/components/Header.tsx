'use client';

import React from 'react';
import NextLink from 'next/link';
import { Box, Flex, HStack, Image, Link, Spacer, Text } from '@chakra-ui/react';

const LOGO_SRC = '/images/logo.png';

export default function Header() {
  return (
    <Box
      as="header"
      w="full"
      bg="whiteAlpha.900"
      backdropFilter="blur(6px)"
      borderBottom="1px solid"
      borderColor="gray.100"
      boxShadow="sm"
      position="sticky"
      top={0}
      zIndex={10}
      px={{ base: 4, md: 8 }}
      py={3}
    >
      <Flex align="center" gap={3}>
        <Link as={NextLink} href="/" display="inline-flex" alignItems="center" gap={2}>
          <Image src={LOGO_SRC} alt="Logo" width="72px" height="36px" objectFit="contain" />
        </Link>
        <Spacer />
        <HStack gap={4} color="gray.700" fontWeight="medium" fontSize="sm">
          <Link as={NextLink} href="/" _hover={{ color: 'pink.500' }}>
            メイン
          </Link>
          <Link as={NextLink} href="/demo" _hover={{ color: 'pink.500' }}>
            デモ
          </Link>
        </HStack>
      </Flex>
    </Box>
  );
}
