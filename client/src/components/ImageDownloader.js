import { useEffect, useState } from 'react';
import styles from '../styles/preview.module.scss';

const ImageDownloader = ({ urlData }) => {
    const [imgURL, setImg] = useState(urlData);

    useEffect(() => {
        if (imgURL.length > 1) {
            let notUploaded = imgURL.some((img) => img.uploaded === false)
            if (notUploaded) {
                setTimeout(checkUploaded, 5000);
            }
        }
    }, [imgURL]);

    function checkImage(src, good, bad) {
        var img = new Image();
        img.onload = good;
        img.onerror = bad;
        img.src = src;
    }


    const checkUploaded = () => {
        imgURL.map((img, index) => {
            checkImage(img.url,
                function () {
                    console.log('ok')
                    let temp = [...imgURL];
                    temp[index].uploaded = true;
                    setImg(temp);
                },
                function () {

                });
        });
    }

    let downloadList = imgURL.map((img) => {
        return (
            <div key={img.file} className={`border p-2 rounded`} >
                <label className='mr-3'>
                    {img.file}
                </label>
                <a className="btn" href={img.url} download>
                    Download
                </a>
            </div>
        )
    });
    

    return (
        <div className="border-solid rounded border-2 mt-5 py-5 px-10 border-black">
            <h1 className="text-l">Resized Images</h1>
            <div className='grid grid-cols-1 gap-4'>
                {downloadList}
            </div>
        </div>
    )
}

export default ImageDownloader;