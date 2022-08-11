import { graphQuery } from '../utils/apollo';
import React, { useEffect, useState } from 'react';
import { getIPFSPinata } from '../utils/metadata';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
import bs58 from 'bs58';
import { gql } from 'apollo-boost';

function getCollectionSum(coll) {
  let collSum = 0;
  if (coll.length) {
    collSum = coll.reduce((p, a) => p + parseInt(a['id'].split('out_')[1]), 0);
  }
  return collSum;
}
async function getIndexSets(max) {
  const results = [];
  for (let i = 0; i < max; i++) {
    const collChildren = document.getElementById(`coll_${i}`);
    const arr = [...collChildren.children];
    const totalColl = getCollectionSum(arr);
    if (totalColl > 0) {
      results.push(totalColl);
    }
  }
  return results;
}

const CollectionSplitting = props => {
  const { localForm } = props;
  const [conditionData, setConditionData] = useState(null);
  const [conditionMeta, setConditionMeta] = useState(null);
  const { setValue } = localForm;
  const { injectedChain } = useInjectedProvider();

  // TODO: add a loading state
  // TODO: starts with 'distribution' undefined , FIX IT

  const API_ENDPOINTS_CTE = {
    '0x64':
      'https://api.thegraph.com/subgraphs/name/davidalbela/conditional-tokens-xdai',
    '0x1': 'https://api.thegraph.com/subgraphs/name/cag/hg',
    '0x4':
      'https://api.thegraph.com/subgraphs/name/davidalbela/conditional-tokens-rinkeby',
  };
  const GetConditionQuery = gql`
    query GetCondition($id: ID!) {
      condition(id: $id) {
        conditionId
        questionId
        outcomeSlotCount
      }
    }
  `;
  // can also contain collections and positions
  const decodeHash = async questionId => {
    const IpfsHash = bytes32ToIPFSHash(questionId);
    const ipfsContent = await getIPFSPinata({ hash: IpfsHash });
    setConditionData(ipfsContent);
  };
  function bytes32ToIPFSHash(hash_hex) {
    var buf = new Buffer(hash_hex.replace(/^0x/, '1220'), 'hex');
    return bs58.encode(buf);
  }
  /* shouldComponentUpdate(nextProps) {
    if (nextProps.value !== this.props.value) {
       return true;
    } else {
       return false;
    }
  }; */

  useEffect(async () => {
    if (!conditionMeta && props.values.conditionId) {
      const data = await graphQuery({
        endpoint: API_ENDPOINTS_CTE[injectedChain.chain_id.toString()],
        query: GetConditionQuery,
        variables: {
          id: props.values.conditionId,
        },
      });
      if (data.condition) {
        setConditionMeta(data.condition);
      }
    }
  }, [props]);

  useEffect(() => {
    async function fetchConditionManifesto() {
      try {
        await decodeHash(conditionMeta.questionId);
      } catch (error) {
        console.error(JSON.stringify(error));
      }
    }
    if (conditionMeta?.questionId) {
      fetchConditionManifesto();
    }
  }, [conditionMeta]);
  function setResults(results) {
    console.log(`results ${results}`);
    const arrayMod = results.map(x => x.toString());
    setValue('distribution', arrayMod);
  }
  // here were the components
  return (
    <>
      {conditionData?.condition && <>{conditionData.condition}</>}
      {conditionMeta?.outcomeSlotCount && conditionData?.outcomes && (
        <>
          {Array.from(
            Array(parseInt(conditionMeta.outcomeSlotCount)).keys(),
          ).map((x, i) => {
            return (
              <Collection
                draggable={false}
                key={i}
                className={'collection'}
                id={`coll_${i}`}
                outcomeSlotCount={conditionMeta.outcomeSlotCount}
                setResults={setResults}
              >
                <Outcome draggable={true} id={`out_${2 ** i}`}>
                  {conditionData.outcomes[i]}
                </Outcome>
              </Collection>
            );
          })}
        </>
      )}
    </>
  );
};

const Collection = props => {
  const drop = e => {
    e.preventDefault();
    const outcome_id = parseInt(e.dataTransfer.getData('outcome_id'));
    const newG = document.getElementById(props.id);
    const indexSet = getCollectionSum([...newG.children]);
    const presum = outcome_id + indexSet;
    const totalChoices = 2 ** parseInt(props.outcomeSlotCount) - 1;
    if (presum < totalChoices) {
      const outcome = document.getElementById(`out_${outcome_id}`);
      updateUI(e, outcome);
      getIndexSets(props.outcomeSlotCount).then(d => props.setResults(d));
      // how can i set the state + modify the DOM as it is?
    }
  };
  async function updateUI(e, child) {
    e.target.appendChild(child);
  }
  const dragOver = e => {
    e.preventDefault();
  };
  return (
    <div
      id={props.id}
      className={props.className}
      onDrop={drop}
      onDragOver={dragOver}
      style={{
        padding: '40px',
        border: '1px solid white',
      }}
    >
      {props.children}
    </div>
  );
};

const Outcome = props => {
  const dragStart = e => {
    const target = e.target;
    const outVal = target.id.split('out_')[1];
    const outCol = target.parentNode.id.split('coll_')[1];
    e.dataTransfer.setData('outcome_id', outVal);
    e.dataTransfer.setData('collection_id', outCol);
  };
  const dragOver = e => {
    e.stopPropagation();
  };
  return (
    <div
      id={props.id}
      className={props.className}
      draggable={props.draggable}
      onDragStart={dragStart}
      onDragOver={dragOver}
    >
      {props.children}
    </div>
  );
};

export default CollectionSplitting;
