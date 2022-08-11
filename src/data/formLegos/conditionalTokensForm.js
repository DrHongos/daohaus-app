import { MINION_TYPES, PROPOSAL_TYPES } from '../../utils/proposalUtils';
import { FIELD } from '../fields';
import { TX } from '../txLegos/contractTX';

export const CONDITIONAL_TOKENS_FORMS = {
  CREATE_CONDITION: {
    id: 'CREATE_CONDITION',
    title: 'Create a condition token',
    description:
      'Creates a conditional token with a number of results and an oracle',
    type: PROPOSAL_TYPES.CREATE_CONDITION,
    minionType: MINION_TYPES.SAFE,
    dev: true,
    logValues: true,
    tx: TX.CREATE_CONDITION,
    required: ['questionId', 'selectedMinion'],
    fields: [
      [
        FIELD.TITLE,
        FIELD.DESCRIPTION,
        FIELD.MINION_SELECT,
        {
          ...FIELD.DATE_RANGE,
          info: 'This limits are just informative',
          label: 'Estimated date for definition',
          name: 'estimatedDefinition',
        },
      ],
      [
        {
          type: 'input',
          label: 'Possible Outcomes',
          info:
            'Possible amount of outcomes, should represent ALL possible results',
          name: 'conditionOutcomes',
          htmlFor: 'conditionOutcomes',
          placeholder: '2',
          expectType: 'number',
        },
        {
          type: 'conditionDefinitionForm',
          name: 'questionId',
          label: 'Condition Manifesto',
          htmlFor: 'questionId',
          expectType: 'any',
        },
      ],
    ],
  },
  CREATE_DISTRIBUTION_CTS: {
    id: 'CREATE_DISTRIBUTION_CTS',
    title: 'Fund and create a distribution of conditional tokens',
    description: 'Approves collateral & initializes a distribution contract',
    type: PROPOSAL_TYPES.CREATE_DISTRIBUTION_CTS,
    minionType: MINION_TYPES.SAFE,
    dev: true,
    logValues: true,
    tx: TX.CREATE_DISTRIBUTION_CTS,
    required: [
      'selectedMinion',
      'conditionId',
      'distribution',
      'distributionAddress',
    ],
    fields: [
      [
        FIELD.TITLE,
        FIELD.MINION_SELECT,
        { ...FIELD.MINION_PAYMENT, label: 'Funds to split' },
      ],
      [
        {
          type: 'input',
          label: 'Distributor address',
          name: 'distributionAddress',
          info:
            'Currently must be done externally and only for shallow collections',
          htmlFor: 'distributionAddress',
          placeholder: 'distributionAddress',
          expectType: 'address', // could check if in factory
        },
        {
          type: 'dateSelect',
          label: 'TIMELIMIT',
          info:
            'Time where positioning is stopped, can be cancelled with value = 0',
          name: 'timeout',
          htmlFor: 'timeout',
          placeholder: 'timeout',
          expectType: 'any', // should check is not resolved
        },
        {
          type: 'input',
          label: 'Condition ID',
          info: 'Condition created by prepareCondition',
          name: 'conditionId',
          htmlFor: 'conditionId',
          placeholder: 'conditionId',
          expectType: 'any', // should check is not resolved
        },
        {
          type: 'collectionSplitting',
          label: 'Distribution',
          info: 'Disjoint groups to create collections',
          name: 'distribution',
          htmlFor: 'distribution',
          expectType: 'any',
        },
      ],
    ],
  },
  // TODO
  // validate conditionId?
  // getOutcomeSlotCount(bytes32 conditionId)returns (uint)
  // validate array (present in a visual way: https://cte.gnosis.ioc)
  // change it to CREATE_POSITION (from collateral) and later SPLIT for deeper ct's
  SPLIT_POSITION: {
    id: 'SPLIT_POSITION',
    title: 'Fund and mint conditional tokens',
    description:
      'Approves collateral & Mints the conditional tokens backed up by collateral',
    type: PROPOSAL_TYPES.SPLIT_POSITION,
    minionType: MINION_TYPES.SAFE,
    dev: true,
    logValues: true,
    tx: TX.CREATE_POSITION,
    required: [
      'selectedMinion',
      'conditionId',
      'distribution',
      'distributionFunds',
      'token_name',
    ],
    fields: [
      [
        [
          FIELD.TITLE,
          FIELD.MINION_SELECT,
          { ...FIELD.MINION_PAYMENT, label: 'Funds to split' },
        ],
        {
          type: 'input',
          label: 'Condition ID',
          name: 'conditionId',
          htmlFor: 'conditionId',
          placeholder: 'conditionId',
          expectType: 'any', // should check (?)
        },
        {
          type: 'input',
          label: 'Distribution',
          info:
            'Comma separated values representing bit arrays of possible results',
          name: 'distribution',
          htmlFor: 'distribution',
          placeholder: 'comma separated responses index as in bit array',
          expectType: 'any', // check for arrays
          modifiers: ['convertToArray'],
        },
      ],
    ],
  },
  SPLIT_POSITION_DEEP: {
    id: 'SPLIT_POSITION_DEEP',
    title: 'Split conditional tokens into other positions',
    description:
      'Mints conditional tokens backed up by other valid conditionals',
    type: PROPOSAL_TYPES.SPLIT_POSITION_DEEP,
    minionType: MINION_TYPES.SAFE,
    dev: true,
    logValues: true,
    tx: TX.SPLIT_POSITION_DEEP,
    required: ['parentCollectionId', 'conditionId', 'distribution'],
    fields: [
      [FIELD.TITLE, FIELD.DESCRIPTION, FIELD.MINION_SELECT],
      [
        {
          type: 'input',
          label: 'Collateral Address',
          name: 'collateralAddress',
          htmlFor: 'collateralAddress',
          placeholder: '0x',
          expectType: 'address', // should check (?)
        },
        {
          type: 'input',
          label: 'Amount of tokens to split',
          name: 'amountToSplit',
          htmlFor: 'amountToSplit',
          placeholder: 'Amount of tokens',
          expectType: 'number', // should check (?)
        },
        {
          type: 'input',
          label: 'Parent Collection ID',
          name: 'parentCollectionId',
          htmlFor: 'parentCollectionId',
          placeholder: 'parentCollectionId',
          expectType: 'any', // should check (?)
        },
        {
          type: 'input',
          label: 'Condition ID',
          name: 'conditionId',
          htmlFor: 'conditionId',
          placeholder: 'conditionId',
          expectType: 'any', // should check (?)
        },
        {
          type: 'input',
          label: 'Distribution',
          info:
            'Comma separated values representing bit arrays of possible results',
          name: 'distribution',
          htmlFor: 'distribution',
          placeholder: 'comma separated responses index as in bit array',
          expectType: 'any', // check for arrays
          modifiers: ['convertToArray'],
        },
      ],
    ],
  },
  REPORT_PAYOUTS: {
    id: 'REPORT_PAYOUTS',
    title: 'Resolve a condition',
    description: 'Sets the payout array for a condition',
    type: PROPOSAL_TYPES.REPORT_PAYOUTS,
    minionType: MINION_TYPES.SAFE,
    dev: true,
    logValues: true,
    tx: TX.REPORT_PAYOUTS,
    required: ['questionId', 'selectedMinion', 'payouts'],
    fields: [
      [FIELD.TITLE, FIELD.DESCRIPTION, FIELD.MINION_SELECT],
      [
        {
          type: 'conditionSplitting',
          label: 'Condition',
          name: 'response',
          htmlFor: 'response',
          placeholder: 'response',
        },
      ],
    ],
  },
  TRANSFER_CONDITIONAL: {
    id: 'TRANSFER_CONDITIONAL',
    title: 'Transfer conditional tokens',
    description: 'Currently only safeBatchTransfer (add form condition)',
    type: PROPOSAL_TYPES.TRANSFER_CONDITIONAL,
    minionType: MINION_TYPES.SAFE,
    dev: true,
    logValues: true,
    tx: TX.TRANSFER_CONDITIONAL,
    required: ['beneficiary', 'tokenIds', 'amounts'],
    fields: [
      [
        [FIELD.TITLE, FIELD.MINION_SELECT],
        {
          type: 'input',
          label: 'To',
          name: 'beneficiary',
          htmlFor: 'beneficiary',
          placeholder: 'Beneficiary address',
          expectType: 'address',
        },
        {
          type: 'contributorRewardListInput', // improve
          label: 'Ids',
          info: 'Comma separated ids of the positions',
          name: 'tokenIds',
          htmlFor: 'tokenIds',
          placeholder: 'xx,yy,',
          expectType: 'any', // check for arrays
          modifiers: ['convertToArray'],
        },
        {
          type: 'input',
          label: 'Amounts',
          info: 'Comma separated amounts for each subId',
          name: 'amounts',
          htmlFor: 'amounts',
          placeholder: 'xx,yy,',
          expectType: 'any', // check for arrays
          modifiers: ['convertToArray'],
        },
      ],
    ],
  },
  /* BURN_CONDITIONALS: {
    id: 'BURN_CONDITIONALS',
    title: 'Burn conditional tokens in minion possesion - WIP',
    description:
      'Use (after distribution) it to unrelate the minion position in the game',
    type: PROPOSAL_TYPES.BURN_CONDITIONALS,
    minionType: MINION_TYPES.SAFE,
    dev: true,
    logValues: true,
    tx: TX.BURN_CONDITIONALS,
    required: ['tokenIds'],
    fields: [
      [
        [FIELD.TITLE, FIELD.MINION_SELECT],
        {
          type: 'contributorRewardListInput', // improve
          label: 'Ids',
          info: 'Comma separated ids of the positions',
          name: 'tokenIds',
          htmlFor: 'tokenIds',
          placeholder: 'xx,yy,',
          expectType: 'any', // check for arrays
          modifiers: ['convertToArray'],
        },
      ],
    ],
  }, */
  /*SOLVE_BET: {
    id: 'SOLVE_BET',
    title: 'Solve a bet for groups of users WIP',
    description:
      'Distribute conditional tokens to users collateralized with an ERC20',
    type: PROPOSAL_TYPES.SOLVE_BET,
    minionType: MINION_TYPES.SAFE,
    dev: true,
    logValues: true,
    tx: null, // TX.SOLVE_BET,
    required: [],
    fields: [
      [
        [
          FIELD.TITLE,
          FIELD.MINION_SELECT,
          { ...FIELD.MINION_PAYMENT, label: 'Funds to split' },
          {
            type: 'input',
            label: 'Oracle',
            name: 'oracle',
            htmlFor: 'oracle',
            placeholder: 'Setter of condition result',
            expectType: 'address',
          },
          {
            type: 'input',
            label: 'Number of results',
            info:
              'Number of possible outcomes (not to be confused with collections)',
            name: 'conditionResults',
            htmlFor: 'conditionResults',
            placeholder: 'Possible results',
            expectType: 'number',
          },
        ],
      ],
      [FIELD.DISPERSE_CSV],
    ],
  }, */
};
