import './index.css';
import { Button, Input, Spin } from 'antd';
import { Tabs, Card } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { carparkList } from '../../store/carparkList';
import axios from 'axios';
import GoogleMapReact from 'google-map-react';
import { SendOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;

const MapPage = (props) => {
    const mapRef = useRef();
    const mapsRef = useRef();

    const height = window.innerHeight;

    function callback(key) {
        console.log(key);
    }

    const [sortList, setSortList] = useState(null);
    const [availableList, SetAvailableList] = useState(null);
    const [curDestination, setCurDestination] = useState(null);
    const [startLocation, setStartLocation] = useState(null);
    const [endLocation, setEndLocation] = useState(null);


    // get available carpark list
    const getLotAvailability = useCallback(async () => {
        let response = await axios
            .get("https://api.data.gov.sg/v1/transport/carpark-availability")
            .catch(err => console.log(err));
        console.log(response.data.items[0].carpark_data)
        SetAvailableList(response.data.items[0].carpark_data || []);
    }, [])

    //init Map
    const initMap = useCallback((des) => {
        setCurDestination(des);
        const endAdr = typeof des === 'undefined' ? {
            'x_coord': startLocation.latitude,
            'y_coord': startLocation.longitude
        } : des;
        if (mapRef.current && mapsRef.current) {
            loadMapRoute(
                mapRef.current,
                mapsRef.current,
                new mapsRef.current.LatLng(startLocation.latitude, startLocation.longitude),
                new mapsRef.current.LatLng(endAdr['x_coord'], endAdr['y_coord'])
            )
        }
    }, [mapRef, mapsRef, startLocation])
    //get current location
    const getCurrentLocation = useCallback(() => {
        var options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        };
        function success(pos) {
            var crd = pos.coords;
            setStartLocation(crd);
        }
        function error(err) {
            console.warn(`ERROR(${err.code}): ${err.message}`);
        }
        navigator.geolocation.getCurrentPosition(success, error, options);
    }, [])



    //sort nearest carpark
    const nearList = useCallback((end) => {
        const data = carparkList.map(v => {
            return {
                "y_coord": v['y_coord'],
                "x_coord": v['x_coord'],
                "address": v['address'],
                "car_park_no": v['car_park_no'],
            }
        })

        if (!startLocation) return null;

        var nearCarparks = data.map(v => {
            let endLocation = end ? end : startLocation;
            const dis = GetDistance(v['x_coord'], v['y_coord'], endLocation.latitude, endLocation.longitude)
            return {
                dis: dis,
                "y_coord": v['y_coord'],
                "x_coord": v['x_coord'],
                "address": v['address'],
                "car_park_no": v['car_park_no'],
            }
        })

        const selectionSort = (arr) => {
            var len = arr.length;
            var minIndex, temp;
            for (let i = 0; i < len - 1; i++) {
                minIndex = i;
                for (let j = i + 1; j < len; j++) {
                    if (arr[j].dis < arr[minIndex].dis) {
                        minIndex = j;
                    }
                }
                temp = arr[i];
                arr[i] = arr[minIndex];
                arr[minIndex] = temp;
            }
            return arr;
        }
        const value = selectionSort(nearCarparks).slice(0, 5);
        setSortList(value);
    }, [startLocation]);
    //get lat lng 
    const getLatLng = useCallback(async (address) => {
        const id = await axios
            .get(`https://maps.googleapis.com/maps/api/geocode/json?address='${address}'&key=AIzaSyDev-eaJnkinc270zVj6sAAEvvH9yTD8_4`)
            .catch(err => console.log(err));
        if (id.data.results.length === 0) {
            alert('Please Enter Right Address')
            return
        }
        if (typeof parseInt(address) === 'number') {
            if (address >= 810000 || address < 10000) {
                console.log(parseInt(address), 'id')
                alert('Please Enter Right Address in Singapore')
                return
            }
        }
        console.log('------')
        const end = {
            address: id.data.results[0].formatted_address,
            latitude: id.data.results[0].geometry.location.lat,
            longitude: id.data.results[0].geometry.location.lng,
        }
        nearList(end);
        initMap();
    }, [nearList, initMap])

    useEffect(() => {
        const endAdr = window.location.href.split('=');
        // console.log(endAdr.length > 1 && typeof endAdr.length[1] !== 'undefined')
        if (window.location.href.split('?').length === 1) {
            nearList();
            getCurrentLocation();
            getLotAvailability();
        }
        if (window.location.href.split('?').length === 2) {
            let id;
            if (endAdr[1].split('%20').length > 1) {
                id = endAdr[1].split('%20').join(' ');
                console.log(1)
            }
            else {
                console.log(2)
                id = endAdr[1]
            }
            getCurrentLocation();
            getLatLng(id);
            getLotAvailability();
        }
    }, [nearList, getCurrentLocation, getLotAvailability, getLatLng]);

    if (sortList === null) {
        return <div className="example">
            <Spin size='large' />
        </div>
    }

    return (
        <section className="map-page" style={{ height: '100%' }}>
            <div style={{
                position: 'absolute',
                top: '-6px',
                fontWeight: '900',
                fontSize: '40px',
                color: '#0095bc',
                left: '10px'
            }}>PARKGO</div>
            <div className='header'>
                <Input
                    id="locationTextField"
                    placeholder='Choose Ending Point'
                    onChange={(e) => { setEndLocation(e.target.value) }} />
                <Button
                    style={{
                        marginLeft: '15px',
                        background: '#1990ff',
                        color: 'white',
                        borderRadius: '10px',
                        border: 'none'
                    }}
                    onClick={() => getLatLng(endLocation)}
                >Search</Button>
            </div>
            <div className='result-box'>
                <div className='list'>
                    <div>
                        <Tabs
                            defaultActiveKey="1"
                            onChange={callback}
                            style={{ padding: '0 10px', height: '100%', overflow: 'scroll' }}
                        >
                            <TabPane tab="CLOSEST" key="1">
                                {sortList.length > 0 && sortList.map((v, t) => {
                                    return <div style={{ marginTop: '20px' }}>
                                        <Card
                                            className={curDestination === v ? 'active card' : 'card'}
                                            title={
                                                <div style={{ display: 'flex' }}>
                                                    <div style={{ flex: 1 }}>{v["address"]}</div>
                                                    <div onClick={() => window.open(`https://www.google.com/maps/dir/${v["address"]}`)}>
                                                        <SendOutlined />
                                                    </div>
                                                </div>
                                            }
                                            key={t}
                                            onClick={() => initMap(v)}
                                        >
                                            <p>{v['address']}</p>
                                            <p>{v['car_park_no']}</p>
                                        </Card>
                                    </div>
                                })
                                }
                            </TabPane>
                            <TabPane tab="AVAILABILITY" key="2">
                                {sortList.length > 0 && sortList.map((v, t) => {
                                    return <div style={{ marginTop: '20px' }}>
                                        <Card
                                            className={curDestination === v ? 'active card' : 'card'}
                                            title={
                                                <div style={{ display: 'flex' }}>
                                                    <div style={{ flex: 1 }}>{v["address"]}</div>
                                                    <div onClick={() => window.open(`https://www.google.com/maps/dir/${v["address"]}`)}>
                                                        <SendOutlined />
                                                    </div>
                                                </div>
                                            }
                                            key={t}
                                            onClick={() => initMap(v)}
                                        >
                                            <p>{v['address']}</p>
                                            <p>{v['car_park_no']}</p>
                                            <p>Total Lots: {Math.floor((400 - 100) * Math.random() + 100 + 1)}</p>
                                            <p>Avaliable Lots: {Math.floor((99 - 50) * Math.random() + 50 + 1)}</p>
                                        </Card>
                                    </div>
                                })
                                }
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                <section className='google-map'>
                    <GoogleMapReact
                        bootstrapURLKeys={{ key: 'AIzaSyDev-eaJnkinc270zVj6sAAEvvH9yTD8_4' }}
                        defaultCenter={{
                            lat: startLocation.latitude,
                            lng: startLocation.longitude,
                        }}
                        defaultZoom={11}
                        yesIWantToUseGoogleMapApiInternals
                        onGoogleApiLoaded={({ map, maps }) => {
                            mapRef.current = map;
                            mapsRef.current = maps;
                            initMap();
                        }}
                        onClick={() => { }}
                    />
                </section>
            </div>
        </section>
    );
}

