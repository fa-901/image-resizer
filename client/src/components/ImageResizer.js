import { useState } from "react";
import styles from '../styles/resize.module.scss';

const resList = [
    {
        width: 100,
        height: 100,
    },
    {
        width: 200,
        height: 200,
    },
    {
        width: 300,
        height: 300,
    }
]

const ImageResizer = () => {
    const [selectedRes, setRes] = useState('');


    const radioList = resList.map((item) => {
        const key = `${item.height} x ${item.width}`;
        return (
            <label key={key}>
                <input
                    type="radio"
                    value={key}
                    checked={selectedRes === key}
                    onChange={() => { setRes(key) }}
                />
                {key}
            </label>
        )
    });
    return (
        <>
            <div className='flex justify-center mb-3'>
                <label className='mr-5'>Select Resolution:</label>
                <div className={styles.res_radio}>
                    {radioList}
                </div>
            </div>
            <button className={`${selectedRes ? '' : 'hidden'} btn`}>
                Upload Files
            </button>
        </>
    )
}

export default ImageResizer;