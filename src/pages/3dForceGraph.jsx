import React from 'react';
import { Link } from 'react-router-dom';
import { Flex, Box, Button } from '@chakra-ui/react';
import ForceGraph from '../components/forceGraph';
import Layout from '../components/layout';

const TreeGraph = () => {
  return (
    <Layout>
      <Flex align='center' justify='center' w='100%' h='100%'>
        <Flex direction='column' align='center' justify='space-between'>
          <Box
            textTransform='uppercase'
            fontWeight={700}
            fontSize='md'
            fontFamily='heading'
            maxW='350px'
            textAlign='center'
          >
            Planetharium v2
          </Box>
          <ForceGraph />
          <Box
            textTransform='uppercase'
            fontWeight={700}
            fontSize='md'
            fontFamily='heading'
            maxW='350px'
            textAlign='center'
          >
            Allow users to fetch other users/DAOs and get to connections or
            closest links.
            <br />
            Create the nodes and links for DAOs-members, DAOs-DAOs, etc..
            <br />
            Then add minions + vaults
            <br />
            events, (proposals, voting and processing)
            <br />
            a tool to connect visually
            <br />
          </Box>
          <Button
            as={Link}
            to='/'
            textTransform='uppercase'
            w='40%'
            fontWeight={700}
          >
            Start Over
          </Button>
        </Flex>
      </Flex>
    </Layout>
  );
};

export default TreeGraph;
