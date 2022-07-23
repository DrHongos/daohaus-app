import { buildMultiTxAction } from '../../utils/legos';
import { CONTRACTS } from '../contracts';
import { DETAILS } from '../details';

// TODO
// pre calculate conditionId
/*const conditionId = web3.utils.soliditySha3(
  {
    t: 'address',
    v: '.values.oracle',
  },
  {
    t: 'bytes32',
    v: pinataData.hash, //?
  },
  {
    t: 'uint',
    v: '.values.responses',
  },
);
console.log(`conditionId ${conditionId}`); */

export const CONDITIONAL_TOKENS_TX = {
  CREATE_CONDITION: buildMultiTxAction({
    actions: [
      {
        targetContract: '.contextData.chainConfig.conditional_tokens_addr',
        abi: CONTRACTS.CONDITIONAL_TOKENS,
        fnName: 'prepareCondition',
        logTx: true,
        args: [
          '.values.oracle',
          '.values.questionId',
          '.values.conditionOutcomes',
        ],
      },
    ],
    detailsToJson: DETAILS.CONDITIONAL,
  }),
  CREATE_POSITION: buildMultiTxAction({
    actions: [
      {
        targetContract: '.values.minionToken',
        abi: CONTRACTS.ERC_20,
        fnName: 'approve',
        args: [
          '.contextData.chainConfig.conditional_tokens_addr',
          '.values.minionPayment',
        ],
      },
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
  TRANSFER_CONDITIONAL: buildMultiTxAction({
    actions: [
      {
        targetContract: '.contextData.chainConfig.conditional_tokens_addr',
        abi: CONTRACTS.CONDITIONAL_TOKENS,
        fnName: 'safeBatchTransferFrom',
        args: [
          '.values.selectedSafeAddress',
          '.values.beneficiary',
          {
            type: 'toArray',
            gatherArgs: ['.values.tokenIds'],
          },
          {
            type: 'toArray',
            gatherArgs: ['.values.amounts'],
          },
          '0x',
        ],
      },
    ],
    detailsToJson: DETAILS.CONDITIONAL,
  }),
  // oh oh! we DONT have burning capabilitiesss
  BURN_CONDITIONALS: buildMultiTxAction({
    actions: [
      {
        targetContract: '.contextData.chainConfig.conditional_tokens_addr',
        abi: CONTRACTS.CONDITIONAL_TOKENS,
        fnName: 'safeBatchTransferFrom',
        args: [
          '.values.selectedSafeAddress',
          '.values.beneficiary',
          {
            type: 'toArray',
            gatherArgs: ['.values.tokenIds'],
          },
          {
            type: 'toArray',
            gatherArgs: ['.values.amounts'],
          },
          '0x',
        ],
      },
    ],
    detailsToJson: DETAILS.CONDITIONAL,
  }),
  SPLIT_POSITION: buildMultiTxAction({
    actions: [
      {
        targetContract: '.contextData.chainConfig.conditional_tokens_addr',
        abi: CONTRACTS.CONDITIONAL_TOKENS,
        fnName: 'splitPosition',
        args: [
          '.values.minionToken',
          '.values.parentCollectionId',
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
  SPLIT_POSITION_DEEP: buildMultiTxAction({
    actions: [
      {
        targetContract: '.contextData.chainConfig.conditional_tokens_addr',
        abi: CONTRACTS.CONDITIONAL_TOKENS,
        fnName: 'splitPosition',
        args: [
          '.values.collateralAddress',
          '.values.parentCollectionId',
          '.values.conditionId',
          {
            type: 'toArray',
            gatherArgs: ['.values.distribution'],
          },
          '.values.amountToSplit',
        ],
      },
    ],
    detailsToJson: DETAILS.CONDITIONAL,
  }),
  REPORT_PAYOUTS: buildMultiTxAction({
    actions: [
      {
        targetContract: '.contextData.chainConfig.conditional_tokens_addr',
        abi: CONTRACTS.CONDITIONAL_TOKENS,
        fnName: 'reportPayouts',
        logTx: true,
        args: ['.values.questionId', '.values.payout'],
      },
    ],
    detailsToJson: DETAILS.CONDITIONAL,
  }),
};
