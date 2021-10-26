import { useState, useEffect } from "react";
import dayjs from 'dayjs';

const Timer = ({ onEnd, expiry }) => {
    const [time, setTime] = useState('05:00');

    useEffect(() => {
        let timer = setInterval(startTimer, 1000);
        return () => {
            clearInterval(timer);
        }
    }, [])

    function startTimer() {
        let remainingS = expiry.diff(dayjs(), 'second');
        if (remainingS === 0) {
            onEnd();
        }
        let min = Math.floor(remainingS / 60);
        let sec = remainingS - min * 60;
        sec = ('0' + sec).slice(-2);
        setTime(`0${min}:${sec}`);
    }


    return (
        <span className="text-red-500">
            {time}
        </span>
    )
}

export default Timer;