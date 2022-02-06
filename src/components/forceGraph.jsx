import React, { useState, useEffect, useRef } from 'react';
import ForceGraph3D from '3d-force-graph';
import * as THREE from 'three';
import makeBlockie from 'ethereum-blockies-base64';
import { useUser } from '../contexts/UserContext';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import { bigGraphQuery } from '../utils/theGraph';
import { themeImagePath } from '../utils/metadata';

const ForceGraph = () => {
  // All this should come from the parent. where also the selection/filter hap.
  const { userHubDaos, apiData } = useUser();
  const { address } = useInjectedProvider();
  // const [loading, setLoading] = useState(false);
  const [type, setType] = useState('user');
  const [chainFilter, setChainFilter] = useState('xdai');
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  // add more daos and see member interactions (RG + RGs0 + RGs1 + ..)
  const [daoSelected, setDaoSelected] = useState();
  const [daoData, setDaoData] = useState();
  const [cumMembers, setCumMembers] = useState();
  const [loadingDao, setLoadingDao] = useState(false);
  const [dataToGraph, setDataToGraph] = useState();

  const [selectedNode, setSelectedNode] = useState();
  const [selectorReady, setSelectorReady] = useState(true);

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

  const filteredDaos = chain => {
    const filteredChainDAOs = Object.values(apiData).filter(x => {
      return x[0].network === chainFilter;
    });
    // console.log('daos', filteredChainDAOs);
    return filteredChainDAOs;
  };

  useEffect(() => {
    if (cumMembers) {
      if (dataToGraph) {
        const cum = dataToGraph.concat(cumMembers);
        setDataToGraph(cum);
      } else {
        setDataToGraph(cumMembers);
      }
    }
  }, [cumMembers]);

  function createGraphObjects(data) {
    // console.log('createGraphObjects enters', data);
    let list;
    let linksList;
    const userNode = {
      id: address,
      size: '2',
      group: 1,
    };
    if (type === 'user') {
      list = data
        .map(x => {
          return x.data.map(y => {
            return {
              id: y.meta.name.concat(` (${x.apiMatch})`),
              group: 2,
              size: '10',
              network: x.name,
              graphEndpoint: x.endpoint,
            };
          });
        })
        .flat();
      linksList = list.map(x => {
        return {
          source: userNode.id,
          target: x.id,
          value: 1,
        };
      });
      list.push(userNode);
    } else if (type === 'DAOs') {
      list = data
        .map(x => {
          return {
            id: x[0].name.concat(` (${x[0].network})`),
            address: x[0].contractAddress,
            group: 2,
          };
        })
        .flat();
      // check if address has links..
      // list.push(userNode);
      // linksList = list.map(x => {
      //   return {
      //     source: userNode.id,
      //     target: x.id,
      //     value: 1,
      //   };
      // });
      linksList = [];
    } else if (type === 'DAO') {
      list = data
        .map(x => {
          return {
            id: x.memberAddress,
            group: 3,
            size: 2,
            shares: x.shares,
            loot: x.loot,
          };
        })
        .flat();
      // list.push(userNode);
      linksList = list.map(x => {
        return {
          source: daoSelected.contractAddress,
          target: x.id,
          value: 1,
        };
      });
      list.push({
        id: daoSelected.contractAddress, // convert to name?
        name: daoSelected.name,
        image: daoSelected.avatarImg,
        group: 0,
        size: 10,
      });
    } else if (type === 'RG') {
      list = data
        .map(x => {
          return {
            id: x.memberAddress,
            group: 3,
            size: 2,
            shares: x.shares,
            loot: x.loot,
          };
        })
        .flat();

      for (const dao in daoData) {
        // console.log(daoData[dao]);
        list.push({
          id: daoData[dao].contractAddress, // convert to name?
          name: daoData[dao].name,
          image: daoData[dao].avatarImg,
          group: 0,
          size: 10,
        });
      }
      linksList = data.map(x => {
        const splitted = x.id.split('-member-');
        const dao = splitted[0];
        const member = splitted[1];
        return {
          source: dao,
          target: member,
          value: 1,
        };
      });
    }
    return [list, linksList];
  }
  function focusNode(graph, node) {
    const distance = 150;
    if (node.x && node.y && node.z) {
      const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
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
    }
  }

  /* eslint-disable global-require */
  async function create3dGraph() {
    const spaceHolder = document.getElementById('3d-graph');
    if (dataToGraph) {
      const [nodes, links] = createGraphObjects(dataToGraph);
      const gData = { nodes, links };
      setNodes(nodes);
      setLinks(links);
      const graph = ForceGraph3D()(spaceHolder)
        .backgroundColor('#0c002e')
        .nodeLabel('id')
        // .nodeAutoColorBy('group')
        .nodeThreeObject((node: Node) => {
          let imageUrl;
          if (node && node.image) {
            imageUrl = themeImagePath(node.image);
          } else if (node && node.group === 2) {
            imageUrl = require(`../assets/img/dao.png`);
          } else {
            imageUrl = makeBlockie(node.id);
            // require(`../assets/img/user.png`);
          }
          const imgTexture = new THREE.TextureLoader().load(imageUrl);
          const material = new THREE.SpriteMaterial({
            map: imgTexture,
            color: 0xffffff,
          });
          const sprite = new THREE.Sprite(material);
          if (node.group === 0) {
            sprite.scale.set(60, 60, 1);
          } else {
            sprite.scale.set(8, 8, 1);
          }

          return sprite;
        })
        .onNodeClick(node => {
          focusNode(graph, node);
        })
        .nodeRelSize(node => (node.size ? node.size : 4))
        .graphData(gData);

      return graph;
    }
  }

  useEffect(() => {
    async function makeQuery(query) {
      await bigGraphQuery(query);
    }

    if (address) {
      let data;

      if (type === 'user') {
        if (userHubDaos.some(network => network.data.length)) {
          data = userHubDaos.filter(x => {
            return x.data.length > 0;
          });
        }
      } else if (type === 'DAOs') {
        if (apiData) {
          let listToDisplay;
          if (chainFilter && chainFilter !== 'all') {
            data = filteredDaos(chainFilter);
          } else {
            data = Object.values(apiData);
          }
          // const listShortened = listToDisplay.slice(0, 300);
        }
      } else if (type === 'DAO' && daoSelected) {
        setLoadingDao(true);
        // console.log('fetching ', daoSelected.contractAddress);
        // what about many DAO's?
        const bigQueryOptions = {
          args: {
            daoID: daoSelected.contractAddress.toLowerCase(),
            chainID: getChainId(chainFilter),
          },
          getSetters: [{ getter: 'getMembers', setter: setDataToGraph }],
        };
        data = makeQuery(bigQueryOptions);
        setLoadingDao(false);
        return;
      } else if (type === 'RG') {
        // follow RG History through all seasons!
        const daosList = {
          rg: '0xfe1084bc16427e5eb7f13fc19bcd4e641f7d571f', // RG
          s0: '0x515e6d357374a532ead74adbcda02bf6b3c083a9', // RG S0
          s1: '0x10e31c10fb4912bc408ce6c585074bd8693f2158', // RG S1
          s2: '0xd83ac7d30495e1e1d2f42a0d796a058089719a45', // RG S2
          s3: '0x7bde8f8a3d59b42d0d8fab3a46e9f42e8e3c2de8', // RG S3
        };
        // last promise to resolve will prevail..
        const totalPromises = [];
        const totalDaos = [];
        for (const dao in daosList) {
          // console.log(`fetching ${dao}: ${daosList[dao]}`);
          const newDao = Object.values(apiData).find(x => {
            return x[0].contractAddress.toLowerCase() === daosList[dao];
          });
          // console.log('found:', newDao[0]);
          totalDaos.push(newDao[0]); // ...daoSelected,
          const bigQueryOptions = {
            args: {
              daoID: daosList[dao].toLowerCase(),
              chainID: '0x64', // xdai
            },
            getSetters: [
              {
                getter: 'getMembers',
                setter: setCumMembers, // set pther place and call useeffect
              },
            ],
          };
          totalPromises.push(makeQuery(bigQueryOptions));
        }
        Promise.all(totalPromises).then(() => {
          // still not aggregation of members occurs.. find the way!
          setDaoData(totalDaos);
        });
        return;
      } else {
        data = [];
      }
      setDataToGraph(data);
    }
  }, [address, type, chainFilter, daoSelected]);

  const graph = useRef(null);
  useEffect(async () => {
    if (nodes && links) {
      graph.current = await create3dGraph();
    }
  }, []);

  const handleSearch = search => {
    if (search.target.value.length >= 3) {
      const dataRendered = graph.current.graphData();
      if (dataRendered.nodes.length) {
        const results = dataRendered.nodes.filter(node =>
          node.id.toLowerCase().startsWith(search.target.value.toLowerCase()),
        );
        if (results.length === 1) {
          // console.log('found!', results[0]);
          focusNode(graph.current, results[0]);
        } else {
          console.log('Search undefined or multiple:', results);
        }
      }
    }
  };

  return (
    <>
      {loadingDao ? (
        <div>Loading..</div>
      ) : (
        <div style={{ margin: 'auto' }}>
          <select
            name='select'
            defaultValue='user'
            style={{
              color: 'white',
              backgroundColor: 'transparent',
              marginLeft: '25%',
            }}
            onChange={e => {
              setType(e.target.value);
              setDaoSelected();
              setDaoData();
            }}
          >
            <option value='null'>null</option>
            <option value='user'>User</option>
            <option value='DAOs'>DAOs</option>
            <option value='DAO'>DAO</option>
            <option value='RG'>RG History</option>
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
          {type === 'DAO' && (
            <>
              <select
                name='select chain'
                defaultValue='xdai'
                style={{ color: 'white', backgroundColor: 'transparent' }}
                onChange={e => {
                  setChainFilter(e.target.value);
                }}
              >
                <option value='matic'>matic</option>
                <option value='arbitrum'>arbitrum</option>
                <option value='mainnet'>mainnet</option>
                <option value='rinkeby'>rinkeby</option>
                <option value='kovan'>kovan</option>
                <option value='xdai'>xdai</option>
              </select>
              <select
                name='Select DAO'
                defaultValue='test'
                style={{ color: 'white', backgroundColor: 'transparent' }}
                onChange={e => {
                  // console.log('setting', e.target.value);
                  const obj = Object.values(apiData).find(x => {
                    return (
                      x[0].contractAddress.toLowerCase() === e.target.value
                    );
                  });
                  // console.log('obj', obj[0]);
                  setDaoSelected(obj[0]);
                }}
              >
                {filteredDaos(chainFilter).map(x => {
                  return (
                    <option
                      key={x[0].contractAddress}
                      value={x[0].contractAddress}
                      placeholder='Select a DAO'
                    >
                      {x[0].name}
                    </option>
                  );
                })}
              </select>
            </>
          )}
          <br />
          <input
            placeholder='Search'
            style={{
              color: 'white',
              backgroundColor: 'transparent',
              marginLeft: '25%',
              border: '1px solid white',
              padding: '6px',
            }}
            onChange={handleSearch}
            disabled={nodes?.length === 0}
          />
          <button
            style={{
              margin: '16px',
              border: '1px solid white',
              padding: '6px',
            }}
            type='submit'
            onClick={() => create3dGraph()}
          >
            {loadingDao ? 'Loading' : 'Regenerate'}
          </button>
          <div id='3d-graph' style={{ width: '70%', height: '30%' }} />
        </div>
      )}
    </>
  );
};

export default ForceGraph;
