
import { useState, useRef, useEffect } from "react";
import ImageResizer from "./ImageResizer";
import Previewer from "./Previewer";
import styles from '../styles/upload.module.scss';
import spinner from '../images/spinner.gif';
import io from 'socket.io-client';

const ImageUploader = ({ onUpload }) => {
    const [sock, setSock] = useState('');
    const [files, setFile] = useState([]);
    const [uploading, toggleUpload] = useState(false);
    const [selectedRes, setRes] = useState('');
    const fileInput = useRef(null);

    useEffect(() => {
        openUploadSocket();
    }, []);

    useEffect(() => {
        setProgress(sock);
    }, [sock]);

    const openUploadSocket = () => {
        var socket = io.connect('http://localhost:9001');
        socket.on('upload progress', (data) => {
            console.log(data);
            setSock(data);
        })
    }

    const setProgress = (data) => {
        if (!data) {
            return
        }
        let index = files.findIndex((item) => { return item.name === data.file })
        let newData = [...files];
        newData[index].percent = data.percent;
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
                let list = data.fileStatus.map((item) => {
                    let host = new URL(item.url).hostname;
                    let resizedUrl = `https://${host}/resized-${item.file}`;
                    return {
                        url: resizedUrl,
                        originalName: item.original,
                    }
                })
                onUpload(list);
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
            <Previewer list={files} />
            <ImageResizer resVal={selectedRes} resUpdate={(e) => { setRes(e) }} />
            <button className={`${selectedRes ? '' : 'hidden'} btn`} onClick={uploadToBucket} disabled={uploading} >
                Upload Files
                {uploading && <img src={spinner} className='spinner' alt='...' />}
            </button>
        </div>
    )
}


export default ImageUploader;