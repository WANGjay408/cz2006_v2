import { useState } from 'react';
import './index.css';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import axios from 'axios';

const Home = () => {
    const height = window.innerHeight;

    const [endLocation, setEndLoaction] = useState('');
    const [isModalVisible, setIsModalVisible] = useState(true);
    const [flag, setFlage] = useState(false);
    // const getLotAvailability = async () => {
    //     let response = await axios
    //         .get("https://api.data.gov.sg/v1/transport/carpark-availability")
    //         .catch(err => console.log(err));
    //     return response.data.items[0].carpark_data;
    // }

    return (
        <section className="home-page" style={{ height: height }}>
            <Modal
                title="Notice"
                okText="ALLOW"
                cancelText="BLOCK"
                visible={isModalVisible}
                onOk={() => { setFlage(true); setIsModalVisible(false) }}
                onCancel={() => { setFlage(false); setIsModalVisible(false) }}
            >
                <p>Allow pages to access current location hints？</p>
                <p style={{ fontSize: '14px', color: 'red' }}>**Notice: If not allow to access, functional button will be disable.</p>
            </Modal>
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
                <button className='btn'>
                    {!!flag ? <Link to={`/map-page?address=${endLocation}`}>
                        <span style={{ color: '#fff' }}>
                            Find Parking
                        </span>
                    </Link>
                        : <span style={{ color: '#fff' }}>
                            Find Parking
                        </span>
                    }
                </button>
            </div>
            <div className='near-me'>
                {!!flag ?
                    <Link to='/map-page'>
                        <span style={{ color: '#fff' }}>FIND PARKING NEAR ME</span>
                    </Link> :
                    <span style={{ color: '#fff' }}>FIND PARKING NEAR ME</span>
                }
            </div>

        </section>
    );
}

export default Home;
