
import { useState, useRef, useEffect } from "react";
import ImageResizer from "./ImageResizer";
import Previewer from "./Previewer";
import styles from '../styles/upload.module.scss';
import spinner from '../images/spinner.gif';
import io from 'socket.io-client';
import { UPLOAD_FILE_STATUS, UPLOAD_STATUS } from '../constants/localStorageKeys';

const ImageUploader = ({ onUpload }) => {
    const [sock, setSock] = useState('');
    const [files, setFile] = useState(localStorage.getItem(UPLOAD_FILE_STATUS) ? JSON.parse(localStorage.getItem(UPLOAD_FILE_STATUS)) : []);
    const [uploading, toggleUpload] = useState(localStorage.getItem(UPLOAD_STATUS) ? (JSON.parse(localStorage.getItem(UPLOAD_STATUS)) === 'true') : false);
    const [selectedRes, setRes] = useState('');
    const fileInput = useRef(null);

    useEffect(() => {
        openUploadSocket();
    }, []);

    useEffect(() => {
        setProgress(sock);
    }, [sock]);

    useEffect(() => {
        if (uploading) {
            localStorage.setItem(UPLOAD_FILE_STATUS, JSON.stringify(files));
        }
        localStorage.setItem(UPLOAD_STATUS, uploading);
        let allUploaded = files.every(item => item.percent === 100);
        if (allUploaded) {
            toggleUpload(false);
            let list = files.map((item) => {
                let host = new URL(item.uploadedURL).hostname;
                let path = new URL(item.uploadedURL).pathname.substring(1);
                let resizedUrl = `https://${host}/resized-${path}`;
                return {
                    url: resizedUrl,
                    originalName: item.name,
                }
            })
            onUpload(list);
        }
    }, [files, uploading]);

    const openUploadSocket = () => {
        var socket = io.connect('http://localhost:9001');
        socket.on('upload progress', (data) => {
            setSock(data);
        })
    }

    const setProgress = (data) => {
        let index = files.findIndex((item) => { return item.name === data?.file })
        if (!data || index < 0) {
            return
        }
        let newData = [...files];
        newData[index].percent = data.percent;
        if (data?.url) {
            newData[index].uploadedURL = data.url;
        }
        setFile(newData);
    }

    const handleFile = (e) => {
        if (e.target.files.length < 5) {
            e.preventDefault();
            return;
        }
        const fileList = [...e.target.files];
        let list = [];
        for (let i = 0; i < fileList.length; i++) {
            let url = URL.createObjectURL(fileList[i]);
            let name = fileList[i].name;
            list.push({ url, name, percent: 0 })
        }
        onUpload([]);
        setFile(list);
        setRes('');
    }

    const uploadToBucket = () => {
        toggleUpload(true);
        onUpload([]);
        const data = new FormData();
        data.append('resizeBy', selectedRes.split(' x ')[0]);
        for (const file of fileInput.current.files) {
            data.append('file', file, file.name);
        }

        fetch("/api/upload", {
            method: 'POST',
            body: data,
        })
            .then((res) => res.json())
            .then((data) => {
                toggleUpload(false);
                setRes('');
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
            <Previewer list={files} loading={uploading} />
            <ImageResizer resVal={selectedRes} resUpdate={(e) => { setRes(e) }} />
            <button className={`${selectedRes ? '' : 'hidden'} btn`} onClick={uploadToBucket} disabled={uploading} >
                Upload Files
                {uploading && <img src={spinner} className='spinner' alt='...' />}
            </button>
        </div>
    )
}


export default ImageUploader;