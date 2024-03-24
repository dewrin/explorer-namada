import React, { useState, useEffect } from "react";
import { NavLink as Link } from 'react-router-dom';

function Navbar () {
    const [pageURL, setPageURL] = useState(0);

    useEffect(() => {
        const arrayA = window.location.href.split("/")
        if(arrayA[arrayA.length - 1] === 'blocks' || arrayA[arrayA.length - 2] === 'blocks') {
            setPageURL("BLOCKS");
        } else if (arrayA[arrayA.length - 1] === 'search' || arrayA[arrayA.length - 2] === 'search') {
            setPageURL("SEARCH");
        } else if (arrayA[arrayA.length - 1] === 'validators' || arrayA[arrayA.length - 2] === 'validators') {
            setPageURL("VALIDATORS");
        } else {
            setPageURL("HOME");
        }
    })

    return (
        <div>
            <div className='z-10 p-6 bg-[#FFEA00] space-y-10 w-70'>
                <div className='rounded-md flex-1 flex items-center justify-center space-x-4 p-4 font-semibold text-black bg-[#212529]'>
                    <Link onClick={() => {setPageURL("HOME");}} to='/'className={`rounded-md bg-white flex items-center space-x-4 justify-center w-20 py-2`}>
                        <div>Home</div>
                    </Link>
                    <Link onClick={() => {setPageURL("VALIDATORS");}} to='/validators' className={`rounded-md bg-white flex items-center space-x-4 justify-center w-28 py-2`}>
                        <div>Validators</div>
                    </Link>
                    <Link onClick={() => {setPageURL("BLOCKS");}} to='/blocks' className={`rounded-md bg-white flex items-center space-x-4 justify-center w-20 py-2`}>
                        <div>Blocks</div>
                    </Link>
                    <Link onClick={() => {setPageURL("SEARCH");}} to='/search' className={`rounded-md bg-white flex items-center space-x-4 justify-center w-20 py-2`}>
                        <div>Search</div>
                    </Link>
                </div> 
            </div>
        </div>
    )
}

export default Navbar;