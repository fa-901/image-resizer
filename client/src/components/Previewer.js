import styles from '../styles/preview.module.scss';

const Previewer = ({ list }) => {
    let imgList = [];
    for (let i = 0; i < list.length; i++) {
        let url = URL.createObjectURL(list[i]);
        let name = list[i].name;
        imgList.push(
            <div key={url} className={`${styles.display} border p-2 rounded`} >
                <img src={url} alt="..." className={`${styles.img} rounded`} />
                <div className={styles.label}>
                    {name}
                </div>
            </div>
        )
    }
    return (
        <div className='flex flex-wrap space-x-4 mb-3'>
            {imgList}
        </div>
    )
}

export default Previewer;