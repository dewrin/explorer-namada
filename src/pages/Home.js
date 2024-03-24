import { useEffect, useState, useMemo, useRef } from 'react';
import { NavLink as Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const useMap = () => {
    const [map, setMap] = useState(new Map());

    const actions = useMemo(
      () => ({
        set: (key, value) =>
          setMap(prevMap => {
            const nextMap = new Map(prevMap);
            nextMap.set(key, value);
            return nextMap;
          }),
        remove: (key) =>
          setMap(prevMap => {
            const nextMap = new Map(prevMap);
            nextMap.delete(key);
            return nextMap;
          }),
        clear: () => setMap(new Map()),
      }),
      [setMap]
    );
  
    return [map, actions];
  };

function Home () {
    const [blockData, { set, remove, clear }] = useMap();
    const[latestBlock, setLatestBlock] = useState(0)
    const[validatorData, setValidatorData] = useState({})
    const blockIs = useRef(0);
    const fetchBlock = 5;
    const navigate = useNavigate();

    const getBlockData = async () => {
        if(parseInt(blockIs.current) > 0) {
            const response = await fetch(process.env.REACT_APP_INDEXER_ENDPOINT + "/block/last");
            const _blockData = await response.json();
            const _latestBlock = _blockData["header"]["height"]
            if(_latestBlock !== blockIs.current) {
                let index = 0
                const currBlock = parseInt(blockIs.current)
                for(let i = currBlock + 1; i <= _latestBlock; i++) {
                    remove((currBlock - fetchBlock + 1 + index).toString())
                    const int_response = await fetch(process.env.REACT_APP_INDEXER_ENDPOINT + "/block/height/" + i);
                    const int_blockData = await int_response.json();
                    if(int_blockData !== null) {
                        set(int_blockData["header"]["height"], {
                            "block_time": int_blockData["header"]["time"],
                            "block_height": int_blockData["header"]["height"],
                            "block_hash": int_blockData["header"]["last_block_id"]["hash"],
                            "txn_hash": int_blockData["tx_hashes"],
                            "txn_size": int_blockData["tx_hashes"].length,
                            "proposer": int_blockData["header"]["proposer_address"]
                        })
                        index++;
                        setLatestBlock(_blockData["header"]) 
                        blockIs.current = _latestBlock
                    }
                }
            }
        }
    }

    useEffect(() => {
        (async () => {
            const _response = await axios.get(process.env.REACT_APP_RPC_ENDPOINT + "/validators")
            console.log(_response)
            setValidatorData(_response["data"]["result"])

            const response = await fetch(process.env.REACT_APP_INDEXER_ENDPOINT + "/block/last");
            const _blockData = await response.json();
            const _latestBlock = _blockData["header"]["height"]
            if(_blockData !== null && _blockData["header"] != null && _blockData["header"]["height"] !== null && _blockData["header"]["height"] >= 5) {
                for(let i = _latestBlock; i > _latestBlock - fetchBlock; i--) {
                    const int_response = await fetch(process.env.REACT_APP_INDEXER_ENDPOINT + "/block/height/" + i);
                    const int_blockData = await int_response.json();
                    set(int_blockData["header"]["height"], {
                        "block_time": int_blockData["header"]["time"],
                        "block_height": int_blockData["header"]["height"],
                        "block_hash": int_blockData["header"]["last_block_id"]["hash"],
                        "txn_hash": int_blockData["tx_hashes"],
                        "txn_size": int_blockData["tx_hashes"].length,
                        "proposer": int_blockData["header"]["proposer_address"]
                    })
                }
                setLatestBlock(_blockData["header"]) 
                blockIs.current = _latestBlock
            }
            
        })();

        const interval = setInterval(() => {
            getBlockData();
        }, 5000);
      
        return () => clearInterval(interval);
    },[])

    function BlockPane ({ blockId }) {
        const _blockData = blockData.get(blockId)
        const timeDiff = new Date() - new Date(_blockData["block_time"]);
        let timeAgo = ""
        if(timeDiff < 1000) {
            timeAgo = timeDiff + " millisecs ago"
        } else if((timeDiff/1000) < 60) {
            timeAgo = parseInt((timeDiff/1000)) + " secs ago"
        } else if((timeDiff/60000) < 60) {
            timeAgo = parseInt((timeDiff/60000)) + " mins ago"
        } else if((timeDiff/360000) < 24){
            timeAgo = parseInt((timeDiff/3600000)) + " hours ago"
        } else {
            timeAgo = parseInt((timeDiff/86400000)) + " days ago"
        }
        return (
            <div className='flex items-center justify-between w-full border-t border-gray-500 py-4'>
                <div className='flex space-x-2'>
                    <div className='text-white flex items-center'>
                        <div class="bg-opacity-5 rounded-lg justify-center items-center gap-2.5 flex">
                            <div class="relative">
                                <div class="group-hover:text-v2-primary fill-current text-v2-lily/[.75]">
                                    <svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" focusable="false" class="chakra-icon css-19d0vrp" height="1.5em" width="1.5em" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='py-1 flex flex-col justify-between'>
                        <Link to={`/search/${_blockData["block_height"]}`}><button className='text-sm font-semibold underline'>#{_blockData["block_height"]}</button></Link>
                    </div>
                </div>
                <div className='text-[14px] w-[100px] truncate'>{_blockData["block_hash"]}</div>
                <div className='text-[14px] w-[120px] truncate'>{_blockData["proposer"]}</div>
                {/* <div className='text-[10px] sm:text-xs'></div> */}
                <div>{_blockData["txn_size"]}</div>
                <div className='text-[14px] truncate'>{timeAgo}</div>
            </div>
        )
    }

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
            <div className='p-3 text-2xl text-black font-semibold'> Chain Info</div>
            <div className='flex flex-col xl:flex-row items-center justify-center w-full space-y-3 xl:space-y-0 xl:space-x-4'>
                <div className='bg-[#212529] text-xl flex flex-col justify-center rounded-md w-full py-6 space-y-2 px-4'>
                    <div className='text-xl font-semibold'>Block Height</div>
                    <div>{latestBlock !== undefined ? latestBlock["height"] : ""}</div>
                </div>
                <div className='bg-[#212529] text-xl flex flex-col justify-center rounded-md w-full py-6 space-y-2 px-4'>
                    <div className='text-xl font-semibold'>Block Time</div>
                    <div className='text-lg'>{latestBlock !== undefined ? latestBlock["time"] : ""}</div>
                </div>
            </div>
            <div className='flex flex-col xl:flex-row items-center justify-center w-full py-4 space-y-3 xl:space-y-0 xl:space-x-4'>
                <div className='bg-[#212529] text-xl flex flex-col justify-center rounded-md w-full py-6 space-y-2 px-4'>
                    <div className='text-xl font-semibold'>Network</div>
                    <div>shielded-expedition.88f17d1d14</div>
                </div>
                <div className='bg-[#212529] text-xl flex flex-col justify-center rounded-md w-full py-6 space-y-2 px-4'>
                    <div className='text-xl font-semibold'>Total Validators</div>
                    <div>{validatorData !== undefined ? validatorData["total"] : ""}</div>
                </div>
            </div>
            <div className='p-4 pt-8 text-2xl text-black font-semibold'> Latest Blocks</div>
            <div className='bg-[#212529] w-full flex items-center justify-between space-x-6'>
                <div className='w-full px-6 rounded-md overflow-x-auto'>
                    <div className='py-6'>
                        <div className='flex justify-between py-4 font-bold'>
                            <div className='w-24'>block</div>
                            <div className='w-24'>hash</div>
                            <div>proposer</div>
                            <div>txns</div>
                            <div>age</div>
                        </div>
                        <div>
                            {
                                [...blockData.keys()].sort((a, b) => (b - a)).map((element) => {
                                    return (
                                        <BlockPane blockId={element}/>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className='p-4 pt-8 text-2xl text-black font-semibold'> Top Validators</div>
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