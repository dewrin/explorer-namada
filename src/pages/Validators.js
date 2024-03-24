import { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';

function Home () {
    const[validatorData, setValidatorData] = useState({})

    useEffect(() => {
        (async () => {
            const _response = await axios.get(process.env.REACT_APP_RPC_ENDPOINT + "/validators")
            console.log(_response)
            setValidatorData(_response["data"]["result"])
        })();
    },[])

    function ValidatorPane ({ _validatorData }) {
        return (
            <div className='flex items-center justify-between w-full border-t border-gray-500 py-4'>
                <div className='text-[14px] w-content truncate'>{_validatorData["address"]}</div>
                <div className='text-[14px]'>{parseFloat(_validatorData["voting_power"]/1000000)} NAAN</div>
                <div>{_validatorData["proposer_priority"]}</div>
            </div>
        )
    }

    return (
        <div className='flex-1 w-full bg-[#FFEA00] px-6 text-white py-4'>
            <div className='p-4 text-2xl text-black font-semibold'> Top Validators</div>
            <div className='w-full flex items-center justify-between space-x-6'>
                <div className='w-full px-6 bg-[#212529] rounded-md overflow-x-scroll'>
                    <div className='py-6'>
                        <div className='flex justify-between py-4 font-bold text-md'>
                            <div className='w-64'>validator</div>
                            <div >voting power</div>
                            <div>priority</div>
                        </div>
                        <div>
                            {
                                JSON.stringify(validatorData) !== '{}' && validatorData !== undefined ? validatorData["validators"].map(element => {
                                    return (
                                        <ValidatorPane _validatorData={element}/>
                                    )
                                }) : ''
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Home;