import { useEffect, useState } from 'react';
import spinner from '../images/spinner.gif';

const ImageDownloader = ({ urlData }) => {
    const [imgURL, setImg] = useState(urlData);

    useEffect(() => {
        let allReady = imgURL.every((item) => {
            return item?.uploaded === true;
        });
        if (!allReady) {
            setInterval(checkProgress, 5000);
        }
        else {
            clearInterval(checkProgress);
        }
    }, [imgURL]);

    function imageExists(url, callback) {
        const img = new Image();
        img.src = url;
        if (img.complete) {
            callback(true);
        } else {
            img.onload = () => {
                callback(true);
            };
            img.onerror = () => {
                callback(false);
            };
        }
    }

    const checkProgress = () => {
        urlData.map((item, index) => {
            imageExists(item.url, (cb) => {
                if (cb) {
                    let t = [...imgURL];
                    t[index].uploaded = true
                    setImg(t);
                }
            })
        })
    }

    let readyCount = imgURL.reduce((acc, val) => {
        if (val.uploaded) {
            return acc + 1
        }
        else return acc;
    }, 0);
    let isReady = readyCount === imgURL.length;

    let downloadList = imgURL
        .filter((item) => item?.uploaded === true)
        .map((img) => {
            return (
                <div key={img.url} className={`flex items-center border p-3 rounded`} >
                    <label className='mr-auto'>
                        {img.originalName}
                    </label>
                    <a className="btn" href={img.url} download>
                        Download
                    </a>
                </div>
            )
        });

    return (
        <div className="border-solid rounded border-2 my-5 py-5 px-10 border-black">
            <div className='mb-3'>
                <h1 className="text-xl">Resized Images {!isReady && <img src={spinner} className='spinner' />}</h1>
                <h2>{readyCount}/{imgURL.length} Files Ready</h2>
            </div>
            <div className='grid grid-cols-1 gap-4'>
                {downloadList}
            </div>
        </div>
    )
}

export default ImageDownloader;