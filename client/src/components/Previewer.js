import styles from '../styles/preview.module.scss';
import LoaderBar from './LoaderBar';

const Previewer = ({ list }) => {
    let imgList = list.map((item) => {
        return (
            <div key={item.url} className={`${styles.display} border p-2 rounded`} >
                <img src={item.url} alt="..." className={`${styles.img} rounded`} />
                <div className={styles.label}>
                    {item.name}
                </div>
                <LoaderBar percent={item.percent} />
            </div>
        )
    })
    return (
        <div className='flex flex-wrap space-x-4 mb-3'>
            {imgList}
        </div>
    )
}

export default Previewer;