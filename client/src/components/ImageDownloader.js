import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { saveAs } from 'file-saver';
import spinner from '../images/spinner.gif';

const ImageDownloader = ({ urlData, onClearData }) => {
    const [sock, setSock] = useState('');
    const [allLoaded, setLoaded] = useState(false);
    const [imgURL, setImg] = useState(urlData);

    useEffect(() => {
        openWorkerSocket();
    }, []);

    useEffect(() => {
        setProgress(sock);
    }, [sock]);

    const setProgress = (data) => {
        let index = imgURL.findIndex((item) => { return item.fileName === data?.fileName });
        if (!data || index < 0) {
            return
        }
        let newData = [...imgURL];
        newData[index].resize = data.resize;
        newData[index].upload = data.upload;
        if (data.resizedURL) {
            newData[index].resizedURL = data.resizedURL;
        }
        setImg(newData);
    }

    const openWorkerSocket = () => {
        var socket = io.connect('http://localhost:9002');
        socket.on('worker data', (data) => {
            setSock(data);
        })
    }

    const downloadImg = (url, name) => {
        saveAs(url, name)
    }

    let readyCount = imgURL.reduce((acc, val) => {
        if (val.upload || val.resize) {
            return acc + 1
        }
        else return acc;
    }, 0);
    let isReady = readyCount === imgURL.length;

    let downloadList = imgURL
        .filter((item) => item?.upload || item?.resize)
        .map((img) => {
            return (
                <div key={img.fileName} className={`flex items-center border p-3 rounded`} >
                    <label className='mr-auto'>
                        {img.originalName}
                    </label>
                    {img.upload === 'success' ? (
                        <button className="btn" onClick={() => { downloadImg(img.resizedURL, img.fileName) }}>
                            Download
                        </button>
                    ) : <span className='text-red-500'>Failed To Resize.</span>}
                </div>
            )
        });

    return (
        <div className="border-solid rounded border-2 my-5 py-5 px-10 border-black">
            <div className='mb-3'>
                <h1 className="text-xl">Resized Images {!isReady && <img src={spinner} className='spinner' />}</h1>
                <h2>{readyCount}/{imgURL.length} Files Ready</h2>
                {allLoaded && <h3 className="text-red-500">
                    Your images are ready. You have 5 minutes to download.
                </h3>}
            </div>
            <div className='grid grid-cols-1 gap-4'>
                {downloadList}
            </div>
        </div>
    )
}

export default ImageDownloader;