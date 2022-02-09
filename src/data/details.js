import { MINION_TYPES } from '../utils/proposalUtils';

const HASH = {
  EMPTY_FIELD: 'e3bb180f-dda4-46e0-8ba5-7b24e7b00855',
  AWAITING_VALUE: '13345e28-135b-46ed-8047-716324197a6b',
  PROPS_MESSAGE: 'b136aa06-7d7c-42a3-824f-c92ed163b18a',
};
export const DETAILS = {
  STANDARD_PROPOSAL: {
    title: `.values.title`,
    description: `.values.description || ${HASH.EMPTY_FIELD}`,
    link: `.values.link || ${HASH.EMPTY_FIELD}`,
    proposalType: '.formData.type',
  },
  MINION_PROPOSAL: {
    title: `.values.title`,
    description: `.values.description || ${HASH.EMPTY_FIELD}`,
    link: `.values.link || ${HASH.EMPTY_FIELD}`,
    proposalType: '.formData.type',
    minionType: '.formData.minionType || .values.minionType',
  },
  VANILLA_MINION_PROPOSAL: {
    title: `.values.title`,
    description: `.values.description`,
    proposalType: '.formData.type',
    minionType: MINION_TYPES.VANILLA,
  },
  PAYROLL_PROPOSAL: {
    title: '.values.title || Minion sends a token',
    description: `.values.description || ${HASH.EMPTY_FIELD}`,
    link: `.values.link || ${HASH.EMPTY_FIELD}`,
    proposalType: '.formData.type',
    minionType: '.formData.minionType',
  },
  MINION_NFT_TRANSFER: {
    title: 'Minion sends a NFT',
    description: '.values.description',
    proposalType: '.formData.type',
  },
  MINION_SELL_NIFTY: {
    title: 'Minion sets Nifty price',
    description: '.values.description',
    proposalType: '.formData.type',
    minionType: MINION_TYPES.VANILLA,
  },
  MINION_BUY_NIFTY: {
    title: 'Minion Buys a NiftyInk',
    description: '.values.nftMetadata.name',
    link: '.values.nftMetadata.image',
    proposalType: '.formData.type',
    minionType: MINION_TYPES.NIFTY,
  },
  SUPERFLUID_STREAM: {
    title: `.values.title`,
    description: `.values.description || ${HASH.EMPTY_FIELD}`,
    link: `.values.link || ${HASH.EMPTY_FIELD}`,
    proposalType: '.formData.type',
    recipient: '.values.applicant',
    token: '.values.paymentToken',
    tokenRate: '.values.rateString',
  },
  SELL_NFT_RARIBLE: {
    title: 'Rarible NFT Sell Order',
    description: '.values.raribleDescription',
    link: '.values.image',
    proposalType: '.formData.type',
    minionType: MINION_TYPES.SAFE,
    orderIpfsHash: '.values.ipfsOrderHash',
    eip712HashValue: '.values.eip712HashValue',
  },
  SET_BUYOUT_TOKEN: {
    title: '.values.title',
    description: `.values.description || ${HASH.EMPTY_FIELD}`,
    link: `.values.link || ${HASH.EMPTY_FIELD}`,
    proposalType: '.formData.type',
    minionType: MINION_TYPES.SAFE,
  },
  SET_BUYOUT_NFT: {
    title: '.values.title',
    description: '.values.description',
    link: '.values.link',
    proposalType: '.formData.type',
    minionType: MINION_TYPES.SAFE,
  },
  OFFER_NFT_TRIBUTE: {
    title: '.values.title',
    description: '.values.description',
    link: '.values.image',
    proposalType: '.formData.type',
  },
  BUY_NFT_RARIBLE: {
    title: 'Rarible NFT Buy Order',
    description: '.values.nftDescription',
    link: '.values.image',
    proposalType: '.formData.type',
    minionType: MINION_TYPES.SAFE,
    orderIpfsHash: '.values.ipfsOrderHash',
    eip712HashValue: '.values.eip712HashValue',
  },
  DISPERSE_TOKEN: {
    title: '.values.title || Disperse Proposal',
    description: `.values.description || ${HASH.EMPTY_FIELD}`,
    link: '.values.link',
    proposalType: '.formData.type',
    minionType: MINION_TYPES.SAFE,
    token: '.values.tokenAddress',
  },
  DISPERSE_ETH: {
    title: '.values.title || Disperse Proposal',
    description: '.values.description',
    link: '.values.link',
    proposalType: '.formData.type',
    minionType: MINION_TYPES.SAFE,
  },
  UBERHAUS_DELEGATE: {
    title: `.values.title`,
    description: `.values.description || ${HASH.EMPTY_FIELD}`,
    link: `.values.link || ${HASH.EMPTY_FIELD}`,
    proposalType: '.formData.type',
    uberHaus: 'true',
    uberType: 'delegate',
  },
  UBERHAUS_STAKING: {
    title: `.values.title`,
    description: `.values.description || ${HASH.EMPTY_FIELD}`,
    link: `.values.link || ${HASH.EMPTY_FIELD}`,
    proposalType: '.formData.type',
    uberHaus: 'true',
    uberType: 'staking',
  },
  UBERHAUS_RAGEQUIT: {
    title: `UberHaus RageQuit`,
    description: `This is a proposal to ragequit from UberHaus`,
    proposalType: '.formData.type',
    uberHaus: 'true',
    uberType: 'ragequit',
  },
  UBERHAUS_WITHDRAW: {
    title: `.values.title`,
    description: `.values.description || ${HASH.EMPTY_FIELD}`,
    link: `.values.link || ${HASH.EMPTY_FIELD}`,
    proposalType: '.formData.type',
    uberHaus: 'true',
    uberType: 'withdraw',
  },
  UBERHAUS_PULL: {
    title: `.values.title`,
    description: `.values.description || ${HASH.EMPTY_FIELD}`,
    link: `.values.link || ${HASH.EMPTY_FIELD}`,
    proposalType: '.formData.type',
    uberHaus: 'true',
    uberType: 'pull',
  },
};
