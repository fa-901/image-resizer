
import { useState, useRef } from "react";
import ImageResizer from "./ImageResizer";
import Previewer from "./Previewer";
import styles from '../styles/upload.module.scss';

const ImageUploader = ({ onFileChange }) => {
    const [files, setFile] = useState([]);
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
        const data = new FormData();
        for (const file of files) {
            data.append('input_files', file, file.name);
        }

        fetch("/api/upload", {
            method: 'POST',
            body: data,
        })
            .then((res) => {
                if (res.ok) {
                    alert('Files uploaded to server');
                }
                else {
                    alert('Files could not be uploaded');
                }
            });
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
            </button>
        </div>
    )
}


export default ImageUploader;