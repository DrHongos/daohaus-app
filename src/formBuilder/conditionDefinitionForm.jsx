import React, { useEffect, useState } from 'react';
import { Spinner } from '@chakra-ui/react';
import bs58 from 'bs58';

import { ipfsJsonPin } from '../utils/metadata';
import { useDao } from '../contexts/DaoContext';
import GenericInput from './genericInput';
import GenericSelect from './genericSelect';
import MinionSelect from './minionSelect';
import MinionPayment from './minionPayment';
import GenericTextArea from './genericTextArea';
import ModButton from './modButton';
import { getActiveMembers } from '../utils/dao';
import { handleGetProfile } from '../utils/3box';
import { isEthAddress, truncateAddr } from '../utils/general';
import { lookupENS } from '../utils/ens';
import { useInjectedProvider } from '../contexts/InjectedProviderContext';
// TODO: define the structure of the condition
// minimum outcomes = 2
// oracle (filter models to get the address on all models)
// create conditional multiTx where a payment is sent to the oracle (if value !=0)
// (can we have a list of known DAO's oracles?)
// on a different minion selection for oracle, set the safeAddress!
// validation! (its not working!) and only then submit
// onSubmit seems to delete values.data...

const ModButtonWithLoading = ({ loading, fn }) => {
  return (
    <>
      {loading && <Spinner mr={2} />}
      <ModButton text='Load condition manifesto' fn={fn} />
    </>
  );
};

const ConditionDefinitionForm = props => {
  const { daoMembers } = useDao();
  const { name, localForm } = props;
  const { address } = useInjectedProvider();
  const [oracleMode, setOracleMode] = useState('Address');
  const [userAddresses, setAddresses] = useState([]);
  const [helperText, setHelperText] = useState('Use ETH address or ENS');
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [ipfsHash, setIpfsHash] = useState(null);
  const [uploadingIpfs, setUploadingIpfs] = useState(false);

  const { setValue } = localForm;

  const oraclesModels = [
    {
      name: 'Address',
      value: 'Address',
    },
    {
      name: 'List of DAO minions',
      value: 'Minions',
    },
    {
      name: 'This minion',
      value: 'self',
    },
    {
      name: 'Your address',
      value: 'Me',
    },
    {
      name: 'A member',
      value: 'Member',
    },
  ];

  useEffect(() => {
    if (props.values?.typeOracle) {
      setOracleMode(props.values.typeOracle);
      if (props.values?.typeOracle == 'self') {
        setValue('oracle', props.values.selectedSafeAddress);
      } else if (props.values?.typeOracle == 'Me') {
        setValue('oracle', address);
      } else {
        setValue('oracle', null);
      }
    }
  }, [props.values.typeOracle]);

  useEffect(() => {
    let shouldSet = true;
    const fetchMembers = async () => {
      setLoadingMembers(true);
      const memberProfiles = await Promise.all(
        getActiveMembers(daoMembers)?.map(async member => {
          const profile = await handleGetProfile(member.memberAddress);
          if (!profile) {
            return {
              name: profile.name || truncateAddr(member.memberAddress),
              value: member.memberAddress,
            };
          }
          return {
            name: truncateAddr(member.memberAddress) || member.memberAddress,
            value: member.memberAddress,
          };
        }),
      );
      if (shouldSet) {
        setAddresses(memberProfiles);
      }
      setLoadingMembers(false);
    };
    if (daoMembers) {
      fetchMembers();
    }
    return () => {
      shouldSet = false;
    };
  }, [daoMembers]);

  const handleLookupENS = async ens => {
    setHelperText(<Spinner />);
    const result = await lookupENS(ens);
    if (result) {
      setHelperText(ens);
      setValue(name, result);
    } else {
      setHelperText('No ENS Set');
    }
  };

  const checkApplicant = e => {
    if (e?.target?.value == null) return;
    const input = e.target.value;
    if (isEthAddress(input)) {
      setHelperText('Valid Address');
    } else if (input.endsWith('.eth')) {
      handleLookupENS(input);
    } else {
      setHelperText('Use ETH address or ENS');
    }
  };

  const prepareHash = async () => {
    const key = {
      // TODO: this should be daoHaus keys
      pinata_api_key: 'c71bd8a1afdbaf103a35',
      pinata_api_secret:
        '2abf7be4f9a85818d7c9c4121ed32b5830fbe32e300a3cae43a65a0d9d62ef41',
    };
    setUploadingIpfs(true);
    const manifesto = props.values;
    console.log(`manifesto ${JSON.stringify(manifesto)}`);
    const pinataData = await ipfsJsonPin(key, manifesto);
    if (pinataData.error) return;
    const decoded = bs58.decode(pinataData.IpfsHash);
    const cidToBytes32 = `0x${decoded.slice(2).toString('hex')}`;
    setUploadingIpfs(false);
    setIpfsHash(pinataData.IpfsHash);
    setValue('questionId', cidToBytes32);
  };

  return (
    <>
      <GenericInput
        {...props}
        label='Condition'
        placeholder='Describe the condition'
        name='condition'
        info='Define an event'
        disabled={ipfsHash}
      />
      <GenericSelect
        {...props}
        label='Oracle'
        name='typeOracle'
        info='Address that resolves the condition'
        options={oraclesModels}
        disabled={ipfsHash}
      />
      {oracleMode == 'Address' && (
        <GenericInput
          {...props}
          name='oracle'
          label='Oracle address or ENS'
          expectType='address'
          onChange={checkApplicant}
          placeholder='0x..'
        />
      )}
      {oracleMode == 'Minions' && (
        <MinionSelect
          {...props}
          name='oracle'
          label='Select oracle minion'
          disabled={ipfsHash}
        />
      )}
      {oracleMode == 'Member' && (
        <GenericSelect
          {...props}
          options={userAddresses}
          name='oracle'
          label='Other member as oracle'
          disabled={ipfsHash}
        />
      )}
      {oracleMode != 'self' && (
        <MinionPayment
          {...props}
          name='paymentRequested'
          label='Payment to oracle'
        />
      )}
      <GenericTextArea
        {...props}
        label='Description'
        placeholder='Expand your description of the condition'
        info='You can add sources of information, motivation for this condition, etc..'
        name='conditionDescription'
        disabled={ipfsHash}
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
                  disabled={ipfsHash}
                />
              );
            })}
          </>
        )}
      <ModButtonWithLoading
        name='preload'
        disabled={ipfsHash}
        loading={uploadingIpfs}
        fn={prepareHash}
        style={{ marginBottom: '30px' }}
      />
      {ipfsHash && (
        <div
          style={{
            marginBottom: '40px',
            marginTop: '30px',
            fontWeight: 900,
            color: 'white',
          }}
        >
          <a
            target='_blank'
            rel='noreferrer noopener'
            href={`https://ipfs.io/ipfs/${ipfsHash}`}
          >
            Condition Manifesto
          </a>
        </div>
      )}
    </>
  );
};

export default ConditionDefinitionForm;