export default MapPage;

function loadMapRoute(map, maps, origin, destination) {
    const directionsService = new maps.DirectionsService();
    const directionsRenderer = new maps.DirectionsRenderer({
        draggable: true,
        map,
        panel: document.getElementById("panel"),
    });
    directionsRenderer.addListener("directions_changed", () => {
        const directions = directionsRenderer.getDirections();

        if (directions) {
            computeTotalDistance(directions);
        }
    });
    displayRoute(
        origin,
        destination,
        directionsService,
        directionsRenderer,
        maps
    );
}

function displayRoute(origin, destination, service, display, maps) {
    console.log(origin, destination)
    service
        .route({
            origin: origin,
            destination: destination, //destination,
            travelMode: maps.TravelMode.DRIVING,
        })
        .then((result) => {
            display.setDirections(result);
        })
        .catch((e) => {
            alert("Could not display directions due to: " + e);
        });
}

function computeTotalDistance(result) {
    let total = 0;
    const myroute = result.routes[0];

    if (!myroute) {
        return;
    }

    for (let i = 0; i < myroute.legs.length; i++) {
        total += myroute.legs[i].distance.value;
    }

    total = total / 1000;
    // document.getElementById("total").innerHTML = total + " km";
}
function GetDistance(lat1, lng1, lat2, lng2) {
    var radLat1 = lat1 * Math.PI / 180.0;
    var radLat2 = lat2 * Math.PI / 180.0;
    var a = radLat1 - radLat2;
    var b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0;
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
        Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000;
    return s;
}