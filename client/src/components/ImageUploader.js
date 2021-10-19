
import { useState, useRef } from "react";
import ImageResizer from "./ImageResizer";
import Previewer from "./Previewer";
import styles from '../styles/upload.module.scss';
import spinner from '../images/spinner.gif';

const ImageUploader = ({ onUpload }) => {
    const [files, setFile] = useState([]);
    const [uploading, toggleUpload] = useState(false);
    const [selectedRes, setRes] = useState('');
    const fileInput = useRef(null);

    const handleFile = (e) => {
        if (e.target.files.length < 5) {
            e.preventDefault();
            return;
        }
        setFile(e.target.files);
    }

    const uploadToBucket = () => {
        toggleUpload(true);
        const data = new FormData();
        data.append('resizeBy', selectedRes.split(' x ')[0]);
        for (const file of files) {
            data.append('file', file, file.name);
        }

        fetch("/api/upload", {
            method: 'POST',
            body: data,
        })
            .then((res) => res.json())
            .then((data) => {
                toggleUpload(false);
                let list = data.fileStatus.map((item) => {
                    let host = new URL(item.url).hostname;
                    let resizedUrl = `https://${host}/resized-${item.file}`;
                    return {
                        url: resizedUrl,
                        uploaded: false,
                    }
                })
                onUpload(list);
            })
    }

    const uploadDisabled = false;

    return (
        <div className="border-solid rounded border-2 py-5 px-10 border-black">
            <label htmlFor="file-upload" className={`${styles.upload_label} ${uploadDisabled ? styles.disabled : ''} mb-3`}>
                Browse Files
            </label>
            <input
                id="file-upload"
                type="file"
                ref={fileInput}
                onChange={handleFile}
                accept="image/png, image/jpeg"
                multiple
                disabled={uploadDisabled}
            />
            <Previewer list={files} />
            <ImageResizer resVal={selectedRes} resUpdate={(e) => { setRes(e) }} />
            <button className={`${selectedRes ? '' : 'hidden'} btn`} onClick={uploadToBucket} >
                Upload Files
                {uploading && <img src={spinner} className='spinner' />}
            </button>
        </div>
    )
}


export default ImageUploader;