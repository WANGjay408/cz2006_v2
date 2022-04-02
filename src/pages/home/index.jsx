import { useEffect, useState } from 'react';
import './index.css';
import axios from "axios";
import { Link } from 'react-router-dom';
import { carparkList } from '../../store/carparlList';

const Home = () => {
    const height = window.innerHeight;

    const [endLocation, setEndLoaction] = useState('');
    const getLotAvailability = async () => {
        let response = await axios
            .get("https://api.data.gov.sg/v1/transport/carpark-availability")
            .catch(err => console.log(err));
        return response.data.items[0].carpark_data;
    }


    useEffect(() => {
        // const list = carparkList.map(async (v) => {
        //     const data = await axios
        //         .get(`https://maps.googleapis.com/maps/api/geocode/json?address='${v.address}'&key=AIzaSyDev-eaJnkinc270zVj6sAAEvvH9yTD8_4`)
        //         .catch(err => console.log(err));
        //     const res = new Promise((resolve, reject) => {
        //         resolve('success');
        //         reject('fail')
        //     })
        //     res.then(cur => {
        //         return {
        //             ...v,
        //             "x_coord": cur.data.results[0].geometry.location.lat,
        //             "y_coord": cur.data.results[0].geometry.location.lng
        //         }
        //     }).catch(e => console.log(e))
        // })
        // console.log(list)
        // getLotAvailability();
        // console.log(carparkList)
    }, []);

    return (
        <section className="home-page" style={{ height: height }}>
            <div className='title'>
                PARKING JUST GET A LOT FASTER
            </div>
            <div className='search-box'>
                <input
                    className='input'
                    type='text'
                    value={endLocation}
                    placeholder='Search Place, Postol Code or District'
                    onChange={(e) => setEndLoaction(e.target.value)}
                />
                <button className='btn' onClick={() => { }}>
                    Find Parking
                </button>
            </div>
            <div className='near-me'>
                <Link to='/map-page'>
                    <span style={{ color: '#fff' }}>FIND PARKING NEAR ME</span>
                </Link>
            </div>
        </section>
    );
}

export default Home;
