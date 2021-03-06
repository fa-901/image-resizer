import styles from '../styles/loader.module.scss';

const LoaderBar = ({ percent }) => {
    return (
        <>
            <div className={`border-solid border border-black`}>
                <div className={`transition-all ${styles.progress}`} style={{ width: `${percent}%` }}>
                </div>
            </div>
            {(percent !== 0) && `${Math.round(percent * 10) / 10}%`}
        </>
    )
}

export default LoaderBar;