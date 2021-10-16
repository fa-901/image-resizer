
import { useState, useRef } from "react";
import styles from '../styles/upload.module.scss';

const ImageUploader = (onFileChange) => {
    const [files, setFile] = useState([]);
    const fileInput = useRef(null);

    const handleFile = (e) => {
        if (e.target.files.lenth < 5) {
            e.preventDefault();
            return;
        }
        setFile(e.target.files);
    }

    const uploadDisabled = false;

    return (
        <div className="border-solid rounded border-2 py-5 px-10 border-black">
            <label htmlFor="file-upload" className={`${styles.upload_label} ${uploadDisabled ? styles.disabled : ''}`}>
                📤 Upload Files
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
        </div>
    )
}


export default ImageUploader;