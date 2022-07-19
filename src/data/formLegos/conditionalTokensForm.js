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
    required: ['condition', 'oracle', 'conditionResults'],
    fields: [
      [
        [FIELD.TITLE, FIELD.MINION_SELECT],
        {
          type: 'input',
          label: 'Condition',
          name: 'condition',
          htmlFor: 'condition',
          placeholder: 'Condition name',
          expectType: 'any',
        },
        {
          type: 'input',
          label: 'Condition Description',
          name: 'conditionDescription',
          htmlFor: 'conditionDescription',
          placeholder: 'Condition description',
          expectType: 'any',
        },
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
          name: 'conditionResults',
          htmlFor: 'conditionResults',
          placeholder: 'Possible results',
          expectType: 'number',
        },
      ],
    ],
  },
  SPLIT_POSITION: {
    id: 'SPLIT_POSITION',
    title: 'Fund conditional tokens',
    description: 'Mints the conditional tokens backed up by collateral',
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
        [FIELD.TITLE, FIELD.MINION_SELECT, FIELD.MINION_PAYMENT],
        {
          type: 'input',
          label: 'Condition ID',
          name: 'conditionId',
          htmlFor: 'conditionId',
          placeholder: 'conditionId',
          expectType: 'any', // should check (?)
        },
        // TODO
        // im getting fucked to convert a string to an array
        // anyway.. the correct method is reading the arguments
        // getOutcomeSlotCount(bytes32 conditionId)
        // and setting an input for each
        // then create an array
        {
          type: 'input',
          label: 'Distribution',
          name: 'distribution',
          htmlFor: 'distribution',
          placeholder:
            'comma separated relation of initial distribution for each response',
          expectType: 'arrayOfNumbers', // check for arrays
          modifiers: ['convertToArray'],
        },
      ],
    ],
    REPORT_PAYOUTS: {
      id: 'REPORT_PAYOUTS',
      title: 'Resolve a condition',
      description: 'Sets the payout array for a condition',
      type: PROPOSAL_TYPES.REPORT_PAYOUTS,
      minionType: MINION_TYPES.SAFE,
      dev: true,
      logValues: true,
      tx: null, //TX.REPORT_PAYOUTS,
      required: ['conditionId', 'selectedMinion', 'distribution'],
      fields: [
        [
          [FIELD.TITLE, FIELD.MINION_SELECT],
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
            name: 'distribution',
            htmlFor: 'distribution',
            placeholder: 'Distribution array',
            expectType: 'any', // check for arrays (or a better form obj)
          },
        ],
      ],
    },
  },
};
