import React, { useState, useEffect, useRef } from 'react';
import ForceGraph3D from '3d-force-graph';
// import { DaoFloatingProvider } from '../contexts/DaoFloatingContext';
import { useUser } from '../contexts/UserContext';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';

const ForceGraph = () => {
  // All this should come from the parent. where also the selection/filter hap.
  const { userHubDaos, apiData } = useUser();
  const { address } = useInjectedProvider();
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('user');
  const [chainFilter, setChainFilter] = useState('xdai');
  const [links, setLinks] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState();
  const gData = { nodes, links };
  // apiData is of 0x7424b0b43870e18085E3aDd3FaeB67ce1CeE6Deb
  // delete chainGroup and handle from supportedChains from '/utils/chains.js'
  const chainGroup = [
    { chainId: '0x89', network_id: 137, apiMatch: 'matic', group: 2 },
    { chainId: '0xa4b1', network_id: 42161, apiMatch: 'arbitrum', group: 3 },
    { chainId: '0x1', network_id: 1, apiMatch: 'mainnet', group: 4 },
    { chainId: '0x4', network_id: 4, apiMatch: 'rinkeby', group: 5 },
    { chainId: '0xa4ec', network_id: 42220, apiMatch: 'celo', group: 6 },
    { chainId: '0x2a', network_id: 42, apiMatch: 'kovan', group: 7 },
    { chainId: '0x64', network_id: 100, apiMatch: 'xdai', group: 8 },
  ];
  const getChainId = apiMatchSelected => {
    const chainSpecific = chainGroup.find(x => x.apiMatch === apiMatchSelected);
    if (chainSpecific) {
      return chainSpecific.chainId;
    }
    return 'error';
  };
  const getGroup = networkId => {
    const chainSpecific = chainGroup.find(x => x.apiMatch === networkId);
    if (chainSpecific) {
      return chainSpecific.group;
    }
    return 9;
  };

  useEffect(() => {
    // retrieve and filter in here.
    // convert to objects in create3dGraph
    if (address) {
      let nodes;
      let links;

      const userNode = {
        id: address,
        size: '2',
        group: 1,
      };
      const accumulator = [userNode];

      if (type === 'user') {
        if (userHubDaos.some(network => network.data.length)) {
          const networksUsed = userHubDaos.filter(x => {
            return x.data.length > 0;
          });
          // for each network with values
          const list = networksUsed.map(x => {
            // get each DAO object
            return x.data.map(y => {
              return {
                id: y.meta.name.concat(` (${x.apiMatch})`),
                group: getGroup(x.apiMatch),
                size: '10',
                network: x.name,
                graphEndpoint: x.endpoint,
              };
            });
          });

          // const list = networksUsed.map(x => {
          //   return x.data.map(y => {
          //     return y;
          //   });
          // });
          if (list) {
            // list comes nested on each network
            const flatten = list.flat();
            // console.log('list', flatten);
            // links hardcoded to the user (this are its DAOs)
            nodes = accumulator.concat(flatten);
            links = flatten.map(x => {
              return {
                source: userNode.id,
                target: x.id,
                value: 1,
              };
            });
          }
        }
      } else if (type === 'DAOs') {
        if (apiData) {
          let listToDisplay;
          const listArray = Object.values(apiData);
          if (chainFilter && chainFilter !== 'all') {
            const filteredChainDAOs = listArray.filter(x => {
              return x[0].network === chainFilter;
            });
            listToDisplay = filteredChainDAOs;
          } else {
            listToDisplay = listArray;
          }
          // const listShortened = listToDisplay.slice(0, 300);
          console.log(
            'Showing ',
            listToDisplay.length,
            ' DAOs in ',
            chainFilter,
            ' network',
          );
          const list = listToDisplay.map(x => {
            return {
              id: x[0].name.concat(` (${x[0].network})`),
              address: x[0].contractAddress,
              group: getGroup(x[0].network),
            };
          });
          if (list) {
            const flatten = list.flat();
            links = flatten.map(x => {
              return {
                source: userNode.id,
                target: x.id,
                value: 1,
              };
            });
            nodes = accumulator.concat(flatten);
          }
          links = [];
          // links could be alliances or the user relations
        }
      } else {
        nodes = [];
        links = [];
      }
      if (nodes) {
        setNodes(nodes);
      }
      if (links) {
        setLinks(links);
      }
    }
  }, [address, type, chainFilter]);

  function focusNode(graph, node) {
    const distance = 40;
    if (node.x && node.y && node.z) {
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
      // console.log('going places', node.x, node.y, node.z);
      graph.cameraPosition(
        {
          x: node.x * distRatio,
          y: node.y * distRatio,
          z: node.z * distRatio,
        },
        node,
        3000,
      );
      setSelectedNode(node);
      console.log(
        'to get data of ',
        node.address,
        ' on chain',
        getChainId(chainFilter),
      );
    }
  }

  async function create3dGraph() {
    setLoading(true);
    const spaceHolder = document.getElementById('3d-graph');
    const graph = ForceGraph3D()(spaceHolder)
      .backgroundColor('#0c002e')
      .nodeLabel('id')
      .nodeRelSize(10)
      .nodeAutoColorBy('group')
      .onNodeClick(node => {
        focusNode(graph, node);
      })
      .graphData(gData);

    setLoading(false);
    return graph;
  }

  const graph = useRef(null);
  useEffect(async () => {
    if (nodes && links) {
      // maybe here create the objects
      graph.current = await create3dGraph();
    }
  }, []);

  const handleSearch = search => {
    if (search.target.value.length >= 3) {
      console.log('searching: ', search);
      const dataRendered = graph.current.graphData();
      if (dataRendered.nodes.length) {
        const results = dataRendered.nodes.filter(node =>
          node.id.startsWith(search.target.value),
        );
        if (results.length === 1) {
          console.log('found!', results[0]);
          focusNode(graph.current, results[0]);
        } else {
          console.log('Search undefined or multiple:', results);
        }
      }
    }
  };

  return (
    <>
      {loading ? (
        <div>Loading..</div>
      ) : (
        <div style={{ margin: 'auto' }}>
          <select
            name='select'
            defaultValue='user'
            style={{
              color: 'white',
              backgroundColor: 'transparent',
              marginLeft: '30%',
            }}
            onChange={e => {
              setType(e.target.value);
            }}
          >
            <option value='null'>null</option>
            <option value='user'>User</option>
            <option value='DAOs'>DAOs</option>
          </select>
          {type === 'DAOs' && (
            <>
              <select
                name='select chain'
                defaultValue='xdai'
                style={{ color: 'white', backgroundColor: 'transparent' }}
                onChange={e => {
                  setChainFilter(e.target.value);
                }}
              >
                <option value='all'>all</option>
                <option value='matic'>matic</option>
                <option value='arbitrum'>arbitrum</option>
                <option value='mainnet'>mainnet</option>
                <option value='rinkeby'>rinkeby</option>
                <option value='kovan'>kovan</option>
                <option value='xdai'>xdai</option>
              </select>
            </>
          )}
          <input
            placeholder='Search'
            style={{ color: 'white', backgroundColor: 'transparent' }}
            onChange={handleSearch}
          />
          <button
            style={{ margin: '16px' }}
            type='submit'
            onClick={() => create3dGraph()}
          >
            Regenerate.
          </button>
          <div id='3d-graph' style={{ width: '70%', height: '30%' }} />
        </div>
      )}
    </>
  );
};

export default ForceGraph;
