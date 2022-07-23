import { graphQuery } from '../utils/apollo';
import React, { useEffect, useRef, useState } from 'react';
import { Spinner, HStack } from '@chakra-ui/react';
import bs58 from 'bs58';
import { gql } from 'apollo-boost';
import GenericInput from './genericInput';
import GenericSelect from './genericSelect';
import { validate } from '../utils/validation';
import { getIPFSPinata } from '../utils/metadata';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';

// TODO:
// calculate proportional of the values introduced

const ConditionSplitting = props => {
  const { name, localForm } = props;
  const [ipfsHash, setIpfsHash] = useState(null);
  const [conditions, setConditions] = useState(null);
  const conditionsFetch = useRef(false);
  const [loadingIpfs, setLoadingIpfs] = useState(false);
  const [conditionData, setConditionData] = useState(null);
  const { injectedChain } = useInjectedProvider();
  const API_ENDPOINTS_CTE = {
    '0x64':
      'https://api.thegraph.com/subgraphs/name/davidalbela/conditional-tokens-xdai',
    '0x1': 'https://api.thegraph.com/subgraphs/name/cag/hg',
    '0x4':
      'https://api.thegraph.com/subgraphs/name/davidalbela/conditional-tokens-rinkeby',
  };
  const openConditionsQuery = gql`
    query ConditionsList(
      $first: Int!
      $skip: Int!
      $oracleIn: [String]
      $resolved: Boolean
      $textToSearch: String
    ) {
      conditions(
        first: $first
        skip: $skip
        where: {
          oracle_in: $oracleIn
          resolved: $resolved
          oracle_contains: $textToSearch
        }
        orderBy: createTimestamp
        orderDirection: desc
      ) {
        conditionId
        questionId
        outcomeSlotCount
        collections {
          id
        }
        positions {
          id
          indexSets
          multiplicities
          lifetimeValue
          activeValue
        }
      }
    }
  `;

  const listOfConditionsIds = () => {
    if (!conditions) return;
    return conditions.map(x => {
      return {
        name: x.conditionId,
        value: x.questionId,
      };
    });
  };

  useEffect(() => {
    if (props.values.payout) {
      // recalculate proportions (or maybe only the sum)
    }
  }, [props]);

  useEffect(() => {
    async function fetchConditionManifesto() {
      try {
        await decodeHash(props.values.questionId);
      } catch (error) {
        console.error(JSON.stringify(error));
      }
    }
    if (props.values.questionId) {
      fetchConditionManifesto();
    }
  }, [props.values.questionId]);

  useEffect(() => {
    async function getConditionsList() {
      console.log(`quering ${API_ENDPOINTS_CTE[injectedChain.chain_id]}`);
      try {
        const data = await graphQuery({
          endpoint: API_ENDPOINTS_CTE[injectedChain.chain_id.toString()],
          query: openConditionsQuery,
          variables: {
            first: 10,
            skip: 0,
            oracleIn: [props.values.selectedSafeAddress],
            resolved: false,
            textToSearch: props.values.selectedSafeAddress,
          },
        });
        if (data.conditions.length) setConditions(data.conditions);
      } catch (err) {
        throw new Error(err);
      }
    }
    if (
      props.values.selectedSafeAddress &&
      !conditions &&
      !conditionsFetch.current
    ) {
      getConditionsList();
      conditionsFetch.current = true;
    }
  }, [props]);

  function bytes32ToIPFSHash(hash_hex) {
    console.log(
      'bytes32ToIPFSHash starts with hash_buffer',
      hash_hex.replace(/^0x/, ''),
    );
    var buf = new Buffer(hash_hex.replace(/^0x/, '1220'), 'hex');
    return bs58.encode(buf);
  }

  const decodeHash = async questionId => {
    setLoadingIpfs(true);
    const IpfsHash = bytes32ToIPFSHash(questionId);
    setIpfsHash(IpfsHash);
    const ipfsContent = await getIPFSPinata({ hash: IpfsHash });
    setConditionData(ipfsContent);
    setLoadingIpfs(false);
    return ipfsHash;
  };

  return (
    <>
      <GenericSelect
        {...props}
        label='Condition ID'
        name='questionId'
        options={listOfConditionsIds()}
      />
      {props.values.conditionOutcomes &&
        parseInt(props.values.conditionOutcomes) && (
          <>
            {Array.from(
              Array(parseInt(props.values.conditionOutcomes)).keys(),
            ).map(x => {
              return (
                <GenericInput
                  {...props}
                  key={x}
                  label={`Name of outcome ${x + 1}`}
                  placeholder={`Something categorical!`}
                  name={`outcomes.${x.toString()}`}
                />
              );
            })}
          </>
        )}
      {ipfsHash && (
        <a
          target='_blank'
          rel='noreferrer noopener'
          href={`https://ipfs.io/ipfs/${ipfsHash}`}
        >
          Condition Manifesto
        </a>
      )}
      {loadingIpfs ? (
        <Spinner />
      ) : (
        <>
          {conditionData?.outcomes?.length ? (
            <>
              <h3>{conditionData.condition}</h3>
              {conditionData.outcomes.map((x, i) => {
                return (
                  <HStack key={i}>
                    <GenericInput
                      {...props}
                      key={x}
                      label={`${x}`}
                      placeholder={`33%`}
                      name={`payout.${i.toString()}`}
                    />
                    <>XXX %</>
                  </HStack>
                );
              })}
            </>
          ) : (
            <>
              {ipfsHash && (
                <>Data not correctly parsed, probably something old</>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default ConditionSplitting;
