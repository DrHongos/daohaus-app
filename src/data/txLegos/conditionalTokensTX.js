import { buildMultiTxAction } from '../../utils/legos';
import { CONTRACTS } from '../contracts';
import { DETAILS } from '../details';

// TODO
//questionId (now hardcoded and possibly giving troubles for overriding conditionIds)
// what about DAOHAUS and IPFS?
// there's a util with a pinning ;)
// ipfsJsonPin in './metadata'
//this needs to be calculated (and saves up the rest of the data)
// test this https://ethereum.stackexchange.com/questions/23058/how-to-convert-string-to-bytes32-in-web3js

export const CONDITIONAL_TOKENS_TX = {
  CREATE_CONDITION: buildMultiTxAction({
    actions: [
      {
        targetContract: '.contextData.chainConfig.conditional_tokens_addr',
        abi: CONTRACTS.CONDITIONAL_TOKENS,
        fnName: 'prepareCondition',
        args: [
          '.values.oracle',
          '0x3168af70a7b82d713173900140104e7c428c6826fd90e99cc071d858ac73357d', //"questionId"
          '.values.conditionResults',
        ],
      },
    ],
    detailsToJson: DETAILS.CONDITIONAL,
  }),
  // TODO
  // validate array (present in a visual way: https://cte.gnosis.ioc)
  // validate conditionId?
  CREATE_POSITION: buildMultiTxAction({
    actions: [
      {
        targetContract: '.contextData.chainConfig.conditional_tokens_addr',
        abi: CONTRACTS.CONDITIONAL_TOKENS,
        fnName: 'splitPosition',
        args: [
          '.values.minionToken',
          '0x0000000000000000000000000000000000000000000000000000000000000000',
          '.values.conditionId',
          {
            type: 'toArray',
            gatherArgs: ['.values.distribution'],
          },
          '.values.minionPayment',
        ],
      },
    ],
    detailsToJson: DETAILS.CONDITIONAL,
  }),
};
